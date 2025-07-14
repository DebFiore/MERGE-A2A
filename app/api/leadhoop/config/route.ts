import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Get LeadHoop configuration for client
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const configs = await prisma.leadHoopConfig.findMany({
      where: {
        clientId: user.clientId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Parse JSON fields for response
    const parsedConfigs = configs.map(config => ({
      ...config,
      fieldMapping: JSON.parse(config.fieldMappingJson || '{}'),
      defaultValues: JSON.parse(config.defaultValuesJson || '{}')
    }))

    return NextResponse.json({ configs: parsedConfigs })

  } catch (error) {
    console.error('Error fetching LeadHoop configs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Create or update LeadHoop configuration
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!user.client.isActive) {
      return NextResponse.json(
        { error: 'Account suspended' },
        { status: 403 }
      )
    }

    const {
      portalUrl,
      portalId,
      fieldMapping,
      defaultValues,
      autoSubmit,
      retryAttempts,
      retryDelayMinutes
    } = await request.json()

    // Validate required fields
    if (!portalUrl || !portalId) {
      return NextResponse.json(
        { error: 'Portal URL and Portal ID are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(portalUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid portal URL format' },
        { status: 400 }
      )
    }

    // Check if configuration already exists
    const existingConfig = await prisma.leadHoopConfig.findFirst({
      where: {
        clientId: user.clientId,
        portalId: portalId
      }
    })

    let config
    if (existingConfig) {
      // Update existing configuration
      config = await prisma.leadHoopConfig.update({
        where: { id: existingConfig.id },
        data: {
          portalUrl,
          fieldMappingJson: JSON.stringify(fieldMapping || {}),
          defaultValuesJson: JSON.stringify(defaultValues || {}),
          autoSubmit: autoSubmit ?? true,
          retryAttempts: retryAttempts ?? 3,
          retryDelayMinutes: retryDelayMinutes ?? 5,
        }
      })
    } else {
      // Create new configuration
      config = await prisma.leadHoopConfig.create({
        data: {
          clientId: user.clientId,
          portalUrl,
          portalId,
          fieldMappingJson: JSON.stringify(fieldMapping || {}),
          defaultValuesJson: JSON.stringify(defaultValues || {}),
          autoSubmit: autoSubmit ?? true,
          retryAttempts: retryAttempts ?? 3,
          retryDelayMinutes: retryDelayMinutes ?? 5,
        }
      })
    }

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        fieldMapping: JSON.parse(config.fieldMappingJson),
        defaultValues: JSON.parse(config.defaultValuesJson)
      }
    })

  } catch (error) {
    console.error('Error creating/updating LeadHoop config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Delete LeadHoop configuration
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const configId = searchParams.get('id')

    if (!configId) {
      return NextResponse.json(
        { error: 'Configuration ID is required' },
        { status: 400 }
      )
    }

    // Verify the configuration belongs to the user's client
    const config = await prisma.leadHoopConfig.findFirst({
      where: {
        id: configId,
        clientId: user.clientId
      }
    })

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      )
    }

    // Deactivate instead of deleting to preserve logs
    await prisma.leadHoopConfig.update({
      where: { id: configId },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting LeadHoop config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
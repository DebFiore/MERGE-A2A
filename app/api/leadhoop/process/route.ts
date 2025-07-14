import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'
import LeadHoopService from '@/lib/leadhoop'

const prisma = new PrismaClient()

// POST - Manually process a lead through LeadHoop
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { leadId, priority } = await request.json()

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    // Verify the lead belongs to the user's client
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        clientId: user.clientId
      },
      include: {
        client: {
          include: {
            leadHoopConfigs: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Check if client has LeadHoop configuration
    if (lead.client.leadHoopConfigs.length === 0) {
      return NextResponse.json(
        { error: 'No active LeadHoop configuration found. Please configure LeadHoop settings first.' },
        { status: 400 }
      )
    }

    // Check if lead is already in queue
    const existingQueue = await prisma.automationQueue.findUnique({
      where: { leadId }
    })

    if (existingQueue && existingQueue.status === 'PROCESSING') {
      return NextResponse.json(
        { error: 'Lead is already being processed' },
        { status: 400 }
      )
    }

    // Add to queue or update existing queue item
    let queueItem
    if (existingQueue) {
      queueItem = await prisma.automationQueue.update({
        where: { id: existingQueue.id },
        data: {
          status: 'QUEUED',
          priority: priority || 1,
          nextAttemptAt: null,
          lastError: null
        }
      })
    } else {
      queueItem = await LeadHoopService.addToQueue(leadId, priority || 1)
    }

    // Update lead status if not already in progress
    if (lead.status !== 'ENTRY_IN_PROGRESS') {
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: 'ENTRY_IN_PROGRESS' }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Lead added to processing queue',
      queueItem: {
        id: queueItem.id,
        leadId: queueItem.leadId,
        status: queueItem.status,
        priority: queueItem.priority,
        attemptCount: queueItem.attemptCount
      }
    })

  } catch (error) {
    console.error('Error manually processing lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET - Get processing status for a specific lead
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    // Get lead processing status
    const [lead, queueItem, logs] = await Promise.all([
      prisma.lead.findFirst({
        where: {
          id: leadId,
          clientId: user.clientId
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true
        }
      }),

      prisma.automationQueue.findUnique({
        where: { leadId }
      }),

      prisma.automationLog.findMany({
        where: { leadId },
        orderBy: { queuedAt: 'desc' },
        take: 5
      })
    ])

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      lead,
      queueStatus: queueItem,
      recentLogs: logs
    })

  } catch (error) {
    console.error('Error getting lead processing status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
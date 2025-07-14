import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get user from session (simplified - in production use proper auth)
    const cookieStore = cookies()
    const userEmail = cookieStore.get('userEmail')?.value

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        preferencesJson: true,
        createdAt: true,
        client: {
          select: {
            id: true,
            name: true,
            company: true,
            subdomain: true,
            logo: true,
            website: true,
            industry: true,
            timezone: true,
            planType: true,
            isActive: true,
            settingsJson: true,
            monthlyCallLimit: true,
            callsUsed: true,
            minutesLimit: true,
            minutesUsed: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const userData = {
      ...user,
      preferences: user.preferencesJson ? JSON.parse(user.preferencesJson) : {},
      client: {
        ...user.client,
        settings: user.client.settingsJson ? JSON.parse(user.client.settingsJson) : {},
      }
    }

    // Remove JSON string fields
    delete (userData as any).preferencesJson
    delete (userData.client as any).settingsJson

    return NextResponse.json({
      success: true,
      user: userData
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
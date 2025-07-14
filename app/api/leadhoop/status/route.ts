import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'

const prisma = new PrismaClient()

// GET - Get LeadHoop automation status and statistics
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
    const timeframe = searchParams.get('timeframe') || '24h'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeframe) {
      case '1h':
        startDate.setHours(now.getHours() - 1)
        break
      case '24h':
        startDate.setDate(now.getDate() - 1)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      default:
        startDate.setDate(now.getDate() - 1)
    }

    // Get queue statistics
    const [
      queuedLeads,
      processingLeads,
      completedToday,
      failedToday,
      recentLogs,
      leadStatusCounts,
      processingTimes
    ] = await Promise.all([
      // Queued leads count
      prisma.automationQueue.count({
        where: {
          status: 'QUEUED',
          lead: { clientId: user.clientId }
        }
      }),

      // Currently processing leads
      prisma.automationQueue.count({
        where: {
          status: 'PROCESSING',
          lead: { clientId: user.clientId }
        }
      }),

      // Completed today
      prisma.automationLog.count({
        where: {
          success: true,
          queuedAt: { gte: startDate },
          lead: { clientId: user.clientId }
        }
      }),

      // Failed today
      prisma.automationLog.count({
        where: {
          success: false,
          queuedAt: { gte: startDate },
          lead: { clientId: user.clientId }
        }
      }),

      // Recent automation logs
      prisma.automationLog.findMany({
        where: {
          lead: { clientId: user.clientId },
          queuedAt: { gte: startDate }
        },
        include: {
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              status: true
            }
          }
        },
        orderBy: { queuedAt: 'desc' },
        take: 20
      }),

      // Lead status distribution
      prisma.lead.groupBy({
        by: ['status'],
        where: {
          clientId: user.clientId,
          status: {
            in: ['CONFIRMED', 'ENTRY_IN_PROGRESS', 'ENTERED', 'ENTRY_FAILED']
          }
        },
        _count: {
          status: true
        }
      }),

      // Processing time statistics
      prisma.automationLog.findMany({
        where: {
          lead: { clientId: user.clientId },
          queuedAt: { gte: startDate },
          processingTimeMs: { not: null }
        },
        select: {
          processingTimeMs: true,
          success: true
        }
      })
    ])

    // Calculate success rate
    const totalProcessed = completedToday + failedToday
    const successRate = totalProcessed > 0 ? (completedToday / totalProcessed) * 100 : 0

    // Calculate average processing time
    const validTimes = processingTimes
      .filter(log => log.processingTimeMs !== null)
      .map(log => log.processingTimeMs!)
    
    const avgProcessingTime = validTimes.length > 0 
      ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length 
      : 0

    // Process lead status distribution
    const statusDistribution = leadStatusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      summary: {
        queuedLeads,
        processingLeads,
        completedToday,
        failedToday,
        totalProcessed,
        successRate: Number(successRate.toFixed(2)),
        avgProcessingTimeMs: Math.round(avgProcessingTime)
      },
      statusDistribution,
      recentActivity: recentLogs.map(log => ({
        id: log.id,
        leadId: log.leadId,
        leadName: `${log.lead.firstName} ${log.lead.lastName}`,
        leadEmail: log.lead.email,
        leadStatus: log.lead.status,
        status: log.status,
        success: log.success,
        attemptNumber: log.attemptNumber,
        processingTimeMs: log.processingTimeMs,
        errorMessage: log.errorMessage,
        queuedAt: log.queuedAt,
        completedAt: log.completedAt
      })),
      timeframe
    })

  } catch (error) {
    console.error('Error fetching LeadHoop status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
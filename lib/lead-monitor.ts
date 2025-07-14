import { PrismaClient } from '@prisma/client'
import * as cron from 'node-cron'
import LeadHoopService from './leadhoop'
import AutomationEngine from './automation-engine'

const prisma = new PrismaClient()

export class LeadMonitor {
  private automationEngine: AutomationEngine
  private isProcessing: boolean = false
  private cronJob: cron.ScheduledTask | null = null

  constructor() {
    this.automationEngine = new AutomationEngine()
  }

  /**
   * Start the lead monitoring service
   */
  async start(): Promise<void> {
    console.log('🚀 Starting LeadHoop Lead Monitor...')

    // Initialize browser once
    await this.automationEngine.initBrowser()

    // Monitor for confirmed leads every 30 seconds
    this.cronJob = cron.schedule('*/30 * * * * *', async () => {
      if (!this.isProcessing) {
        await this.monitorConfirmedLeads()
      }
    })

    // Process queue every 10 seconds
    cron.schedule('*/10 * * * * *', async () => {
      if (!this.isProcessing) {
        await this.processQueue()
      }
    })

    // Cleanup old screenshots daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      await this.automationEngine.cleanupOldScreenshots(7)
    })

    console.log('✅ Lead Monitor started successfully')
  }

  /**
   * Stop the lead monitoring service
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping Lead Monitor...')
    
    if (this.cronJob) {
      this.cronJob.stop()
      this.cronJob = null
    }
    
    await this.automationEngine.closeBrowser()
    await prisma.$disconnect()
    
    console.log('✅ Lead Monitor stopped')
  }

  /**
   * Monitor for confirmed leads and add them to queue
   */
  private async monitorConfirmedLeads(): Promise<void> {
    try {
      // Find leads with CONFIRMED status that aren't already in queue or processing
      const confirmedLeads = await prisma.lead.findMany({
        where: {
          status: 'CONFIRMED',
          automationQueue: null // Not already in queue
        },
        include: {
          client: {
            include: {
              leadHoopConfigs: {
                where: { isActive: true }
              }
            }
          }
        },
        take: 10 // Process in batches
      })

      if (confirmedLeads.length === 0) {
        return
      }

      console.log(`📋 Found ${confirmedLeads.length} confirmed leads to process`)

      for (const lead of confirmedLeads) {
        try {
          // Check if client has LeadHoop configuration
          if (lead.client.leadHoopConfigs.length === 0) {
            console.warn(`⚠️ No LeadHoop config found for client ${lead.client.name} (${lead.clientId})`)
            continue
          }

          // Update lead status to indicate processing has started
          await prisma.lead.update({
            where: { id: lead.id },
            data: { status: 'ENTRY_IN_PROGRESS' }
          })

          // Add to automation queue
          await LeadHoopService.addToQueue(lead.id, 1) // High priority

          console.log(`✅ Added lead ${lead.id} to automation queue`)

        } catch (error) {
          console.error(`❌ Error processing confirmed lead ${lead.id}:`, error)
          
          // Reset status if there was an error
          try {
            await prisma.lead.update({
              where: { id: lead.id },
              data: { status: 'CONFIRMED' }
            })
          } catch (resetError) {
            console.error('Error resetting lead status:', resetError)
          }
        }
      }

    } catch (error) {
      console.error('❌ Error monitoring confirmed leads:', error)
    }
  }

  /**
   * Process the automation queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true

    try {
      // Get next lead from queue
      const queueItem = await LeadHoopService.getNextQueuedLead()
      
      if (!queueItem) {
        return // No leads to process
      }

      const { lead } = queueItem
      
      console.log(`🔄 Processing lead ${lead.id} from queue...`)

      // Update queue status to processing
      await LeadHoopService.updateQueueStatus(queueItem.id, 'PROCESSING')

      // Get LeadHoop configuration
      const leadHoopConfig = lead.client.leadHoopConfigs[0]
      
      if (!leadHoopConfig) {
        throw new Error('No active LeadHoop configuration found')
      }

      // Create automation log
      const automationLog = await LeadHoopService.createAutomationLog({
        leadId: lead.id,
        leadHoopConfigId: leadHoopConfig.id,
        status: 'IN_PROGRESS',
        attemptNumber: queueItem.attemptCount + 1
      })

      // Process the lead
      const result = await this.automationEngine.processLead(
        {
          id: lead.id,
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone || undefined,
          company: lead.company || undefined,
          state: lead.state || undefined,
          city: lead.city || undefined,
          zipCode: lead.zipCode || undefined,
          address: lead.address || undefined,
          country: lead.country || undefined,
          jobTitle: lead.jobTitle || undefined,
          alternatePhone: lead.alternatePhone || undefined,
          areaOfStudy: lead.areaOfStudy || undefined,
          source: lead.source || 'Unknown',
          customDataJson: lead.customDataJson || undefined
        },
        leadHoopConfig
      )

      // Update automation log with results
      await LeadHoopService.updateAutomationLog(automationLog.id, {
        status: result.success ? 'SUCCESS' : 'FAILED',
        success: result.success,
        responseDataJson: JSON.stringify(result.responseData),
        errorMessage: result.errorMessage,
        processingTimeMs: result.processingTimeMs,
        portalResponseCode: result.portalResponseCode,
        portalResponseMessage: result.portalResponseMessage,
        screenshotPath: result.screenshotPath
      })

      if (result.success) {
        // Success - update lead status and remove from queue
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: 'ENTERED' }
        })

        await LeadHoopService.updateQueueStatus(queueItem.id, 'COMPLETED')

        console.log(`✅ Successfully processed lead ${lead.id}`)

      } else {
        // Failed - handle retry logic
        const shouldRetry = queueItem.attemptCount < queueItem.maxAttempts
        
        if (shouldRetry) {
          // Calculate next attempt time (exponential backoff)
          const delayMinutes = Math.pow(2, queueItem.attemptCount) * leadHoopConfig.retryDelayMinutes
          const nextAttempt = new Date()
          nextAttempt.setMinutes(nextAttempt.getMinutes() + delayMinutes)

          await prisma.automationQueue.update({
            where: { id: queueItem.id },
            data: {
              status: 'QUEUED',
              attemptCount: queueItem.attemptCount + 1,
              nextAttemptAt: nextAttempt,
              lastError: result.errorMessage
            }
          })

          console.log(`🔄 Retrying lead ${lead.id} in ${delayMinutes} minutes (attempt ${queueItem.attemptCount + 1}/${queueItem.maxAttempts})`)

        } else {
          // Max attempts reached - mark as failed
          await prisma.lead.update({
            where: { id: lead.id },
            data: { status: 'ENTRY_FAILED' }
          })

          await LeadHoopService.updateQueueStatus(
            queueItem.id, 
            'FAILED', 
            result.errorMessage
          )

          console.log(`❌ Lead ${lead.id} failed after ${queueItem.attemptCount + 1} attempts`)
        }
      }

    } catch (error) {
      console.error('❌ Error processing queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Get monitoring statistics
   */
  async getStats(): Promise<{
    queuedLeads: number
    processingLeads: number
    confirmedLeads: number
    enteredLeads: number
    failedLeads: number
    todayProcessed: number
    successRate: number
  }> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [
        queuedLeads,
        processingLeads,
        confirmedLeads,
        enteredLeads,
        failedLeads,
        todayLogs
      ] = await Promise.all([
        prisma.automationQueue.count({ where: { status: 'QUEUED' } }),
        prisma.automationQueue.count({ where: { status: 'PROCESSING' } }),
        prisma.lead.count({ where: { status: 'CONFIRMED' } }),
        prisma.lead.count({ where: { status: 'ENTERED' } }),
        prisma.lead.count({ where: { status: 'ENTRY_FAILED' } }),
        prisma.automationLog.findMany({
          where: {
            queuedAt: { gte: today }
          },
          select: { success: true }
        })
      ])

      const todayProcessed = todayLogs.length
      const todaySuccessful = todayLogs.filter(log => log.success).length
      const successRate = todayProcessed > 0 ? (todaySuccessful / todayProcessed) * 100 : 0

      return {
        queuedLeads,
        processingLeads,
        confirmedLeads,
        enteredLeads,
        failedLeads,
        todayProcessed,
        successRate
      }

    } catch (error) {
      console.error('Error getting monitor stats:', error)
      return {
        queuedLeads: 0,
        processingLeads: 0,
        confirmedLeads: 0,
        enteredLeads: 0,
        failedLeads: 0,
        todayProcessed: 0,
        successRate: 0
      }
    }
  }

  /**
   * Manual trigger for processing a specific lead
   */
  async processLeadManually(leadId: string): Promise<boolean> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
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
        throw new Error('Lead not found')
      }

      if (lead.client.leadHoopConfigs.length === 0) {
        throw new Error('No LeadHoop configuration found for this client')
      }

      // Add to queue with high priority
      await LeadHoopService.addToQueue(leadId, 1)
      
      // Update lead status
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: 'ENTRY_IN_PROGRESS' }
      })

      console.log(`📋 Manually queued lead ${leadId} for processing`)
      return true

    } catch (error) {
      console.error(`Error manually processing lead ${leadId}:`, error)
      return false
    }
  }
}

export default LeadMonitor
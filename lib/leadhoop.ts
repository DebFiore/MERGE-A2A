import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface LeadHoopFieldMapping {
  phone1?: string
  email?: string
  ip?: string
  firstname?: string
  lastname?: string
  gender?: string
  age?: string
  dob?: string
  address?: string
  address2?: string
  zip?: string
  city?: string
  state?: string
  enrolled_status?: string
  grad_year?: string
  education_level_id?: string
  start_date?: string
  school_type_ids?: string
  military_type?: string
  level_interest?: string
  us_citizen?: string
  internet_pc?: string
  rn_license?: string
  teaching_license?: string
  area_study_ids?: string
  service_leadid?: string
  source_service_trusted_form?: string
  subid?: string
  subid2?: string
  subid3?: string
  subid4?: string
  pub_transaction_id?: string
  agent_id?: string
  agent_name?: string
  signup_url?: string
  consent_url?: string
  call_center_dba?: string
  inbound_transfer_dba?: string
  inbound_transfer_company?: string
  outbound_company?: string
  dialer_session_id?: string
}

export interface LeadData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  state?: string
  city?: string
  zipCode?: string
  address?: string
  country?: string
  jobTitle?: string
  alternatePhone?: string
  areaOfStudy?: string
  source?: string
  customDataJson?: string
}

export interface LeadHoopConfig {
  id: string
  clientId: string
  portalUrl: string
  portalId: string
  isActive: boolean
  fieldMappingJson: string
  defaultValuesJson: string
  autoSubmit: boolean
  retryAttempts: number
  retryDelayMinutes: number
}

export class LeadHoopService {
  
  /**
   * Get LeadHoop configuration for a client
   */
  static async getClientConfig(clientId: string): Promise<LeadHoopConfig | null> {
    try {
      const config = await prisma.leadHoopConfig.findFirst({
        where: {
          clientId,
          isActive: true
        }
      })
      
      return config as LeadHoopConfig | null
    } catch (error) {
      console.error('Error fetching LeadHoop config:', error)
      return null
    }
  }

  /**
   * Construct pre-filled LeadHoop URL
   */
  static constructUrl(
    baseUrl: string,
    leadData: LeadData,
    fieldMapping: LeadHoopFieldMapping,
    defaultValues: Record<string, any> = {}
  ): string {
    try {
      const url = new URL(baseUrl)
      
      // Apply field mappings
      const mappedData: Record<string, string> = {}
      
      // Map lead data to LeadHoop fields
      if (fieldMapping.firstname && leadData.firstName) {
        mappedData.firstname = leadData.firstName
      }
      
      if (fieldMapping.lastname && leadData.lastName) {
        mappedData.lastname = leadData.lastName
      }
      
      if (fieldMapping.email && leadData.email) {
        mappedData.email = leadData.email
      }
      
      if (fieldMapping.phone1 && leadData.phone) {
        // Clean phone number - remove non-digits
        mappedData.phone1 = leadData.phone.replace(/\D/g, '')
      }
      
      if (fieldMapping.city && leadData.city) {
        mappedData.city = leadData.city
      }
      
      if (fieldMapping.state && leadData.state) {
        mappedData.state = leadData.state
      }
      
      if (fieldMapping.zip && leadData.zipCode) {
        mappedData.zip = leadData.zipCode
      }
      
      if (fieldMapping.address && leadData.address) {
        mappedData.address = leadData.address
      }
      
      // Handle custom data if present
      if (leadData.customDataJson) {
        try {
          const customData = JSON.parse(leadData.customDataJson)
          
          // Map custom fields
          if (fieldMapping.age && customData.age) {
            mappedData.age = customData.age.toString()
          }
          
          if (fieldMapping.gender && customData.gender) {
            mappedData.gender = customData.gender
          }
          
          if (fieldMapping.dob && customData.dateOfBirth) {
            mappedData.dob = customData.dateOfBirth
          }
          
          if (fieldMapping.education_level_id && customData.educationLevel) {
            mappedData.education_level_id = customData.educationLevel
          }
          
          if (fieldMapping.area_study_ids && leadData.areaOfStudy) {
            mappedData.area_study_ids = leadData.areaOfStudy
          }
          
          if (fieldMapping.military_type && customData.militaryStatus) {
            mappedData.military_type = customData.militaryStatus
          }
          
        } catch (parseError) {
          console.warn('Error parsing custom data JSON:', parseError)
        }
      }
      
      // Apply default values
      Object.entries(defaultValues).forEach(([key, value]) => {
        if (!mappedData[key] && value) {
          mappedData[key] = value.toString()
        }
      })
      
      // Add tracking and system fields
      mappedData.service_leadid = leadData.id
      mappedData.source_service_trusted_form = leadData.source || 'MERGE_AI'
      mappedData.pub_transaction_id = `merge_${leadData.id}_${Date.now()}`
      
      // Get current IP (placeholder - in production you'd get real IP)
      mappedData.ip = '127.0.0.1'
      
      // Add all parameters to URL
      Object.entries(mappedData).forEach(([key, value]) => {
        if (value && value.trim()) {
          url.searchParams.set(key, value.trim())
        }
      })
      
      return url.toString()
      
    } catch (error) {
      console.error('Error constructing LeadHoop URL:', error)
      throw new Error(`Failed to construct LeadHoop URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Validate required fields for LeadHoop submission
   */
  static validateLeadData(leadData: LeadData, fieldMapping: LeadHoopFieldMapping): string[] {
    const errors: string[] = []
    
    // Check required fields
    if (fieldMapping.firstname && !leadData.firstName) {
      errors.push('First name is required')
    }
    
    if (fieldMapping.lastname && !leadData.lastName) {
      errors.push('Last name is required')
    }
    
    if (fieldMapping.email && !leadData.email) {
      errors.push('Email is required')
    }
    
    if (fieldMapping.phone1 && !leadData.phone) {
      errors.push('Phone number is required')
    }
    
    // Validate email format if present
    if (leadData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
      errors.push('Invalid email format')
    }
    
    // Validate phone format if present
    if (leadData.phone && leadData.phone.replace(/\D/g, '').length < 10) {
      errors.push('Phone number must be at least 10 digits')
    }
    
    return errors
  }

  /**
   * Create automation log entry
   */
  static async createAutomationLog(data: {
    leadId: string
    leadHoopConfigId: string
    status: string
    attemptNumber: number
    constructedUrl?: string
    submissionDataJson?: string
    errorMessage?: string
  }) {
    try {
      return await prisma.automationLog.create({
        data: {
          leadId: data.leadId,
          leadHoopConfigId: data.leadHoopConfigId,
          status: data.status,
          attemptNumber: data.attemptNumber,
          constructedUrl: data.constructedUrl,
          submissionDataJson: data.submissionDataJson,
          errorMessage: data.errorMessage,
          queuedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error creating automation log:', error)
      throw error
    }
  }

  /**
   * Update automation log with results
   */
  static async updateAutomationLog(
    logId: string,
    data: {
      status: string
      success: boolean
      responseDataJson?: string
      errorMessage?: string
      processingTimeMs?: number
      portalResponseCode?: number
      portalResponseMessage?: string
      screenshotPath?: string
    }
  ) {
    try {
      return await prisma.automationLog.update({
        where: { id: logId },
        data: {
          ...data,
          completedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error updating automation log:', error)
      throw error
    }
  }

  /**
   * Add lead to automation queue
   */
  static async addToQueue(leadId: string, priority: number = 1) {
    try {
      // Check if already in queue
      const existing = await prisma.automationQueue.findUnique({
        where: { leadId }
      })
      
      if (existing) {
        console.log(`Lead ${leadId} already in queue`)
        return existing
      }
      
      return await prisma.automationQueue.create({
        data: {
          leadId,
          priority,
          status: 'QUEUED'
        }
      })
    } catch (error) {
      console.error('Error adding to automation queue:', error)
      throw error
    }
  }

  /**
   * Get next lead from queue
   */
  static async getNextQueuedLead() {
    try {
      return await prisma.automationQueue.findFirst({
        where: {
          status: 'QUEUED',
          OR: [
            { nextAttemptAt: null },
            { nextAttemptAt: { lte: new Date() } }
          ]
        },
        include: {
          lead: {
            include: {
              client: {
                include: {
                  leadHoopConfigs: {
                    where: { isActive: true }
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { priority: 'asc' },
          { createdAt: 'asc' }
        ]
      })
    } catch (error) {
      console.error('Error getting next queued lead:', error)
      throw error
    }
  }

  /**
   * Update queue item status
   */
  static async updateQueueStatus(
    queueId: string,
    status: string,
    errorMessage?: string,
    nextAttemptAt?: Date
  ) {
    try {
      return await prisma.automationQueue.update({
        where: { id: queueId },
        data: {
          status,
          lastError: errorMessage,
          nextAttemptAt,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error updating queue status:', error)
      throw error
    }
  }
}

export default LeadHoopService
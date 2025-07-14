// app/api/vapi-service.ts - Multi-tenant VAPI.AI Integration
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface VAPICallRequest {
  phoneNumber: string
  leadId: string
  leadData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    company?: string
    areaOfStudy?: string
  }
  assistantId?: string
}

export interface VAPICallResponse {
  callId: string
  status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed'
  duration?: number
  recording?: string
  transcript?: string
  cost?: number
  startedAt: string
  endedAt?: string
}

export interface ClientVAPIConfig {
  apiKey: string
  phoneNumberId: string
  assistantId: string
  webhookSecret?: string
}

export class MultiTenantVAPIService {
  private baseUrl: string = 'https://api.vapi.ai'
  private masterApiKey: string

  constructor() {
    this.masterApiKey = process.env.VAPI_MASTER_API_KEY || ''
    if (!this.masterApiKey) {
      throw new Error('VAPI Master API key is required')
    }
  }

  // Get client's VAPI configuration
  async getClientVAPIConfig(clientId: string): Promise<ClientVAPIConfig> {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        vapiApiKey: true,
        vapiPhoneNumberId: true,
        vapiAssistantId: true,
        vapiWebhookSecret: true
      }
    })

    if (!client) {
      throw new Error('Client not found')
    }

    // Use master API key if client doesn't have their own yet
    const apiKey = client.vapiApiKey || this.masterApiKey
    
    if (!client.vapiPhoneNumberId || !client.vapiAssistantId) {
      throw new Error('Client VAPI configuration incomplete')
    }

    return {
      apiKey,
      phoneNumberId: client.vapiPhoneNumberId,
      assistantId: client.vapiAssistantId,
      webhookSecret: client.vapiWebhookSecret || undefined
    }
  }

  // Initiate a voice call for lead confirmation (client-specific)
  async initiateCall(clientId: string, request: VAPICallRequest): Promise<VAPICallResponse> {
    try {
      const config = await this.getClientVAPIConfig(clientId)
      
      const response = await fetch(`${this.baseUrl}/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumberId: config.phoneNumberId,
          customer: {
            number: request.phoneNumber
          },
          assistant: {
            id: request.assistantId || config.assistantId,
            // Override assistant variables with lead data
            variableValues: {
              firstName: request.leadData.firstName,
              lastName: request.leadData.lastName,
              email: request.leadData.email,
              company: request.leadData.company || '',
              areaOfStudy: request.leadData.areaOfStudy || '',
              clientId: clientId // Pass client context to assistant
            }
          },
          // Custom metadata to track the lead and client
          metadata: {
            leadId: request.leadId,
            clientId: clientId,
            purpose: 'lead_confirmation',
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`VAPI API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      
      return {
        callId: data.id,
        status: 'initiated',
        startedAt: data.createdAt
      }
    } catch (error) {
      console.error('VAPI call initiation error:', error)
      throw error
    }
  }

  // Get call status and details (client-specific)
  async getCallStatus(clientId: string, callId: string): Promise<VAPICallResponse> {
    try {
      const config = await this.getClientVAPIConfig(clientId)
      
      const response = await fetch(`${this.baseUrl}/call/${callId}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`VAPI API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        callId: data.id,
        status: this.mapVAPIStatus(data.status),
        duration: data.duration,
        recording: data.recordingUrl,
        transcript: data.transcript,
        cost: data.cost,
        startedAt: data.createdAt,
        endedAt: data.endedAt
      }
    } catch (error) {
      console.error('VAPI call status error:', error)
      throw error
    }
  }

  // Process VAPI webhook for real-time updates (multi-tenant aware)
  async processWebhook(webhookData: any): Promise<{
    leadId: string
    clientId: string
    callId: string
    status: string
    transcript?: string
    recording?: string
    tcpaConsent?: boolean
  }> {
    const { call, message } = webhookData
    
    // Extract client ID from metadata
    const clientId = call.metadata?.clientId
    if (!clientId) {
      throw new Error('Webhook missing client ID in metadata')
    }

    return {
      leadId: call.metadata?.leadId,
      clientId: clientId,
      callId: call.id,
      status: this.mapVAPIStatus(call.status),
      transcript: call.transcript,
      recording: call.recordingUrl,
      // Extract TCPA consent from transcript analysis
      tcpaConsent: this.extractTCPAConsent(call.transcript)
    }
  }

  // Setup new client VAPI configuration
  async setupClientVAPI(clientId: string, config: {
    apiKey?: string
    phoneNumberId: string
    assistantId: string
    webhookSecret?: string
  }): Promise<void> {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        vapiApiKey: config.apiKey,
        vapiPhoneNumberId: config.phoneNumberId,
        vapiAssistantId: config.assistantId,
        vapiWebhookSecret: config.webhookSecret
      }
    })
  }

  // Map VAPI status to our internal status
  private mapVAPIStatus(vapiStatus: string): VAPICallResponse['status'] {
    switch (vapiStatus) {
      case 'queued':
      case 'ringing': return 'ringing'
      case 'in-progress': return 'answered'
      case 'completed': return 'completed'
      case 'failed':
      case 'busy':
      case 'no-answer': return 'failed'
      default: return 'initiated'
    }
  }

  // Analyze transcript for TCPA consent
  private extractTCPAConsent(transcript?: string): boolean {
    if (!transcript) return false
    
    const consentKeywords = [
      'yes, i consent',
      'i agree',
      'yes, i agree',
      'i give my consent',
      'yes to receive calls',
      'yes, that\'s fine',
      'i authorize',
      'i permit'
    ]
    
    const lowerTranscript = transcript.toLowerCase()
    return consentKeywords.some(keyword => lowerTranscript.includes(keyword))
  }
}

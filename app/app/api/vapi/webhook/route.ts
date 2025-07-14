// app/api/vapi/webhook/route.ts - Handle VAPI Webhooks
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { MultiTenantVAPIService } from '../../../../lib/vapi-multitenant'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json()
    
    console.log('VAPI Webhook received:', {
      type: webhookData.message?.type,
      callId: webhookData.call?.id,
      status: webhookData.call?.status
    })

    const vapiService = new MultiTenantVAPIService()
    const result = await vapiService.processWebhook(webhookData)

    // Update lead based on call result
    const leadUpdate: any = {
      lastCallAt: new Date()
    }

    // Map VAPI status to lead status
    switch (result.status) {
      case 'ringing':
        leadUpdate.status = 'CALLING'
        break
      case 'answered':
        leadUpdate.status = 'CALLING'
        break
      case 'completed':
        // Analyze if call was successful based on transcript/consent
        if (result.tcpaConsent) {
          leadUpdate.status = 'CONFIRMED'
          leadUpdate.tcpaConsent = true
          leadUpdate.consentRecordingUrl = result.recording
        } else {
          leadUpdate.status = 'CALL_FAILED'
        }
        break
      case 'failed':
        leadUpdate.status = 'CALL_FAILED'
        break
    }

    // Update the lead
    await prisma.lead.update({
      where: { id: result.leadId },
      data: leadUpdate
    })

    // Update call log
    await prisma.callLog.updateMany({
      where: { 
        callId: result.callId,
        leadId: result.leadId 
      },
      data: {
        status: result.status.toUpperCase() as any,
        endedAt: result.status === 'completed' ? new Date() : undefined,
        transcript: result.transcript,
        recording: result.recording
      }
    })

    // Create status update record
    if (leadUpdate.status) {
      await prisma.statusUpdate.create({
        data: {
          leadId: result.leadId,
          fromStatus: 'CALLING' as any, // Previous status
          toStatus: leadUpdate.status as any,
          reason: `VAPI call ${result.status}`,
          notes: result.transcript ? `Call transcript available` : undefined
        }
      })
    }

    // If lead is confirmed, trigger next step (form submission)
    if (leadUpdate.status === 'CONFIRMED') {
      // TODO: Trigger form submission process
      console.log(`Lead ${result.leadId} confirmed - ready for form submission`)
    }

    return NextResponse.json({ 
      success: true,
      leadId: result.leadId,
      status: result.status,
      processed: true
    })

  } catch (error) {
    console.error('VAPI webhook processing error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

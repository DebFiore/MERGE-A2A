// app/api/vapi/webhook/route.ts - Handle VAPI Webhooks
import { NextRequest, NextResponse } from 'next/server'
import { MultiTenantVAPIService } from '../vapi-service.js''

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

    // For now, just log the result - we'll add database updates later
    console.log('Processed webhook:', result)

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

// app/api/vapi/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json()
    
    console.log('VAPI Webhook received:', {
      type: webhookData.message?.type,
      callId: webhookData.call?.id,
      status: webhookData.call?.status
    })

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully'
    })

  } catch (error) {
    console.error('VAPI webhook processing error:', error)
    
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

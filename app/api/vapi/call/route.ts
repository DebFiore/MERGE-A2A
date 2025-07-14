// app/api/vapi/call/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, leadId, leadData } = body

    // Validate required fields
    if (!phoneNumber || !leadId || !leadData) {
      return NextResponse.json(
        { error: 'Missing required fields: phoneNumber, leadId, leadData' },
        { status: 400 }
      )
    }

    // For now, just simulate a successful call
    console.log('VAPI call initiated for:', { phoneNumber, leadId, leadData })

    return NextResponse.json({
      success: true,
      callId: `call-${Date.now()}`,
      status: 'initiated',
      message: 'Call initiated successfully'
    })

  } catch (error) {
    console.error('VAPI call initiation error:', error)
    
    return NextResponse.json(
      { error: 'Failed to initiate call' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const callId = searchParams.get('callId')

  if (!callId) {
    return NextResponse.json(
      { error: 'Missing callId parameter' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    callId: callId,
    status: 'completed',
    duration: 120,
    message: 'Call completed successfully'
  })
}

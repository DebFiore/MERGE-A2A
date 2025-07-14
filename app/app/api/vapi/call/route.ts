// app/api/vapi/call/route.ts - Multi-tenant VAPI Call Initiation
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { MultiTenantVAPIService } from '../../../../lib/vapi-multitenant'

const prisma = new PrismaClient()

// POST - Initiate a VAPI call for a lead
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication to get clientId from session
    // For now, using demo client ID
    const clientId = 'demo-client' // Replace with actual client from auth session
    
    const body = await request.json()
    const { phoneNumber, leadId, leadData, assistantId } = body

    // Validate required fields
    if (!phoneNumber || !leadId || !leadData) {
      return NextResponse.json(
        { error: 'Missing required fields: phoneNumber, leadId, leadData' },
        { status: 400 }
      )
    }

    // Initialize VAPI service
    const vapiService = new MultiTenantVAPIService()
    
    // Initiate the call
    const result = await vapiService.initiateCall(clientId, {
      phoneNumber,
      leadId,
      leadData,
      assistantId
    })

    // Update lead status to CALLING
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'CALLING',
        callAttempts: { increment: 1 },
        lastCallAt: new Date()
      }
    })

    // Log the call attempt
    await prisma.callLog.create({
      data: {
        leadId: leadId,
        callId: result.callId,
        status: 'INITIATED',
        startedAt: new Date(result.startedAt)
      }
    })

    return NextResponse.json({
      success: true,
      callId: result.callId,
      status: result.status,
      message: 'Call initiated successfully'
    })

  } catch (error) {
    console.error('VAPI call initiation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to initiate call',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Check call status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const callId = searchParams.get('callId')
    const clientId = 'demo-client' // Replace with actual client from auth session

    if (!callId) {
      return NextResponse.json(
        { error: 'Missing callId parameter' },
        { status: 400 }
      )
    }

    const vapiService = new MultiTenantVAPIService()
    const result = await vapiService.getCallStatus(clientId, callId)

    return NextResponse.json(result)

  } catch (error) {
    console.error('VAPI status check error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get call status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

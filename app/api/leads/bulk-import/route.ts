import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentUser, createActivity } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!user.emailVerified || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account not verified or inactive' },
        { status: 403 }
      )
    }

    const { leads } = await request.json()

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: 'No leads provided' },
        { status: 400 }
      )
    }

    // Validate lead data
    const validLeads = leads.filter(lead => 
      lead.name && 
      lead.name.trim().length > 0 &&
      lead.email && 
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)
    )

    if (validLeads.length === 0) {
      return NextResponse.json(
        { error: 'No valid leads found' },
        { status: 400 }
      )
    }

    // Create leads in database
    const createdLeads = await prisma.$transaction(async (tx) => {
      const results = []
      
      for (const leadData of validLeads) {
        try {
          // Check if lead with this email already exists for this client
          const existingLead = await tx.lead.findFirst({
            where: {
              email: leadData.email,
              clientId: user.clientId
            }
          })

          if (existingLead) {
            // Update existing lead
            const nameParts = leadData.name.split(' ')
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''
            
            const updatedLead = await tx.lead.update({
              where: { id: existingLead.id },
              data: {
                firstName: firstName,
                lastName: lastName,
                phone: leadData.phone || existingLead.phone,
                company: leadData.company || existingLead.company,
                status: leadData.status || existingLead.status,
                lastCallAt: new Date(),
              }
            })
            results.push({ ...updatedLead, isUpdate: true })
          } else {
            // Create new lead
            const nameParts = leadData.name.split(' ')
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''
            
            // Get or create a default campaign for CSV imports
            let defaultCampaign = await tx.campaign.findFirst({
              where: {
                clientId: user.clientId,
                name: 'CSV Import Campaign'
              }
            })

            if (!defaultCampaign) {
              defaultCampaign = await tx.campaign.create({
                data: {
                  name: 'CSV Import Campaign',
                  description: 'Auto-generated campaign for CSV imports',
                  type: 'OUTBOUND_SALES',
                  status: 'ACTIVE',
                  clientId: user.clientId,
                  userId: user.id,
                }
              })
            }

            const newLead = await tx.lead.create({
              data: {
                firstName: firstName,
                lastName: lastName,
                email: leadData.email,
                phone: leadData.phone || '',
                company: leadData.company || '',
                status: leadData.status || 'NEW',
                source: 'CSV Import',
                clientId: user.clientId,
                userId: user.id,
                campaignId: defaultCampaign.id,
              }
            })
            results.push({ ...newLead, isUpdate: false })
          }
        } catch (error) {
          console.error(`Error processing lead ${leadData.email}:`, error)
          // Continue processing other leads
        }
      }
      
      return results
    })

    // Log the bulk import activity
    await createActivity(
      user.id,
      'BULK_IMPORT',
      `Imported ${createdLeads.length} leads via CSV upload`,
      {
        totalLeads: leads.length,
        validLeads: validLeads.length,
        importedLeads: createdLeads.length,
        newLeads: createdLeads.filter(l => !l.isUpdate).length,
        updatedLeads: createdLeads.filter(l => l.isUpdate).length,
      }
    )

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${createdLeads.length} leads`,
      results: {
        total: leads.length,
        valid: validLeads.length,
        imported: createdLeads.length,
        new: createdLeads.filter(l => !l.isUpdate).length,
        updated: createdLeads.filter(l => l.isUpdate).length,
      }
    })

  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: 'Internal server error during import' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
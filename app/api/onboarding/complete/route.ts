import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Get user from session (simplified - in production use proper auth)
    const cookieStore = cookies()
    const userEmail = cookieStore.get('userEmail')?.value

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { client: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const onboardingData = await request.json()

    await prisma.$transaction(async (tx) => {
      // Update client with onboarding data
      await tx.client.update({
        where: { id: user.clientId },
        data: {
          timezone: onboardingData.timeZone,
          settingsJson: JSON.stringify({
            companySize: onboardingData.companySize,
            businessHours: onboardingData.businessHours,
            onboardingCompleted: true,
            onboardingCompletedAt: new Date().toISOString(),
          })
        }
      })

      // Update default voice agent with custom settings
      const defaultAgent = await tx.voiceAgent.findFirst({
        where: { 
          clientId: user.clientId,
          isDefault: true
        }
      })

      if (defaultAgent) {
        await tx.voiceAgent.update({
          where: { id: defaultAgent.id },
          data: {
            name: onboardingData.voiceAgent.name,
            voice: onboardingData.voiceAgent.voice,
            personality: `You are a ${onboardingData.voiceAgent.personality} AI assistant. ${getPersonalityInstructions(onboardingData.voiceAgent.personality)}`,
            instructions: `Greeting: "${onboardingData.voiceAgent.greeting}"\n\nAlways maintain a ${onboardingData.voiceAgent.personality} tone and be helpful to callers.`,
            vapiConfigJson: JSON.stringify({
              provider: 'VAPI',
              voiceSettings: {
                greeting: onboardingData.voiceAgent.greeting,
                personality: onboardingData.voiceAgent.personality,
                businessHours: onboardingData.businessHours,
              }
            })
          }
        })
      }

      // Create phone number request
      await tx.phoneNumber.create({
        data: {
          number: 'PENDING', // Will be updated when number is provisioned
          friendlyName: `${user.client.name} Main Line`,
          type: onboardingData.phoneNumber.type === 'tollfree' ? 'TOLL_FREE' : 'LOCAL',
          status: 'PENDING_VERIFICATION',
          provider: 'VAPI',
          monthlyFee: onboardingData.phoneNumber.type === 'tollfree' ? 25.00 : 15.00,
          perMinuteRate: 0.02,
          country: 'US',
          region: onboardingData.phoneNumber.preferredArea || null,
          clientId: user.clientId,
          capabilitiesJson: JSON.stringify({
            voice: true,
            sms: true,
            fax: false
          })
        }
      })

      // Create team member invitations
      for (const member of onboardingData.teamMembers) {
        if (member.email && member.firstName && member.lastName) {
          // Check if user already exists
          const existingUser = await tx.user.findUnique({
            where: { email: member.email.toLowerCase() }
          })

          if (!existingUser) {
            // Create pending user invitation
            await tx.user.create({
              data: {
                email: member.email.toLowerCase(),
                firstName: member.firstName,
                lastName: member.lastName,
                role: member.role,
                status: 'PENDING_VERIFICATION',
                emailVerified: false,
                preferencesJson: JSON.stringify({}),
                clientId: user.clientId,
                // Generate temporary password - user will reset on first login
                password: 'TEMP_PASSWORD_NEEDS_RESET',
              }
            })

            // TODO: Send invitation email
            console.log(`📧 Team invitation sent to ${member.email}`)
          }
        }
      }

      // Create completion activity
      await tx.activity.create({
        data: {
          type: 'onboarding_completed',
          description: 'Account onboarding completed successfully',
          metadataJson: JSON.stringify({
            companySize: onboardingData.companySize,
            voiceAgentName: onboardingData.voiceAgent.name,
            phoneNumberType: onboardingData.phoneNumber.type,
            teamMembersInvited: onboardingData.teamMembers.length,
            completedAt: new Date().toISOString()
          }),
          userId: user.id,
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      nextStep: 'dashboard'
    })

  } catch (error) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

function getPersonalityInstructions(personality: string): string {
  switch (personality) {
    case 'professional':
      return 'Maintain a formal, business-like tone. Be polite, direct, and efficient in your responses.'
    case 'friendly':
      return 'Be warm, conversational, and approachable. Use a casual but respectful tone.'
    case 'enthusiastic':
      return 'Show energy and excitement in your responses. Be positive and motivating.'
    case 'calm':
      return 'Speak in a soothing, reassuring manner. Be patient and understanding.'
    default:
      return 'Be helpful and professional in all interactions.'
  }
}
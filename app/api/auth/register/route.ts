import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      companyName,
      industry,
      website,
      firstName,
      lastName,
      email,
      phone,
      subdomain,
      password,
      planType,
    } = body

    // Validate required fields
    if (!companyName || !industry || !firstName || !lastName || !email || !phone || !subdomain || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-zA-Z0-9]{3,20}$/
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json(
        { error: 'Invalid subdomain format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Check if subdomain is available
    const existingClient = await prisma.client.findUnique({
      where: { subdomain: subdomain.toLowerCase() }
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'This subdomain is not available' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate email verification token
    const emailVerifyToken = uuidv4()
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create client and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create client
      const client = await tx.client.create({
        data: {
          name: companyName,
          email: email.toLowerCase(),
          company: companyName,
          subdomain: subdomain.toLowerCase(),
          website: website || null,
          industry,
          planType: planType || 'BASIC',
          settingsJson: JSON.stringify({
            emailNotifications: true,
            voiceCallsEnabled: true,
            dataRetentionDays: 90,
          }),
        }
      })

      // Create admin user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          firstName,
          lastName,
          phone,
          password: hashedPassword,
          role: 'CLIENT_ADMIN',
          status: 'PENDING_VERIFICATION',
          emailVerified: false,
          emailVerifyToken,
          emailVerifyExpiry,
          preferencesJson: JSON.stringify({
            emailNotifications: true,
            dashboardLayout: 'grid',
            timezone: 'UTC',
          }),
          clientId: client.id,
        }
      })

      // Create default voice agent for the client
      await tx.voiceAgent.create({
        data: {
          name: 'Default Assistant',
          description: `Default AI voice agent for ${companyName}`,
          voice: 'FEMALE_US',
          language: 'en-US',
          personality: 'You are a professional and friendly AI assistant representing ' + companyName + '. You are helpful, knowledgeable, and always maintain a positive attitude.',
          instructions: 'Greet callers warmly, listen to their needs, and provide helpful information about our services. Always be professional and courteous.',
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          isActive: true,
          isDefault: true,
          clientId: client.id,
          vapiConfigJson: JSON.stringify({
            provider: 'VAPI',
            voiceSettings: {
              stability: 0.5,
              similarityBoost: 0.8,
              speed: 1.0,
            }
          })
        }
      })

      // Create billing account
      await tx.billingAccount.create({
        data: {
          plan: planType || 'BASIC',
          status: 'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
          monthlyCallLimit: planType === 'PROFESSIONAL' ? 5000 : planType === 'ENTERPRISE' ? 20000 : 1000,
          callsUsed: 0,
          minutesLimit: planType === 'PROFESSIONAL' ? 50000 : planType === 'ENTERPRISE' ? 200000 : 10000,
          minutesUsed: 0,
          billingEmail: email.toLowerCase(),
          billingName: `${firstName} ${lastName}`,
          billingAddressJson: JSON.stringify({}),
          clientId: client.id,
        }
      })

      return { client, user }
    })

    // Send verification email (in production, you'd use a proper email service)
    console.log('📧 Email verification link for', email)
    console.log(`http://localhost:3000/register/verify-email?token=${emailVerifyToken}`)

    // TODO: In production, replace this with actual email sending
    // await sendVerificationEmail(email, emailVerifyToken, firstName)

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      clientId: result.client.id,
      userId: result.user.id,
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to send verification email (mock implementation)
async function sendVerificationEmail(email: string, token: string, firstName: string) {
  // In production, integrate with email service like SendGrid, Mailgun, or AWS SES
  const verificationUrl = `${process.env.NEXTAUTH_URL}/register/verify-email?token=${token}`
  
  console.log(`
    📧 Verification Email for ${email}:
    
    Hi ${firstName},
    
    Welcome to MERGE AI! Please click the link below to verify your email address:
    
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't create this account, please ignore this email.
    
    Best regards,
    The MERGE AI Team
  `)
}
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user with this email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If this email exists, a verification link has been sent.'
      })
    }

    // If already verified, don't send another email
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'This email is already verified.'
      })
    }

    // Generate new verification token
    const emailVerifyToken = uuidv4()
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken,
        emailVerifyExpiry,
      }
    })

    // Send verification email (mock implementation)
    console.log('📧 Resending email verification link for', email)
    console.log(`http://localhost:3000/register/verify-email?token=${emailVerifyToken}`)

    // TODO: In production, replace this with actual email sending
    // await sendVerificationEmail(email, emailVerifyToken, user.firstName)

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully.'
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
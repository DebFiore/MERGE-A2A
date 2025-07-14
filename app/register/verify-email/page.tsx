'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bot, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending')
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get email from query params or localStorage
    const emailParam = searchParams.get('email')
    const storedEmail = localStorage.getItem('registerEmail')
    setEmail(emailParam || storedEmail || '')

    // Check if there's a token in the URL (email verification link)
    const token = searchParams.get('token')
    if (token) {
      verifyEmail(token)
    }
  }, [searchParams])

  useEffect(() => {
    // Cooldown timer for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const verifyEmail = async (token: string) => {
    setStatus('verifying')
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        setStatus('success')
        // Clean up stored email
        localStorage.removeItem('registerEmail')
        // Redirect to onboarding after a delay
        setTimeout(() => {
          router.push('/onboarding')
        }, 2000)
      } else {
        setStatus('error')
      }
    } catch (error) {
      console.error('Email verification error:', error)
      setStatus('error')
    }
  }

  const resendVerificationEmail = async () => {
    if (!email || resending || resendCooldown > 0) return

    setResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setResendCooldown(60) // 60 second cooldown
      }
    } catch (error) {
      console.error('Resend verification error:', error)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MERGE AI</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow px-6 py-8 text-center">
          {status === 'pending' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Check Your Email
              </h1>
              <p className="text-gray-600 mb-6">
                We've sent a verification link to:
              </p>
              <p className="text-blue-600 font-medium mb-6 break-all">
                {email || 'your email address'}
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Click the link in the email to verify your account and complete your registration.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={resendVerificationEmail}
                  disabled={resending || resendCooldown > 0}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s`
                    : resending 
                    ? 'Sending...' 
                    : 'Resend verification email'
                  }
                </button>
                
                <p className="text-xs text-gray-500">
                  Didn't receive the email? Check your spam folder or try resending.
                </p>
              </div>
            </>
          )}

          {status === 'verifying' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Verifying Your Email
              </h1>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Email Verified!
              </h1>
              <p className="text-gray-600 mb-6">
                Your email has been successfully verified. You'll be redirected to complete your account setup.
              </p>
              <div className="flex items-center justify-center text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">Redirecting...</span>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Verification Failed
              </h1>
              <p className="text-gray-600 mb-6">
                The verification link is invalid or has expired. Please try requesting a new verification email.
              </p>
              <div className="space-y-4">
                <button
                  onClick={resendVerificationEmail}
                  disabled={resending || resendCooldown > 0 || !email}
                  className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s`
                    : resending 
                    ? 'Sending...' 
                    : 'Send new verification email'
                  }
                </button>
                
                <Link
                  href="/register"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 text-center"
                >
                  Back to Registration
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <Link href="/support" className="text-blue-600 hover:text-blue-700">
              Contact our support team
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
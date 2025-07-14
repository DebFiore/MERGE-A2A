import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// List of reserved subdomains
const RESERVED_SUBDOMAINS = [
  'www', 'api', 'app', 'admin', 'dashboard', 'mail', 'email', 'ftp', 'blog', 'help', 'support',
  'docs', 'status', 'staging', 'dev', 'test', 'demo', 'sandbox', 'cdn', 'assets', 'static',
  'img', 'images', 'js', 'css', 'files', 'uploads', 'download', 'forum', 'community',
  'shop', 'store', 'cart', 'checkout', 'billing', 'invoice', 'payment', 'payments',
  'secure', 'ssl', 'vpn', 'proxy', 'redirect', 'link', 'go', 'click', 'track',
  'analytics', 'stats', 'metrics', 'reports', 'data', 'backup', 'archive',
  'merge', 'mergeai', 'merge-ai', 'ai', 'vapi', 'voice', 'call', 'calls',
  'lead', 'leads', 'campaign', 'campaigns', 'client', 'clients', 'user', 'users',
  'account', 'accounts', 'profile', 'profiles', 'settings', 'config', 'configuration',
  'auth', 'login', 'logout', 'signin', 'signup', 'register', 'password', 'reset',
  'verify', 'verification', 'confirm', 'confirmation', 'activate', 'activation'
]

export async function POST(request: NextRequest) {
  try {
    const { subdomain } = await request.json()

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      )
    }

    const cleanSubdomain = subdomain.toLowerCase().trim()

    // Validate subdomain format
    const subdomainRegex = /^[a-zA-Z0-9]{3,20}$/
    if (!subdomainRegex.test(cleanSubdomain)) {
      return NextResponse.json({
        available: false,
        reason: 'Invalid format. Use 3-20 characters, letters and numbers only.'
      })
    }

    // Check if subdomain is reserved
    if (RESERVED_SUBDOMAINS.includes(cleanSubdomain)) {
      return NextResponse.json({
        available: false,
        reason: 'This subdomain is reserved and cannot be used.'
      })
    }

    // Check if subdomain exists in database
    const existingClient = await prisma.client.findUnique({
      where: { subdomain: cleanSubdomain }
    })

    if (existingClient) {
      return NextResponse.json({
        available: false,
        reason: 'This subdomain is already taken.'
      })
    }

    // Subdomain is available
    return NextResponse.json({
      available: true,
      subdomain: cleanSubdomain
    })

  } catch (error) {
    console.error('Subdomain check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
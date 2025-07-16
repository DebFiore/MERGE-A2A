import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('Demo login attempt:', { email, password })

    // Demo credentials for your presentation - accept both email formats
    if ((email === 'demo@mergemedia.ai' || email === 'demo@mergeleads.ai') && password === 'demo123') {
      const sessionData = {
        userId: 'demo-user-id',
        email: 'demo@mergemedia.ai',
        firstName: 'Demo',
        lastName: 'User',
        role: 'CLIENT_ADMIN',
        clientId: 'demo-client-id'
      }

      const response = NextResponse.json({
        success: true,
        user: {
          id: 'demo-user-id',
          email: 'demo@mergemedia.ai',
          firstName: 'Demo',
          lastName: 'User',
          role: 'CLIENT_ADMIN',
          emailVerified: true,
          client: {
            id: 'demo-client-id',
            name: 'Demo Company',
            subdomain: 'demo',
            isActive: true
          }
        }
      })

      // Set session cookies
      response.cookies.set('merge-session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400,
        path: '/'
      })

      response.cookies.set('merge-user-email', 'demo@mergemedia.ai', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400,
        path: '/'
      })

      return response
    }

    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Demo login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
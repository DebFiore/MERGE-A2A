import { PrismaClient } from '@prisma/client'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  emailVerified: boolean
  clientId: string
  client: {
    id: string
    name: string
    subdomain: string
    planType: string
    isActive: boolean
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies()
    const userEmail = cookieStore.get('userEmail')?.value

    if (!userEmail) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true,
        clientId: true,
        client: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            planType: true,
            isActive: true,
          }
        }
      }
    })

    return user as AuthUser | null
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  const roleHierarchy = {
    'SUPER_ADMIN': 4,
    'CLIENT_ADMIN': 3,
    'CLIENT_USER': 2,
    'CLIENT_VIEWER': 1,
  }

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = Math.min(...requiredRoles.map(role => 
    roleHierarchy[role as keyof typeof roleHierarchy] || 5
  ))

  return userLevel >= requiredLevel
}

export function requireAuth(requiredRoles: string[] = []) {
  return async (request: NextRequest) => {
    const user = await getCurrentUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (user.status !== 'ACTIVE') {
      return new Response(
        JSON.stringify({ error: 'Account not active' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!user.emailVerified) {
      return new Response(
        JSON.stringify({ error: 'Email verification required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!user.client.isActive) {
      return new Response(
        JSON.stringify({ error: 'Account suspended' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (requiredRoles.length > 0 && !hasPermission(user.role, requiredRoles)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return null // Continue to route handler
  }
}

export function isSuperAdmin(user: AuthUser): boolean {
  return user.role === 'SUPER_ADMIN'
}

export function isClientAdmin(user: AuthUser): boolean {
  return user.role === 'CLIENT_ADMIN' || isSuperAdmin(user)
}

export function canManageCampaigns(user: AuthUser): boolean {
  return hasPermission(user.role, ['CLIENT_USER', 'CLIENT_ADMIN'])
}

export function canViewAnalytics(user: AuthUser): boolean {
  return hasPermission(user.role, ['CLIENT_VIEWER', 'CLIENT_USER', 'CLIENT_ADMIN'])
}

export function canManageUsers(user: AuthUser): boolean {
  return hasPermission(user.role, ['CLIENT_ADMIN'])
}

export function canAccessSettings(user: AuthUser): boolean {
  return hasPermission(user.role, ['CLIENT_ADMIN'])
}

// Data isolation helper - ensures users can only access their tenant's data
export function addTenantFilter(user: AuthUser, query: any) {
  if (isSuperAdmin(user)) {
    // Super admins can access all data
    return query
  }

  // Add client filter for all other users
  return {
    ...query,
    where: {
      ...query.where,
      clientId: user.clientId
    }
  }
}

// Validate that a resource belongs to the user's tenant
export async function validateTenantAccess(
  user: AuthUser, 
  resourceType: string, 
  resourceId: string
): Promise<boolean> {
  if (isSuperAdmin(user)) {
    return true
  }

  try {
    let resource: any = null

    switch (resourceType) {
      case 'campaign':
        resource = await prisma.campaign.findUnique({
          where: { id: resourceId },
          select: { clientId: true }
        })
        break
      case 'lead':
        resource = await prisma.lead.findUnique({
          where: { id: resourceId },
          select: { clientId: true }
        })
        break
      case 'user':
        resource = await prisma.user.findUnique({
          where: { id: resourceId },
          select: { clientId: true }
        })
        break
      case 'voiceAgent':
        resource = await prisma.voiceAgent.findUnique({
          where: { id: resourceId },
          select: { clientId: true }
        })
        break
      case 'phoneNumber':
        resource = await prisma.phoneNumber.findUnique({
          where: { id: resourceId },
          select: { clientId: true }
        })
        break
      default:
        return false
    }

    return resource?.clientId === user.clientId
  } catch (error) {
    console.error('Tenant access validation error:', error)
    return false
  }
}

export async function createActivity(
  userId: string,
  type: string,
  description: string,
  metadata?: any,
  leadId?: string
) {
  try {
    await prisma.activity.create({
      data: {
        type,
        description,
        metadataJson: metadata ? JSON.stringify(metadata) : null,
        userId,
        leadId: leadId || null,
      }
    })
  } catch (error) {
    console.error('Create activity error:', error)
  }
}
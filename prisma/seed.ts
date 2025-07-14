import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample clients
  const client1 = await prisma.client.create({
    data: {
      name: 'MERGE AI Demo Client',
      email: 'demo@merge-ai.com',
      company: 'MERGE AI Technologies',
      subdomain: 'demo',
      website: 'https://merge-ai.com',
      industry: 'Technology',
      timezone: 'America/New_York',
      contactPhone: '+1-555-0123',
      address: '123 AI Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      postalCode: '94105',
      planType: 'PROFESSIONAL',
      settingsJson: JSON.stringify({
        allowWeekends: false,
        maxDailyCalls: 500,
        callbackDelay: 15
      }),
      monthlyCallLimit: 5000,
      minutesLimit: 50000,
    }
  })

  const client2 = await prisma.client.create({
    data: {
      name: 'Test Company Inc',
      email: 'admin@testcompany.com',
      company: 'Test Company Inc',
      subdomain: 'testco',
      planType: 'BASIC',
      settingsJson: JSON.stringify({}),
    }
  })

  console.log('✅ Created clients:', { client1: client1.id, client2: client2.id })

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'admin@merge-ai.com',
      firstName: 'John',
      lastName: 'Admin',
      phone: '+1-555-0124',
      role: 'CLIENT_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      preferencesJson: JSON.stringify({
        emailNotifications: true,
        dashboardLayout: 'grid'
      }),
      clientId: client1.id,
    }
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'user@merge-ai.com',
      firstName: 'Jane',
      lastName: 'User',
      role: 'CLIENT_USER',
      status: 'ACTIVE',
      emailVerified: true,
      preferencesJson: JSON.stringify({}),
      clientId: client1.id,
    }
  })

  const user3 = await prisma.user.create({
    data: {
      email: 'manager@testcompany.com',
      firstName: 'Bob',
      lastName: 'Manager',
      role: 'CLIENT_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      preferencesJson: JSON.stringify({}),
      clientId: client2.id,
    }
  })

  console.log('✅ Created users:', { user1: user1.id, user2: user2.id, user3: user3.id })

  // Create voice agents
  const voiceAgent1 = await prisma.voiceAgent.create({
    data: {
      name: 'Sarah - Professional Agent',
      description: 'Professional female voice for sales calls',
      voice: 'FEMALE_US',
      language: 'en-US',
      personality: 'You are Sarah, a professional and friendly sales representative. You are confident, helpful, and focus on building rapport with prospects.',
      instructions: 'Always greet the prospect warmly, ask about their business needs, and guide them toward scheduling a demo.',
      model: 'gpt-4',
      temperature: 0.7,
      isActive: true,
      isDefault: true,
      clientId: client1.id,
      vapiConfigJson: JSON.stringify({
        voiceId: 'sarah_professional',
        provider: 'VAPI'
      })
    }
  })

  const voiceAgent2 = await prisma.voiceAgent.create({
    data: {
      name: 'Mike - Support Agent',
      description: 'Male voice for customer support',
      voice: 'MALE_US',
      personality: 'You are Mike, a helpful customer support representative. You are patient, knowledgeable, and always ready to help solve problems.',
      instructions: 'Listen carefully to customer issues, ask clarifying questions, and provide clear solutions.',
      isActive: true,
      clientId: client1.id,
    }
  })

  console.log('✅ Created voice agents:', { voiceAgent1: voiceAgent1.id, voiceAgent2: voiceAgent2.id })

  // Create phone numbers
  const phoneNumber1 = await prisma.phoneNumber.create({
    data: {
      number: '+1-555-MERGE-1',
      friendlyName: 'Main Sales Line',
      type: 'LOCAL',
      status: 'ACTIVE',
      provider: 'VAPI',
      monthlyFee: 15.00,
      perMinuteRate: 0.02,
      country: 'US',
      region: 'California',
      city: 'San Francisco',
      clientId: client1.id,
      capabilitiesJson: JSON.stringify({
        voice: true,
        sms: true,
        fax: false
      })
    }
  })

  console.log('✅ Created phone numbers:', { phoneNumber1: phoneNumber1.id })

  // Create campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      name: 'Q3 Lead Outreach Campaign',
      description: 'Outbound sales campaign targeting tech companies',
      type: 'OUTBOUND_SALES',
      status: 'ACTIVE',
      startDate: new Date('2025-07-15'),
      endDate: new Date('2025-09-30'),
      dailyStartTime: '09:00',
      dailyEndTime: '17:00',
      timezone: 'America/New_York',
      workingDaysJson: JSON.stringify([1, 2, 3, 4, 5]), // Monday-Friday
      maxCallsPerDay: 100,
      maxAttemptsPerLead: 3,
      timeBetweenCalls: 180, // 3 hours
      scriptTemplate: 'Hi {firstName}, this is {agentName} from MERGE AI. I noticed your company {company} might benefit from our AI voice calling solution...',
      voicePrompt: 'You are calling to introduce MERGE AI voice calling platform. Be friendly, professional, and focus on the value proposition.',
      customFieldsJson: JSON.stringify({
        industry: 'string',
        companySize: 'number',
        currentSolution: 'string'
      }),
      clientId: client1.id,
      userId: user1.id,
      voiceAgentId: voiceAgent1.id,
      phoneNumberId: phoneNumber1.id,
    }
  })

  const campaign2 = await prisma.campaign.create({
    data: {
      name: 'Customer Survey Campaign',
      description: 'Follow-up survey for existing customers',
      type: 'SURVEY',
      status: 'DRAFT',
      clientId: client1.id,
      userId: user2.id,
      voiceAgentId: voiceAgent2.id,
    }
  })

  console.log('✅ Created campaigns:', { campaign1: campaign1.id, campaign2: campaign2.id })

  // Create sample leads
  const leads = [
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@techcorp.com',
      phone: '+1-555-0201',
      company: 'TechCorp Solutions',
      jobTitle: 'VP of Sales',
      city: 'Austin',
      state: 'TX',
      status: 'NEW',
      source: 'LinkedIn',
      score: 85,
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@innovate.com',
      phone: '+1-555-0202',
      company: 'Innovate Inc',
      jobTitle: 'CEO',
      city: 'Boston',
      state: 'MA',
      status: 'CONTACTED',
      source: 'Cold Email',
      score: 92,
      callAttempts: 1,
      lastCallAt: new Date('2025-07-13T14:30:00Z'),
    },
    {
      firstName: 'Carol',
      lastName: 'Davis',
      email: 'carol@startup.io',
      phone: '+1-555-0203',
      company: 'Startup.io',
      jobTitle: 'CTO',
      city: 'Seattle',
      state: 'WA',
      status: 'INTERESTED',
      source: 'Webinar',
      score: 78,
      callAttempts: 2,
    }
  ]

  for (const leadData of leads) {
    await prisma.lead.create({
      data: {
        ...leadData,
        tagsJson: JSON.stringify(['prospect', 'tech-company']),
        customDataJson: JSON.stringify({
          companySize: Math.floor(Math.random() * 500) + 10,
          industry: 'Technology'
        }),
        clientId: client1.id,
        userId: user1.id,
        campaignId: campaign1.id,
      }
    })
  }

  // Update campaign totalLeads
  await prisma.campaign.update({
    where: { id: campaign1.id },
    data: { totalLeads: leads.length }
  })

  console.log('✅ Created leads:', leads.length)

  // Create billing account
  const billingAccount = await prisma.billingAccount.create({
    data: {
      plan: 'PROFESSIONAL',
      status: 'active',
      monthlyCallLimit: 5000,
      callsUsed: 127,
      minutesLimit: 50000,
      minutesUsed: 2340,
      billingEmail: 'billing@merge-ai.com',
      billingName: 'MERGE AI Technologies',
      billingAddressJson: JSON.stringify({
        street: '123 AI Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'US'
      }),
      clientId: client1.id,
    }
  })

  // Create sample billing transaction
  await prisma.billingTransaction.create({
    data: {
      type: 'SUBSCRIPTION',
      status: 'COMPLETED',
      amount: 299.00,
      currency: 'USD',
      description: 'Monthly Professional Plan - July 2025',
      paymentMethod: 'card_ending_4242',
      billingAccountId: billingAccount.id,
      processedAt: new Date(),
    }
  })

  console.log('✅ Created billing account and transaction')

  // Create sample activities
  await prisma.activity.create({
    data: {
      type: 'lead_created',
      description: 'New lead added to campaign',
      metadataJson: JSON.stringify({
        leadName: 'Alice Johnson',
        source: 'LinkedIn'
      }),
      userId: user1.id,
    }
  })

  await prisma.activity.create({
    data: {
      type: 'campaign_started',
      description: 'Campaign Q3 Lead Outreach Campaign was started',
      metadataJson: JSON.stringify({
        campaignId: campaign1.id
      }),
      userId: user1.id,
    }
  })

  console.log('✅ Created sample activities')

  console.log('🎉 Database seeding completed successfully!')
  console.log('')
  console.log('📊 Summary:')
  console.log('- 2 Clients created')
  console.log('- 3 Users created') 
  console.log('- 2 Voice Agents created')
  console.log('- 1 Phone Number created')
  console.log('- 2 Campaigns created')
  console.log('- 3 Leads created')
  console.log('- 1 Billing Account created')
  console.log('- 1 Billing Transaction created')
  console.log('- 2 Activities created')
  console.log('')
  console.log('🔐 Test credentials:')
  console.log('Admin: admin@merge-ai.com')
  console.log('User: user@merge-ai.com')
  console.log('Manager: manager@testcompany.com')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bot, Phone, Users, Mic, Settings, CheckCircle, ArrowRight, Plus, Trash2, Loader2 } from 'lucide-react'

interface OnboardingData {
  // Company Details
  companySize: string
  timeZone: string
  businessHours: {
    start: string
    end: string
    days: number[]
  }
  
  // Voice Configuration
  voiceAgent: {
    name: string
    voice: string
    personality: string
    greeting: string
  }
  
  // Phone Setup
  phoneNumber: {
    type: string
    preferredArea: string
  }
  
  // Team Setup
  teamMembers: Array<{
    email: string
    firstName: string
    lastName: string
    role: string
  }>
  
  // Integration Preferences
  integrations: {
    crm: string
    notifications: {
      email: boolean
      sms: boolean
      slack: boolean
    }
  }
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    companySize: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    businessHours: {
      start: '09:00',
      end: '17:00',
      days: [1, 2, 3, 4, 5] // Monday-Friday
    },
    voiceAgent: {
      name: 'AI Assistant',
      voice: 'FEMALE_US',
      personality: 'professional',
      greeting: 'Hello! Thank you for calling. How can I help you today?'
    },
    phoneNumber: {
      type: 'local',
      preferredArea: ''
    },
    teamMembers: [],
    integrations: {
      crm: '',
      notifications: {
        email: true,
        sms: false,
        slack: false
      }
    }
  })

  useEffect(() => {
    // Check if user is authenticated and get their data
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const updateOnboardingData = (section: string, field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof OnboardingData] as any),
        [field]: value
      }
    }))
  }

  const updateNestedField = (section: string, subsection: string, field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof OnboardingData] as any),
        [subsection]: {
          ...((prev[section as keyof OnboardingData] as any)[subsection] || {}),
          [field]: value
        }
      }
    }))
  }

  const addTeamMember = () => {
    setOnboardingData(prev => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        { email: '', firstName: '', lastName: '', role: 'CLIENT_USER' }
      ]
    }))
  }

  const removeTeamMember = (index: number) => {
    setOnboardingData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }))
  }

  const updateTeamMember = (index: number, field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }))
  }

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 5))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingData),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        console.error('Onboarding completion failed')
      }
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const stepTitles = [
    'Company Setup',
    'Voice Configuration',
    'Phone Number',
    'Team Members',
    'Review & Launch'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MERGE AI</span>
            </div>
            <div className="text-sm text-gray-500">
              Welcome, {userData?.firstName}!
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              {stepTitles.map((title, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep > index + 1 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : currentStep === index + 1
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > index + 1 ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    currentStep >= index + 1 ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {title}
                  </span>
                  {index < stepTitles.length - 1 && (
                    <div className={`mx-6 h-0.5 w-16 ${
                      currentStep > index + 1 ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow px-8 py-10">
          
          {/* Step 1: Company Setup */}
          {currentStep === 1 && (
            <div>
              <div className="text-center mb-8">
                <Settings className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's set up your company</h2>
                <p className="text-gray-600">Configure your basic settings to get started</p>
              </div>

              <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    value={onboardingData.companySize}
                    onChange={(e) => updateOnboardingData('', 'companySize', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Zone
                  </label>
                  <select
                    value={onboardingData.timeZone}
                    onChange={(e) => updateOnboardingData('', 'timeZone', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Business Hours
                  </label>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={onboardingData.businessHours.start}
                        onChange={(e) => updateNestedField('businessHours', '', 'start', e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Time</label>
                      <input
                        type="time"
                        value={onboardingData.businessHours.end}
                        onChange={(e) => updateNestedField('businessHours', '', 'end', e.target.value)}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Working Days</label>
                    <div className="flex space-x-2">
                      {dayNames.map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            const days = onboardingData.businessHours.days
                            const newDays = days.includes(index) 
                              ? days.filter(d => d !== index)
                              : [...days, index].sort()
                            updateNestedField('businessHours', '', 'days', newDays)
                          }}
                          className={`px-3 py-2 text-xs rounded-md border ${
                            onboardingData.businessHours.days.includes(index)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Voice Configuration */}
          {currentStep === 2 && (
            <div>
              <div className="text-center mb-8">
                <Mic className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure your AI voice agent</h2>
                <p className="text-gray-600">Customize how your AI assistant sounds and behaves</p>
              </div>

              <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={onboardingData.voiceAgent.name}
                    onChange={(e) => updateNestedField('voiceAgent', '', 'name', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="e.g., Sarah, Customer Assistant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice Type
                  </label>
                  <select
                    value={onboardingData.voiceAgent.voice}
                    onChange={(e) => updateNestedField('voiceAgent', '', 'voice', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="FEMALE_US">Female US English</option>
                    <option value="MALE_US">Male US English</option>
                    <option value="FEMALE_UK">Female UK English</option>
                    <option value="MALE_UK">Male UK English</option>
                    <option value="FEMALE_AU">Female Australian English</option>
                    <option value="MALE_AU">Male Australian English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personality Style
                  </label>
                  <select
                    value={onboardingData.voiceAgent.personality}
                    onChange={(e) => updateNestedField('voiceAgent', '', 'personality', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="professional">Professional & Formal</option>
                    <option value="friendly">Friendly & Conversational</option>
                    <option value="enthusiastic">Enthusiastic & Energetic</option>
                    <option value="calm">Calm & Reassuring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Greeting Message
                  </label>
                  <textarea
                    value={onboardingData.voiceAgent.greeting}
                    onChange={(e) => updateNestedField('voiceAgent', '', 'greeting', e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="What should your AI say when answering calls?"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This will be the first thing callers hear when your AI answers
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Phone Number */}
          {currentStep === 3 && (
            <div>
              <div className="text-center mb-8">
                <Phone className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get your phone number</h2>
                <p className="text-gray-600">Choose a phone number for your AI voice calls</p>
              </div>

              <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Phone Number Type
                  </label>
                  <div className="space-y-3">
                    {[
                      { id: 'local', name: 'Local Number', description: 'Get a local number for your area ($15/month)', price: '$15/mo' },
                      { id: 'tollfree', name: 'Toll-Free Number', description: 'Professional 1-800 number ($25/month)', price: '$25/mo' },
                    ].map((option) => (
                      <div key={option.id} className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        onboardingData.phoneNumber.type === option.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`} onClick={() => updateNestedField('phoneNumber', '', 'type', option.id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="phoneType"
                              value={option.id}
                              checked={onboardingData.phoneNumber.type === option.id}
                              onChange={() => updateNestedField('phoneNumber', '', 'type', option.id)}
                              className="mr-3 text-blue-600"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900">{option.name}</h3>
                              <p className="text-sm text-gray-600">{option.description}</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{option.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {onboardingData.phoneNumber.type === 'local' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Area Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={onboardingData.phoneNumber.preferredArea}
                      onChange={(e) => updateNestedField('phoneNumber', '', 'preferredArea', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="e.g., 415, 212, 713"
                      maxLength={3}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      We'll try to find a number in your preferred area code
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Team Members */}
          {currentStep === 4 && (
            <div>
              <div className="text-center mb-8">
                <Users className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite your team</h2>
                <p className="text-gray-600">Add team members who will have access to your MERGE AI dashboard</p>
              </div>

              <div className="max-w-3xl mx-auto">
                <div className="space-y-4">
                  {onboardingData.teamMembers.map((member, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <input
                            type="text"
                            value={member.firstName}
                            onChange={(e) => updateTeamMember(index, 'firstName', e.target.value)}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={member.lastName}
                            onChange={(e) => updateTeamMember(index, 'lastName', e.target.value)}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Last name"
                          />
                        </div>
                        <div>
                          <input
                            type="email"
                            value={member.email}
                            onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Email address"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <select
                            value={member.role}
                            onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          >
                            <option value="CLIENT_USER">User</option>
                            <option value="CLIENT_ADMIN">Admin</option>
                            <option value="CLIENT_VIEWER">Viewer</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => removeTeamMember(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                  >
                    <Plus className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Add team member</span>
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Role Permissions:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li><strong>Admin:</strong> Full access to all features and settings</li>
                    <li><strong>User:</strong> Can manage campaigns and view analytics</li>
                    <li><strong>Viewer:</strong> Read-only access to dashboards and reports</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Launch */}
          {currentStep === 5 && (
            <div>
              <div className="text-center mb-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to launch!</h2>
                <p className="text-gray-600">Review your settings and start using MERGE AI</p>
              </div>

              <div className="max-w-3xl mx-auto space-y-6">
                {/* Company Settings Summary */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Company Settings</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Company Size:</span>
                      <span className="ml-2 text-gray-900">{onboardingData.companySize || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Time Zone:</span>
                      <span className="ml-2 text-gray-900">{onboardingData.timeZone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Business Hours:</span>
                      <span className="ml-2 text-gray-900">
                        {onboardingData.businessHours.start} - {onboardingData.businessHours.end}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Working Days:</span>
                      <span className="ml-2 text-gray-900">
                        {onboardingData.businessHours.days.map(d => dayNames[d]).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Voice Agent Summary */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Voice Agent</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <span className="ml-2 text-gray-900">{onboardingData.voiceAgent.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Voice:</span>
                      <span className="ml-2 text-gray-900">{onboardingData.voiceAgent.voice.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Personality:</span>
                      <span className="ml-2 text-gray-900 capitalize">{onboardingData.voiceAgent.personality}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Greeting:</span>
                      <p className="mt-1 text-gray-900 italic">"{onboardingData.voiceAgent.greeting}"</p>
                    </div>
                  </div>
                </div>

                {/* Phone Number Summary */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Phone Number</h3>
                  <div className="text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 text-gray-900 capitalize">
                        {onboardingData.phoneNumber.type === 'tollfree' ? 'Toll-Free' : 'Local'} Number
                      </span>
                    </div>
                    {onboardingData.phoneNumber.preferredArea && (
                      <div className="mt-2">
                        <span className="text-gray-500">Preferred Area Code:</span>
                        <span className="ml-2 text-gray-900">{onboardingData.phoneNumber.preferredArea}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Members Summary */}
                {onboardingData.teamMembers.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Team Members</h3>
                    <div className="space-y-2">
                      {onboardingData.teamMembers.map((member, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-900">
                            {member.firstName} {member.lastName} ({member.email})
                          </span>
                          <span className="text-gray-500 capitalize">
                            {member.role.replace('CLIENT_', '').toLowerCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-medium text-green-900 mb-2">What happens next?</h3>
                  <ul className="text-sm text-green-800 space-y-2">
                    <li>✓ Your AI voice agent will be configured and ready</li>
                    <li>✓ Your phone number will be provisioned within 24 hours</li>
                    <li>✓ Team members will receive invitation emails</li>
                    <li>✓ You can start uploading leads and creating campaigns</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-12 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={completeOnboarding}
                disabled={isLoading}
                className="px-8 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {isLoading ? 'Setting up...' : 'Launch MERGE AI'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
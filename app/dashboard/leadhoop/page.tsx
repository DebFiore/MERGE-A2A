'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Bot, ArrowLeft, Settings, Activity, CheckCircle, XCircle, 
  Clock, AlertTriangle, BarChart3, Zap, RefreshCw, Play, Eye
} from 'lucide-react'

interface LeadHoopConfig {
  id: string
  portalUrl: string
  portalId: string
  isActive: boolean
  fieldMapping: Record<string, string>
  defaultValues: Record<string, any>
  autoSubmit: boolean
  retryAttempts: number
  retryDelayMinutes: number
  createdAt: string
  updatedAt: string
}

interface AutomationStats {
  summary: {
    queuedLeads: number
    processingLeads: number
    completedToday: number
    failedToday: number
    totalProcessed: number
    successRate: number
    avgProcessingTimeMs: number
  }
  statusDistribution: Record<string, number>
  recentActivity: Array<{
    id: string
    leadId: string
    leadName: string
    leadEmail: string
    leadStatus: string
    status: string
    success: boolean
    attemptNumber: number
    processingTimeMs: number
    errorMessage?: string
    queuedAt: string
    completedAt?: string
  }>
  timeframe: string
}

export default function LeadHoopDashboard() {
  const [config, setConfig] = useState<LeadHoopConfig | null>(null)
  const [stats, setStats] = useState<AutomationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showConfigForm, setShowConfigForm] = useState(false)

  // Form state for configuration
  const [formData, setFormData] = useState({
    portalUrl: '',
    portalId: '',
    autoSubmit: true,
    retryAttempts: 3,
    retryDelayMinutes: 5,
    fieldMapping: {
      firstname: 'firstName',
      lastname: 'lastName',
      email: 'email',
      phone1: 'phone',
      city: 'city',
      state: 'state',
      zip: 'zipCode',
      address: 'address'
    },
    defaultValues: {
      us_citizen: 'yes',
      internet_pc: 'yes',
      level_interest: 'high'
    }
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load configuration and stats in parallel
      const [configResponse, statsResponse] = await Promise.all([
        fetch('/api/leadhoop/config'),
        fetch('/api/leadhoop/status')
      ])

      if (configResponse.ok) {
        const configData = await configResponse.json()
        if (configData.configs && configData.configs.length > 0) {
          const activeConfig = configData.configs[0]
          setConfig(activeConfig)
          setFormData({
            portalUrl: activeConfig.portalUrl,
            portalId: activeConfig.portalId,
            autoSubmit: activeConfig.autoSubmit,
            retryAttempts: activeConfig.retryAttempts,
            retryDelayMinutes: activeConfig.retryDelayMinutes,
            fieldMapping: activeConfig.fieldMapping,
            defaultValues: activeConfig.defaultValues
          })
        }
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load LeadHoop data')
    } finally {
      setLoading(false)
    }
  }

  const refreshStats = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch('/api/leadhoop/status')
      if (response.ok) {
        const statsData = await response.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error refreshing stats:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const saveConfiguration = async () => {
    try {
      const response = await fetch('/api/leadhoop/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          portalUrl: formData.portalUrl,
          portalId: formData.portalId,
          autoSubmit: formData.autoSubmit,
          retryAttempts: formData.retryAttempts,
          retryDelayMinutes: formData.retryDelayMinutes,
          fieldMapping: formData.fieldMapping,
          defaultValues: formData.defaultValues
        })
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
        setShowConfigForm(false)
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save configuration')
      }
    } catch (error) {
      setError('Failed to save configuration')
    }
  }

  const processLead = async (leadId: string) => {
    try {
      const response = await fetch('/api/leadhoop/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leadId, priority: 1 })
      })

      if (response.ok) {
        // Refresh stats to show updated queue
        await refreshStats()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to process lead')
      }
    } catch (error) {
      setError('Failed to process lead')
    }
  }

  const getStatusColor = (status: string, success?: boolean) => {
    if (success === false) return 'text-red-600 bg-red-50'
    
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-50'
      case 'QUEUED':
        return 'text-blue-600 bg-blue-50'
      case 'IN_PROGRESS':
      case 'PROCESSING':
        return 'text-yellow-600 bg-yellow-50'
      case 'FAILED':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">MERGE AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">LeadHoop Integration</h1>
          <p className="mt-2 text-gray-600">Automated data entry for confirmed leads</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button 
                onClick={() => setError('')}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Configuration Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {config ? 'Active' : 'Not configured'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${config ? 'bg-green-100' : 'bg-red-100'}`}>
                {config ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowConfigForm(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {config ? 'Update Configuration' : 'Setup Configuration'}
              </button>
            </div>
          </div>

          {stats && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Queue Status</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.summary.queuedLeads + stats.summary.processingLeads} leads pending
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Queued:</span>
                    <span className="ml-2 font-medium">{stats.summary.queuedLeads}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Processing:</span>
                    <span className="ml-2 font-medium">{stats.summary.processingLeads}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Success Rate</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Last 24 hours
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.summary.successRate}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.summary.completedToday} / {stats.summary.totalProcessed} processed
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Configuration Form Modal */}
        {showConfigForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-30"></div>
              <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    LeadHoop Configuration
                  </h2>
                  <button
                    onClick={() => setShowConfigForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Configuration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portal URL
                    </label>
                    <input
                      type="url"
                      value={formData.portalUrl}
                      onChange={(e) => setFormData({...formData, portalUrl: e.target.value})}
                      placeholder="https://ieim-portal.leadhoop.com/consumer/new/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portal ID
                    </label>
                    <input
                      type="text"
                      value={formData.portalId}
                      onChange={(e) => setFormData({...formData, portalId: e.target.value})}
                      placeholder="e.g., aSuRzy0E8XWWKeLJngoDiQ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Automation Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retry Attempts
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.retryAttempts}
                        onChange={(e) => setFormData({...formData, retryAttempts: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retry Delay (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={formData.retryDelayMinutes}
                        onChange={(e) => setFormData({...formData, retryDelayMinutes: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoSubmit"
                      checked={formData.autoSubmit}
                      onChange={(e) => setFormData({...formData, autoSubmit: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoSubmit" className="ml-2 text-sm text-gray-700">
                      Enable automatic submission
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                    <button
                      onClick={() => setShowConfigForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveConfiguration}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {stats && stats.recentActivity.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button
                  onClick={refreshStats}
                  disabled={isRefreshing}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attempt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Processing Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Queued At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentActivity.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {activity.leadName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {activity.leadEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activity.status, activity.success)}`}>
                          {activity.success ? 'SUCCESS' : activity.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.attemptNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.processingTimeMs ? `${(activity.processingTimeMs / 1000).toFixed(1)}s` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(activity.queuedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {activity.leadStatus === 'CONFIRMED' && (
                            <button
                              onClick={() => processLead(activity.leadId)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Process Again"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
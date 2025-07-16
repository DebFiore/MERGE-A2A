'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bot, Users, Phone, CheckCircle, Upload, BarChart3, Settings, LogOut, TrendingUp, Clock, AlertCircle, RefreshCw, Zap } from 'lucide-react'

interface DashboardStats {
  totalLeadsInSystem: number
  leadsLoadedLast24h: number
  leadsPushedToLeadHoop24h: number
  lastUpdated: string
}

interface RecentLead {
  id: string
  name: string
  email: string
  phone?: string
  status: string
  lastContactedAt: string
  company?: string
  source: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeadsInSystem: 1234,
    leadsLoadedLast24h: 89,
    leadsPushedToLeadHoop24h: 156,
    lastUpdated: new Date().toLocaleTimeString()
  })

  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1-555-0123',
      status: 'Confirmed',
      lastContactedAt: '2 minutes ago',
      company: 'Acme Corp',
      source: 'CSV Import'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1-555-0456',
      status: 'Calling',
      lastContactedAt: '5 minutes ago',
      company: 'Tech Solutions',
      source: 'Manual Entry'
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike@example.com',
      phone: '+1-555-0789',
      status: 'Completed',
      lastContactedAt: '10 minutes ago',
      company: 'Digital Agency',
      source: 'CSV Import'
    },
    {
      id: '4',
      name: 'Lisa Davis',
      email: 'lisa@example.com',
      phone: '+1-555-0321',
      status: 'Failed',
      lastContactedAt: '15 minutes ago',
      company: 'Marketing Plus',
      source: 'API'
    },
  ])

  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshDashboard = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update stats with some random variation
    setStats(prev => ({
      ...prev,
      leadsLoadedLast24h: Math.max(0, prev.leadsLoadedLast24h + Math.floor(Math.random() * 6) - 3),
      leadsPushedToLeadHoop24h: Math.max(0, prev.leadsPushedToLeadHoop24h + Math.floor(Math.random() * 4) - 2),
      lastUpdated: new Date().toLocaleTimeString()
    }))
    
    setIsRefreshing(false)
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshDashboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const dashboardCards = [
    {
      name: 'Total Leads in System',
      value: stats.totalLeadsInSystem.toLocaleString(),
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Leads Loaded (24h)',
      value: stats.leadsLoadedLast24h.toString(),
      change: '+' + stats.leadsLoadedLast24h + ' today',
      icon: Upload,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Pushed to LeadHoop (24h)',
      value: stats.leadsPushedToLeadHoop24h.toString(),
      change: '+' + stats.leadsPushedToLeadHoop24h + ' today',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'calling':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
           <span className="text-sm text-gray-700">Welcome back!</span>
              <Link href="/login" className="text-gray-400 hover:text-gray-500">
                <LogOut className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex">
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-lg font-semibold text-gray-900">Dashboard</span>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                <a href="#" className="bg-blue-50 border-blue-500 text-blue-700 group flex items-center px-2 py-2 text-sm font-medium border-l-4">
                  <BarChart3 className="text-blue-500 mr-3 h-5 w-5" />
                  Overview
                </a>
                <Link href="/dashboard/upload" className="border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium border-l-4">
                  <Upload className="text-gray-400 mr-3 h-5 w-5" />
                  Upload Leads
                </Link>
                <Link href="/dashboard/leads" className="border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium border-l-4">
                  <Users className="text-gray-400 mr-3 h-5 w-5" />
                  All Leads
                </Link>
                <Link href="/dashboard/leadhoop" className="border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium border-l-4">
                  <Zap className="text-gray-400 mr-3 h-5 w-5" />
                  LeadHoop
                </Link>
                <a href="#" className="border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium border-l-4">
                  <Users className="text-gray-400 mr-3 h-5 w-5" />
                  Campaigns
                </a>
                <Link href="/dashboard/settings" className="border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium border-l-4">
                  <Settings className="text-gray-400 mr-3 h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-500">
                      Last updated: {stats.lastUpdated}
                    </div>
                    <button
                      onClick={refreshDashboard}
                      disabled={isRefreshing}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Enhanced Stats */}
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {dashboardCards.map((card) => (
                    <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 p-3 rounded-lg ${card.bgColor}`}>
                            <card.icon className={`h-6 w-6 ${card.color}`} />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                {card.name}
                              </dt>
                              <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">
                                  {card.value}
                                </div>
                                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                                  card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {card.change}
                                </div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Leads Button */}
                <div className="mt-6 text-center">
                  <Link
                    href="/dashboard/leads"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    View All Leads
                  </Link>
                </div>

                {/* Analytics Row */}
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Success Rate */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500">Success Rate</dt>
                            <dd className="text-3xl font-bold text-green-600">{stats.successRate}%</dd>
                          </dl>
                        </div>
                      </div>
                      <div className="mt-5">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${stats.successRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Average Call Duration */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Clock className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500">Avg Call Duration</dt>
                            <dd className="text-3xl font-bold text-blue-600">{stats.averageCallDuration}m</dd>
                          </dl>
                        </div>
                      </div>
                      <div className="mt-5">
                        <p className="text-sm text-gray-600">
                          Target: 5-7 minutes
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <Link
                          href="/dashboard/upload"
                          className="flex items-center w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Leads
                        </Link>
                        <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                          <Phone className="h-4 w-4 mr-2" />
                          Start Campaign
                        </button>
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Recent Leads Table */}
                <div className="mt-8">
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Recent Activity
                        </h3>
                        <Link
                          href="/dashboard/leads"
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          View All Leads →
                        </Link>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Company
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Source
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Contact
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {recentLeads.map((lead) => (
                              <tr key={lead.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-700">
                                          {lead.name.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {lead.name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {lead.email}
                                      </div>
                                      {lead.phone && (
                                        <div className="text-xs text-gray-400">
                                          {lead.phone}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {lead.company || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                    {lead.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {lead.source}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {lead.lastContactedAt}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <button className="text-blue-600 hover:text-blue-900">
                                      Call
                                    </button>
                                    <button className="text-green-600 hover:text-green-900">
                                      Edit
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

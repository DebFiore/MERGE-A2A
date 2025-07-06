'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bot, Users, Phone, CheckCircle, Upload, BarChart3, Settings, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    { name: 'Total Leads', value: '1,234', change: '+12%', icon: Users },
    { name: 'Pending Calls', value: '89', change: '-3%', icon: Phone },
    { name: 'Confirmed', value: '856', change: '+8%', icon: CheckCircle },
    { name: 'Completed', value: '742', change: '+15%', icon: BarChart3 },
  ]

  const recentLeads = [
    { name: 'John Smith', email: 'john@example.com', status: 'Confirmed', date: '2 min ago' },
    { name: 'Sarah Johnson', email: 'sarah@example.com', status: 'Pending', date: '5 min ago' },
    { name: 'Mike Wilson', email: 'mike@example.com', status: 'Complete', date: '10 min ago' },
    { name: 'Lisa Davis', email: 'lisa@example.com', status: 'Calling', date: '15 min ago' },
  ]

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
             <span className="text-sm text-gray-700">Welcome back, {firstName}!</span>
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
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Stats */}
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <stat.icon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                {stat.name}
                              </dt>
                              <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">
                                  {stat.value}
                                </div>
                                <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                  {stat.change}
                                </div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Leads Table */}
                <div className="mt-8">
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Recent Leads
                      </h3>
                      <div className="flow-root">
                        <ul className="-my-5 divide-y divide-gray-200">
                          {recentLeads.map((lead, index) => (
                            <li key={index} className="py-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {lead.name}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {lead.email}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    lead.status === 'Complete' ? 'bg-green-100 text-green-800' :
                                    lead.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                                    lead.status === 'Calling' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {lead.status}
                                  </span>
                                </div>
                                <div className="flex-shrink-0 text-sm text-gray-500">
                                  {lead.date}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Button */}
                <div className="mt-8">
                  <button className="btn-primary">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Leads
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

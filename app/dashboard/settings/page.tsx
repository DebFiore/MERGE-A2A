import React from 'react'
import Link from 'next/link'
import { Bot, Settings, FileText, CheckCircle, ArrowLeft, Upload, Save } from 'lucide-react'

export default function SettingsPage() {
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
              <span className="text-sm text-gray-700">Welcome back, User!</span>
              <Link href="/login" className="text-gray-400 hover:text-gray-500">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-lg font-semibold text-gray-900">Dashboard</span>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                <Link href="/dashboard" className="border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium border-l-4">
                  <CheckCircle className="text-gray-400 mr-3 h-5 w-5" />
                  Overview
                </Link>
                <Link href="/dashboard/upload" className="border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium border-l-4">
                  <Upload className="text-gray-400 mr-3 h-5 w-5" />
                  Upload Leads
                </Link>
                <a href="#" className="border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium border-l-4">
                  <FileText className="text-gray-400 mr-3 h-5 w-5" />
                  Campaigns
                </a>
                <a href="#" className="bg-blue-50 border-blue-500 text-blue-700 group flex items-center px-2 py-2 text-sm font-medium border-l-4">
                  <Settings className="text-blue-500 mr-3 h-5 w-5" />
                  Settings
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                <p className="mt-2 text-sm text-gray-600">Configure your MERGE AI platform settings and integrations.</p>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  
                  {/* Account Settings */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Account Settings
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Company Name</label>
                          <input type="text" defaultValue="MERGE AI Demo" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                          <input type="email" defaultValue="user@mergeai.com" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Time Zone</label>
                          <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                            <option>Eastern Time (ET)</option>
                            <option>Central Time (CT)</option>
                            <option>Mountain Time (MT)</option>
                            <option>Pacific Time (PT)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VAPI Integration */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        VAPI.AI Integration
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">API Key</label>
                          <input type="password" placeholder="••••••••••••••••" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Voice Agent ID</label>
                          <input type="text" defaultValue="agent_zoe_v1" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                        </div>
                        
                        <div className="flex items-center">
                          <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                          <label className="ml-2 text-sm text-gray-700">Enable automatic calling</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LeadHoop Integration */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        LeadHoop Integration
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Portal URL</label>
                          <input type="url" defaultValue="https://ieim-portal.leadhoop.com" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Form ID</label>
                          <input type="text" defaultValue="aSuRzy0E8XWWKeLJngoDiQ" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Default Area of Study</label>
                          <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                            <option>Business Administration</option>
                            <option>Healthcare</option>
                            <option>Technology</option>
                            <option>Education</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Call Schedule */}
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Calling Schedule
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Start Time</label>
                            <input type="time" defaultValue="09:00" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">End Time</label>
                            <input type="time" defaultValue="17:00" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Active Days</label>
                          <div className="grid grid-cols-7 gap-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                              <label key={day} className="flex items-center">
                                <input type="checkbox" defaultChecked={index < 5} className="h-4 w-4 text-blue-600 rounded" />
                                <span className="ml-1 text-xs text-gray-700">{day}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Save Button */}
                <div className="mt-6 flex justify-between">
                  <Link href="/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Link>
                  <button className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
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

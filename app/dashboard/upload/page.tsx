import React from 'react'
import Link from 'next/link'
import { Bot, Upload, FileText, CheckCircle, ArrowLeft } from 'lucide-react'

export default function UploadLeadsPage() {
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
                <a href="#" className="bg-blue-50 border-blue-500 text-blue-700 group flex items-center px-2 py-2 text-sm font-medium border-l-4">
                  <Upload className="text-blue-500 mr-3 h-5 w-5" />
                  Upload Leads
                </a>
                <a href="#" className="border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium border-l-4">
                  <FileText className="text-gray-400 mr-3 h-5 w-5" />
                  Campaigns
                </a>
                <a href="#" className="border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium border-l-4">
                  <Bot className="text-gray-400 mr-3 h-5 w-5" />
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
                <h1 className="text-2xl font-semibold text-gray-900">Upload Leads</h1>
                <p className="mt-2 text-sm text-gray-600">Upload your leads via CSV to start the AI-powered qualification process.</p>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Upload Area */}
                <div className="mt-6">
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        CSV File Upload
                      </h3>
                      
                      {/* Upload Box */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <p className="text-lg text-gray-600">Drop your CSV file here, or</p>
                          <button className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                            Browse Files
                          </button>
                        </div>
                      </div>

                      {/* CSV Format Requirements */}
                      <div className="mt-8">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Required CSV Format</h4>
                        <div className="bg-gray-50 rounded-md p-4">
                          <p className="text-sm text-gray-600 mb-2">Your CSV file must include these columns:</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Required Fields:</strong>
                              <ul className="mt-1 text-gray-600">
                                <li>• firstName</li>
                                <li>• lastName</li>
                                <li>• email</li>
                                <li>• phone</li>
                              </ul>
                            </div>
                            <div>
                              <strong>Optional Fields:</strong>
                              <ul className="mt-1 text-gray-600">
                                <li>• state</li>
                                <li>• city</li>
                                <li>• zipCode</li>
                                <li>• areaOfStudy</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Process Steps */}
                      <div className="mt-8">
                        <h4 className="text-md font-medium text-gray-900 mb-3">What Happens Next</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
                            <h5 className="font-medium text-gray-900">Upload Processing</h5>
                            <p className="text-sm text-gray-600 mt-1">Leads validated and imported</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
                            <h5 className="font-medium text-gray-900">AI Voice Calls</h5>
                            <p className="text-sm text-gray-600 mt-1">Zoe confirms lead data</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
                            <h5 className="font-medium text-gray-900">Auto Submission</h5>
                            <p className="text-sm text-gray-600 mt-1">Forms submitted to portals</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-8 flex justify-between">
                        <Link href="/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Dashboard
                        </Link>
                        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                          Start Processing
                        </button>
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

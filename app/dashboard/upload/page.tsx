'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bot, Upload, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Check if it's a CSV file
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setError('')
      } else {
        setError('Please select a CSV file')
        setFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    setUploading(true)
    setError('')
    
    // Simulate upload process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
      setUploaded(true)
      setUploading(false)
    } catch (err) {
      setError('Upload failed. Please try again.')
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setUploaded(false)
    setError('')
    setUploading(false)
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Leads</h1>
          <p className="mt-2 text-gray-600">Upload a CSV file containing your lead data</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {!uploaded ? (
            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Drop your CSV file here, or{' '}
                      <span className="text-blue-600 hover:text-blue-500">browse files</span>
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">CSV files only, up to 10MB</p>
                </div>
              </div>

              {/* Selected File Display */}
              {file && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span className="ml-2 text-sm font-medium text-blue-900">
                        {file.name}
                      </span>
                      <span className="ml-2 text-sm text-blue-700">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={resetUpload}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="ml-2 text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    file && !uploading
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {uploading ? 'Uploading...' : 'Upload Leads'}
                </button>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Upload Successful!</h3>
              <p className="mt-2 text-gray-600">
                Your leads have been uploaded and are being processed.
              </p>
              <div className="mt-6 space-x-4">
                <button
                  onClick={resetUpload}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Upload Another File
                </button>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">CSV Format Requirements</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>Your CSV file should include the following columns:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>name</strong> - Lead's full name</li>
              <li><strong>email</strong> - Lead's email address</li>
              <li><strong>phone</strong> - Lead's phone number (optional)</li>
              <li><strong>company</strong> - Lead's company name (optional)</li>
              <li><strong>status</strong> - Lead status (e.g., "New", "Contacted", "Qualified")</li>
            </ul>
            <p className="mt-4">
              <strong>Example:</strong> name,email,phone,company,status
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

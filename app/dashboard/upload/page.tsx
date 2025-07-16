'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Bot, Upload, ArrowLeft, CheckCircle, AlertCircle, Download, Eye, X, FileText } from 'lucide-react'
import Papa from 'papaparse'

interface ParsedLead {
  name: string
  email: string
  phone?: string
  company?: string
  status: string
  firstName?: string
  lastName?: string
  address?: string
  address2?: string
  city?: string
  state?: string
  zipCode?: string
  gender?: string
  dateOfBirth?: string
  ipAddress?: string
  subId2?: string
  signupUrl?: string
  consentUrl?: string
  educationLevel?: string
  graduationYear?: string
  startDate?: string
  militaryType?: string
  campusType?: string
  areaStudyIds?: string
  levelOfInterest?: string
  internetPc?: string
  usCitizen?: string
  rnLicense?: string
  teachingLicense?: string
  enrolledStatus?: string
  testField?: string
  [key: string]: any
}

interface ValidationError {
  row: number
  field: string
  message: string
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedLead[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [processing, setProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validateLeadData = (data: any[]): { validLeads: ParsedLead[], errors: ValidationError[] } => {
    const validLeads: ParsedLead[] = []
    const errors: ValidationError[] = []
    
    data.forEach((row, index) => {
      // Skip empty rows - check for LeadHoop fields
      if (!row.FIRSTNAME && !row.EMAIL && !row.name && !row.email) return
      
      const rowNumber = index + 2 // +2 because index starts at 0 and we have header row
      
      // Support both LeadHoop format and legacy format
      const firstName = row.FIRSTNAME?.trim() || ''
      const lastName = row.LASTNAME?.trim() || ''
      const name = row.name?.trim() || (firstName && lastName ? `${firstName} ${lastName}` : '')
      const email = row.EMAIL?.trim() || row.email?.trim() || ''
      const phone = row.PHONE1?.trim() || row.phone?.trim() || ''
      const company = row.COMPANY?.trim() || row.company?.trim() || ''
      const status = row.STATUS?.trim() || row.status?.trim() || 'New'
      
      // Validate required fields
      if (!name && !firstName) {
        errors.push({ row: rowNumber, field: 'name', message: 'Name or FIRSTNAME is required' })
      }
      
      if (!email) {
        errors.push({ row: rowNumber, field: 'email', message: 'Email is required' })
      } else if (!validateEmail(email)) {
        errors.push({ row: rowNumber, field: 'email', message: 'Invalid email format' })
      }
      
      // If no critical errors, add to valid leads
      const hasRowErrors = errors.some(err => err.row === rowNumber)
      if (!hasRowErrors) {
        validLeads.push({
          name: name || `${firstName} ${lastName}`.trim(),
          email: email,
          phone: phone,
          company: company,
          status: status,
          // Include all LeadHoop fields
          firstName: firstName,
          lastName: lastName,
          address: row.ADDRESS?.trim() || '',
          address2: row.ADDRESS2?.trim() || '',
          city: row.CITY?.trim() || '',
          state: row.STATE?.trim() || '',
          zipCode: row.ZIP?.trim() || '',
          gender: row.GENDER?.trim() || '',
          dateOfBirth: row.DOB?.trim() || '',
          ipAddress: row.IP?.trim() || '',
          subId2: row.SUBID2?.trim() || '',
          signupUrl: row.SIGNUP_URL?.trim() || '',
          consentUrl: row.CONSENT_URL?.trim() || '',
          educationLevel: row.EDUCATION_LEVEL?.trim() || '',
          graduationYear: row.GRAD_YEAR?.trim() || '',
          startDate: row.START_DATE?.trim() || '',
          militaryType: row.MILITARY_TYPE?.trim() || '',
          campusType: row.CAMPUS_TYPE?.trim() || '',
          areaStudyIds: row.AREA_STUDY_IDS?.trim() || '',
          levelOfInterest: row.LEVEL_OF_INTEREST?.trim() || '',
          internetPc: row.INTERNET_PC?.trim() || '',
          usCitizen: row.US_CITIZEN?.trim() || '',
          rnLicense: row.RN_LICENSE?.trim() || '',
          teachingLicense: row.TEACHING_LICENSE?.trim() || '',
          enrolledStatus: row.ENROLLED_STATUS?.trim() || '',
          testField: row.TEST?.trim() || ''
        })
      }
    })
    
    return { validLeads, errors }
  }

  const processFile = (selectedFile: File) => {
    setProcessing(true)
    setError('')
    setParsedData([])
    setValidationErrors([])
    
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { validLeads, errors } = validateLeadData(results.data)
        setParsedData(validLeads)
        setValidationErrors(errors)
        setShowPreview(true)
        setProcessing(false)
        
        if (errors.length > 0) {
          setError(`Found ${errors.length} validation error(s). Please review and fix them before uploading.`)
        }
      },
      error: (error) => {
        setError('Failed to parse CSV file. Please check the file format.')
        setProcessing(false)
      }
    })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      handleFileSelection(selectedFile)
    }
  }

  const handleFileSelection = (selectedFile: File) => {
    // Check if it's a CSV file
    if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      setFile(selectedFile)
      setError('')
      processFile(selectedFile)
    } else {
      setError('Please select a CSV file')
      setFile(null)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelection(files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = async () => {
    if (!file || validationErrors.length > 0) return
    
    setUploading(true)
    setError('')
    
    try {
      // Simulate upload process with progress
      for (let i = 0; i <= parsedData.length; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Simulate API call to upload leads
      const response = await fetch('/api/leads/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leads: parsedData }),
      })
      
      if (response.ok) {
        setUploaded(true)
        setUploading(false)
      } else {
        throw new Error('Upload failed')
      }
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
    setParsedData([])
    setValidationErrors([])
    setShowPreview(false)
    setProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const template = 'FIRSTNAME,LASTNAME,EMAIL,PHONE1,TEST,ADDRESS,ADDRESS2,CITY,STATE,ZIP,GENDER,DOB,IP,SUBID2,SIGNUP_URL,CONSENT_URL,EDUCATION_LEVEL,GRAD_YEAR,START_DATE,MILITARY_TYPE,CAMPUS_TYPE,AREA_STUDY_IDS,LEVEL_OF_INTEREST,INTERNET_PC,US_CITIZEN,RN_LICENSE,TEACHING_LICENSE,ENROLLED_STATUS,COMPANY,STATUS\nJohn,Doe,john@example.com,555-0123,Test Value,123 Main St,Apt 1,City,CA,90210,Male,1990-01-01,192.168.1.1,SUB123,https://signup.com,https://consent.com,Bachelor,2020,2021-01-01,Army,Online,AREA123,High,Yes,Yes,Yes,Yes,Active,Acme Corp,New\nJane,Smith,jane@example.com,555-0456,Test Value,456 Oak Ave,Suite 2,Town,NY,10001,Female,1985-05-15,192.168.1.2,SUB456,https://signup.com,https://consent.com,Master,2018,2019-01-01,Navy,Campus,AREA456,Medium,Yes,Yes,No,No,Active,Tech Solutions,Contacted'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leadhoop-template.csv'
    a.click()
    URL.revokeObjectURL(url)
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
              {/* Download Template Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Upload Leads</h2>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </button>
              </div>

              {/* Enhanced File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : file
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {processing ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-sm text-gray-600">Processing CSV file...</p>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="h-12 w-12 text-green-600" />
                    <div className="mt-4">
                      <p className="text-sm font-medium text-green-900">{file.name}</p>
                      <p className="text-xs text-green-700">
                        {(file.size / 1024).toFixed(1)} KB • {parsedData.length} valid leads
                        {validationErrors.length > 0 && (
                          <span className="text-red-600"> • {validationErrors.length} errors</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={resetUpload}
                      className="mt-3 px-3 py-1 text-xs text-red-600 hover:text-red-800"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="cursor-pointer" onClick={openFileDialog}>
                    <Upload className={`mx-auto h-12 w-12 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="mt-4">
                      <p className={`text-sm font-medium ${dragActive ? 'text-blue-900' : 'text-gray-900'}`}>
                        {dragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
                      </p>
                      <p className="mt-1 text-sm text-blue-600 hover:text-blue-500">
                        or click to browse files
                      </p>
                      <p className="mt-1 text-xs text-gray-500">CSV files only, up to 10MB</p>
                    </div>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Found {validationErrors.length} validation error(s)
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                          {validationErrors.slice(0, 5).map((error, index) => (
                            <li key={index}>
                              Row {error.row}: {error.message} ({error.field})
                            </li>
                          ))}
                          {validationErrors.length > 5 && (
                            <li className="font-medium">
                              ...and {validationErrors.length - 5} more errors
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* General Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="ml-2 text-sm text-red-800">{error}</span>
                  </div>
                </div>
              )}

              {/* Data Preview */}
              {showPreview && parsedData.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      Preview ({parsedData.length} leads)
                    </h3>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {parsedData.slice(0, 5).map((lead, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-gray-900">{lead.name}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{lead.email}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">{lead.phone || '-'}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">{lead.company || '-'}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">{lead.status}</td>
                          </tr>
                        ))}
                        {parsedData.length > 5 && (
                          <tr>
                            <td colSpan={5} className="px-3 py-2 text-sm text-gray-500 text-center">
                              ...and {parsedData.length - 5} more leads
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {file && parsedData.length > 0 && (
                    <span>Ready to upload {parsedData.length} leads</span>
                  )}
                </div>
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading || validationErrors.length > 0 || parsedData.length === 0}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    file && !uploading && validationErrors.length === 0 && parsedData.length > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {uploading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    `Upload ${parsedData.length} Leads`
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Upload Successful!</h3>
              <p className="mt-2 text-gray-600">
                Successfully uploaded {parsedData.length} leads. They are now available in your dashboard.
              </p>
              
              {/* Upload Summary */}
              <div className="mt-6 max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-green-800">Total Leads:</span>
                    <span className="text-green-700 ml-2">{parsedData.length}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">File Size:</span>
                    <span className="text-green-700 ml-2">{file ? (file.size / 1024).toFixed(1) : 0} KB</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Status:</span>
                    <span className="text-green-700 ml-2">Ready for calling</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Campaign:</span>
                    <span className="text-green-700 ml-2">Default</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-x-4">
                <button
                  onClick={resetUpload}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Upload Another File
                </button>
                <Link
                  href="/dashboard/leads"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View All Leads
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">LeadHoop CSV Format Requirements</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>Your CSV file should include the following LeadHoop-compatible columns:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>FIRSTNAME</strong> - Lead's first name</li>
                <li><strong>LASTNAME</strong> - Lead's last name</li>
                <li><strong>EMAIL</strong> - Lead's email address</li>
                <li><strong>PHONE1</strong> - Lead's phone number</li>
                <li><strong>ADDRESS</strong> - Street address</li>
                <li><strong>ADDRESS2</strong> - Apartment/Suite</li>
                <li><strong>CITY</strong> - City</li>
                <li><strong>STATE</strong> - State</li>
                <li><strong>ZIP</strong> - ZIP code</li>
                <li><strong>GENDER</strong> - Gender</li>
                <li><strong>DOB</strong> - Date of birth</li>
                <li><strong>IP</strong> - IP address</li>
                <li><strong>SUBID2</strong> - Sub ID</li>
                <li><strong>SIGNUP_URL</strong> - Signup URL</li>
                <li><strong>CONSENT_URL</strong> - Consent URL</li>
              </ul>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>EDUCATION_LEVEL</strong> - Education level</li>
                <li><strong>GRAD_YEAR</strong> - Graduation year</li>
                <li><strong>START_DATE</strong> - Start date</li>
                <li><strong>MILITARY_TYPE</strong> - Military type</li>
                <li><strong>CAMPUS_TYPE</strong> - Campus type</li>
                <li><strong>AREA_STUDY_IDS</strong> - Area of study IDs</li>
                <li><strong>LEVEL_OF_INTEREST</strong> - Interest level</li>
                <li><strong>INTERNET_PC</strong> - Internet/PC access</li>
                <li><strong>US_CITIZEN</strong> - US citizen status</li>
                <li><strong>RN_LICENSE</strong> - RN license</li>
                <li><strong>TEACHING_LICENSE</strong> - Teaching license</li>
                <li><strong>ENROLLED_STATUS</strong> - Enrollment status</li>
                <li><strong>COMPANY</strong> - Company name</li>
                <li><strong>STATUS</strong> - Lead status</li>
                <li><strong>TEST</strong> - Test field</li>
              </ul>
            </div>
            <p className="mt-4">
              <strong>Download the template above</strong> to get started with the correct format.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

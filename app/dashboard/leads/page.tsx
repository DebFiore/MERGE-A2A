'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bot, ArrowLeft, Phone, Eye, Edit, Search, Filter, X, User, Mail, MapPin, Calendar, Building } from 'lucide-react'

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  status: string
  company?: string
  city?: string
  state?: string
  zipCode?: string
  gender?: string
  dateOfBirth?: string
  address?: string
  address2?: string
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
  createdAt: string
  updatedAt: string
}

export default function AllLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-0123',
      status: 'New',
      company: 'Acme Corp',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      gender: 'Male',
      dateOfBirth: '1990-01-01',
      address: '123 Main St',
      address2: 'Apt 1',
      ipAddress: '192.168.1.1',
      subId2: 'SUB123',
      signupUrl: 'https://signup.com',
      consentUrl: 'https://consent.com',
      educationLevel: 'Bachelor',
      graduationYear: '2020',
      startDate: '2021-01-01',
      militaryType: 'Army',
      campusType: 'Online',
      areaStudyIds: 'AREA123',
      levelOfInterest: 'High',
      internetPc: 'Yes',
      usCitizen: 'Yes',
      rnLicense: 'Yes',
      teachingLicense: 'Yes',
      enrolledStatus: 'Active',
      testField: 'Test Value',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '555-0456',
      status: 'Contacted',
      company: 'Tech Solutions',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      gender: 'Female',
      dateOfBirth: '1985-05-15',
      address: '456 Oak Ave',
      address2: 'Suite 2',
      ipAddress: '192.168.1.2',
      subId2: 'SUB456',
      signupUrl: 'https://signup.com',
      consentUrl: 'https://consent.com',
      educationLevel: 'Master',
      graduationYear: '2018',
      startDate: '2019-01-01',
      militaryType: 'Navy',
      campusType: 'Campus',
      areaStudyIds: 'AREA456',
      levelOfInterest: 'Medium',
      internetPc: 'Yes',
      usCitizen: 'Yes',
      rnLicense: 'No',
      teachingLicense: 'No',
      enrolledStatus: 'Active',
      testField: 'Test Value',
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-14T14:20:00Z'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showLeadDetails, setShowLeadDetails] = useState(false)

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || lead.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'not interested':
        return 'bg-red-100 text-red-800'
      case 'call failed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCall = (lead: Lead) => {
    // Simulate making a call
    alert(`Calling ${lead.firstName} ${lead.lastName} at ${lead.phone}`)
  }

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead)
    setShowLeadDetails(true)
  }

  const handleEdit = (lead: Lead) => {
    // Simulate editing
    alert(`Editing ${lead.firstName} ${lead.lastName}`)
  }

  const closeDetailsModal = () => {
    setShowLeadDetails(false)
    setSelectedLead(null)
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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Leads</h1>
          <p className="mt-2 text-gray-600">Manage and view all your leads</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="confirmed">Confirmed</option>
            <option value="not interested">Not Interested</option>
            <option value="call failed">Call Failed</option>
          </select>
        </div>

        {/* Leads Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.company || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleCall(lead)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                        title="Call"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleViewDetails(lead)}
                        className="text-green-600 hover:text-green-900 p-2 rounded-md hover:bg-green-50"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(lead)}
                        className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-50"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No leads found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Lead Details Modal */}
      {showLeadDetails && selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Lead Details - {selectedLead.firstName} {selectedLead.lastName}
              </h3>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">
                      {selectedLead.firstName} {selectedLead.lastName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{selectedLead.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{selectedLead.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Company:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{selectedLead.company || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${getStatusColor(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Address Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Address:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">
                      {selectedLead.address || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Address 2:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">
                      {selectedLead.address2 || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">City:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{selectedLead.city || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">State:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{selectedLead.state || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">ZIP Code:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{selectedLead.zipCode || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Personal Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Gender:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{selectedLead.gender || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Date of Birth:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{selectedLead.dateOfBirth || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">US Citizen:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{selectedLead.usCitizen || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Military Type:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{selectedLead.militaryType || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Education Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Education Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Education Level:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{selectedLead.educationLevel || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Graduation Year:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{selectedLead.graduationYear || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Campus Type:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{selectedLead.campusType || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Enrolled Status:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{selectedLead.enrolledStatus || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 mr-2"
              >
                Close
              </button>
              <button
                onClick={() => handleEdit(selectedLead)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
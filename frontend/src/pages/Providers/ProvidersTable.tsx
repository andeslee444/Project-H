import React, { useState, useMemo } from 'react'
import { 
  Plus, Search, Filter, User, Mail, Phone, Calendar, Award, 
  Edit, Eye, ChevronDown, ChevronUp, MapPin, Clock, Shield,
  Languages, Users, Stethoscope
} from 'lucide-react'
import type { Provider } from '@/lib/database/types'
import { useAuth } from '@/hooks/useAuthFixed'
import { ProviderSpecialtyModal, MENTAL_HEALTH_SPECIALTIES, ProviderWithSpecialties } from './ProviderSpecialtyModal'
import './Providers.css'

// Mock provider data
const mockProviders: ProviderWithSpecialties[] = [
  {
    id: '1',
    user_id: 'demo-provider-001',
    first_name: 'Sarah',
    last_name: 'Johnson',
    title: 'Dr.',
    email: 'sjohnson@example.com',
    phone: '(555) 123-4567',
    license_number: 'PSY12345',
    license_state: 'CA',
    license_expiry: '2025-12-31',
    specialties: ['Depression', 'Anxiety'],
    languages: ['English', 'Spanish'],
    experience_years: 12,
    bio: 'Experienced therapist specializing in depression and anxiety disorders.',
    availability: {
      monday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' }
    },
    max_patients_per_day: 8,
    session_duration_minutes: 50,
    telehealth_enabled: true,
    in_person_enabled: true,
    accepts_insurance: true,
    insurance_providers: ['Blue Cross', 'Aetna'],
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    provider_specialties: [
      { id: '1', specialty_id: '1', years_experience: 10, certification_info: '', specialty: { id: '1', name: 'Depression', category: 'Mood Disorders' } },
      { id: '2', specialty_id: '2', years_experience: 8, certification_info: '', specialty: { id: '2', name: 'Anxiety/Panic', category: 'Anxiety Disorders' } },
      { id: '3', specialty_id: '3', years_experience: 5, certification_info: '', specialty: { id: '3', name: 'PTSD/Trauma', category: 'Trauma' } }
    ]
  },
  {
    id: '2',
    user_id: 'demo-provider-002',
    first_name: 'Michael',
    last_name: 'Chen',
    title: 'Dr.',
    email: 'mchen@example.com',
    phone: '(555) 234-5678',
    license_number: 'PSY23456',
    license_state: 'CA',
    license_expiry: '2026-06-30',
    specialties: ['Bipolar', 'Schizophrenia'],
    languages: ['English', 'Mandarin', 'Cantonese'],
    experience_years: 15,
    bio: 'Specialized in treating severe mental health conditions with a focus on medication management.',
    availability: {
      tuesday: { start: '10:00', end: '18:00' },
      thursday: { start: '10:00', end: '18:00' },
      friday: { start: '09:00', end: '15:00' }
    },
    max_patients_per_day: 10,
    session_duration_minutes: 45,
    telehealth_enabled: true,
    in_person_enabled: false,
    accepts_insurance: true,
    insurance_providers: ['Kaiser', 'United Healthcare', 'Cigna'],
    status: 'active',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    provider_specialties: [
      { id: '4', specialty_id: '4', years_experience: 12, certification_info: 'Board Certified', specialty: { id: '4', name: 'Bipolar/Manic Depressive', category: 'Mood Disorders' } },
      { id: '5', specialty_id: '5', years_experience: 10, certification_info: '', specialty: { id: '5', name: 'Schizophrenia', category: 'Psychotic Disorders' } },
      { id: '6', specialty_id: '6', years_experience: 15, certification_info: '', specialty: { id: '6', name: 'Personality Disorders', category: 'Mental Health Conditions' } }
    ]
  },
  {
    id: '3',
    user_id: 'demo-provider-003',
    first_name: 'Emily',
    last_name: 'Rodriguez',
    title: 'LCSW',
    email: 'erodriguez@example.com',
    phone: '(555) 345-6789',
    license_number: 'LCSW34567',
    license_state: 'CA',
    license_expiry: '2025-09-30',
    specialties: ['ADHD', 'Autism'],
    languages: ['English', 'Spanish'],
    experience_years: 8,
    bio: 'Child and adolescent specialist with expertise in neurodevelopmental disorders.',
    availability: {
      monday: { start: '08:00', end: '16:00' },
      tuesday: { start: '08:00', end: '16:00' },
      wednesday: { start: '08:00', end: '16:00' },
      thursday: { start: '08:00', end: '16:00' }
    },
    max_patients_per_day: 12,
    session_duration_minutes: 40,
    telehealth_enabled: true,
    in_person_enabled: true,
    accepts_insurance: false,
    insurance_providers: [],
    status: 'active',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    provider_specialties: [
      { id: '7', specialty_id: '7', years_experience: 8, certification_info: 'ADHD Specialist', specialty: { id: '7', name: 'ADD/ADHD', category: 'Neurodevelopmental' } },
      { id: '8', specialty_id: '8', years_experience: 6, certification_info: 'ABA Certified', specialty: { id: '8', name: 'Autism', category: 'Neurodevelopmental' } },
      { id: '9', specialty_id: '9', years_experience: 5, certification_info: '', specialty: { id: '9', name: 'Behavior Modification', category: 'Behavioral' } }
    ]
  },
  {
    id: '4',
    user_id: 'demo-provider-004',
    first_name: 'David',
    last_name: 'Thompson',
    title: 'PhD',
    email: 'dthompson@example.com',
    phone: '(555) 456-7890',
    license_number: 'PSY45678',
    license_state: 'CA',
    license_expiry: '2026-12-31',
    specialties: ['Substance Abuse', 'Addiction'],
    languages: ['English'],
    experience_years: 20,
    bio: 'Addiction recovery specialist with extensive experience in substance abuse counseling.',
    availability: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '14:00' }
    },
    max_patients_per_day: 8,
    session_duration_minutes: 60,
    telehealth_enabled: false,
    in_person_enabled: true,
    accepts_insurance: true,
    insurance_providers: ['Anthem', 'Humana'],
    status: 'active',
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z',
    provider_specialties: [
      { id: '10', specialty_id: '10', years_experience: 20, certification_info: 'CADC-II', specialty: { id: '10', name: 'Chemical Dependency Assessment', category: 'Substance Use' } },
      { id: '11', specialty_id: '11', years_experience: 15, certification_info: '', specialty: { id: '11', name: 'Co-Occurring (substance abuse) disorders', category: 'Substance Use' } },
      { id: '12', specialty_id: '12', years_experience: 10, certification_info: '', specialty: { id: '12', name: 'Compulsive Gambling', category: 'Addiction' } }
    ]
  },
  {
    id: '5',
    user_id: 'demo-provider-005',
    first_name: 'Lisa',
    last_name: 'Martinez',
    title: 'LMFT',
    email: 'lmartinez@example.com',
    phone: '(555) 567-8901',
    license_number: 'LMFT56789',
    license_state: 'CA',
    license_expiry: '2025-03-31',
    specialties: ['Couples Therapy', 'Family Issues'],
    languages: ['English', 'Spanish', 'Portuguese'],
    experience_years: 10,
    bio: 'Family and couples therapist specializing in relationship dynamics and communication.',
    availability: {
      tuesday: { start: '11:00', end: '19:00' },
      wednesday: { start: '11:00', end: '19:00' },
      thursday: { start: '11:00', end: '19:00' },
      saturday: { start: '09:00', end: '14:00' }
    },
    max_patients_per_day: 6,
    session_duration_minutes: 75,
    telehealth_enabled: true,
    in_person_enabled: true,
    accepts_insurance: true,
    insurance_providers: ['Blue Shield', 'Oscar Health'],
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    provider_specialties: [
      { id: '13', specialty_id: '13', years_experience: 10, certification_info: 'Gottman Certified', specialty: { id: '13', name: 'Relatives', category: 'Family & Relationships' } },
      { id: '14', specialty_id: '14', years_experience: 8, certification_info: '', specialty: { id: '14', name: 'Divorce', category: 'Life Transitions' } },
      { id: '15', specialty_id: '15', years_experience: 6, certification_info: '', specialty: { id: '15', name: 'Grief/Bereavement', category: 'Life Transitions' } }
    ]
  },
  {
    id: '6',
    user_id: 'demo-provider-006',
    first_name: 'James',
    last_name: 'Wilson',
    title: 'PsyD',
    email: 'jwilson@example.com',
    phone: '(555) 678-9012',
    license_number: 'PSY67890',
    license_state: 'CA',
    license_expiry: '2026-08-31',
    specialties: ['EMDR', 'Trauma'],
    languages: ['English', 'ASL'],
    experience_years: 18,
    bio: 'Trauma specialist with extensive EMDR training and experience with veterans.',
    availability: {
      monday: { start: '10:00', end: '18:00' },
      wednesday: { start: '10:00', end: '18:00' },
      friday: { start: '10:00', end: '16:00' }
    },
    max_patients_per_day: 7,
    session_duration_minutes: 60,
    telehealth_enabled: true,
    in_person_enabled: true,
    accepts_insurance: true,
    insurance_providers: ['VA Insurance', 'Tricare', 'Blue Cross'],
    status: 'active',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    provider_specialties: [
      { id: '16', specialty_id: '16', years_experience: 15, certification_info: 'EMDR Certified', specialty: { id: '16', name: '(EMDR) Eye Movement Desensitisation Reprocessing', category: 'Therapy Approaches' } },
      { id: '17', specialty_id: '17', years_experience: 18, certification_info: '', specialty: { id: '17', name: 'PTSD/Trauma', category: 'Trauma' } },
      { id: '18', specialty_id: '18', years_experience: 10, certification_info: '', specialty: { id: '18', name: 'Domestic Violence', category: 'Trauma' } }
    ]
  }
]

const ProvidersTable: React.FC = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('all')
  const [providers, setProviders] = useState<ProviderWithSpecialties[]>(mockProviders)
  const [selectedProvider, setSelectedProvider] = useState<ProviderWithSpecialties | null>(null)
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile viewport
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check for demo mode as fallback
  const getDemoUser = () => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true'
    const demoUserStr = localStorage.getItem('demoUser')
    if (isDemoMode && demoUserStr) {
      try {
        return JSON.parse(demoUserStr)
      } catch {
        return null
      }
    }
    return null
  }

  const currentUser = user || getDemoUser()
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin'
  const isProvider = currentUser?.role === 'provider'

  // Mock patient counts and utilization rates
  const providerMetrics = useMemo(() => ({
    '1': { patientCount: 45, utilizationRate: 92 },
    '2': { patientCount: 38, utilizationRate: 85 },
    '3': { patientCount: 42, utilizationRate: 78 },
    '4': { patientCount: 35, utilizationRate: 88 },
    '5': { patientCount: 28, utilizationRate: 75 },
    '6': { patientCount: 40, utilizationRate: 90 }
  }), [])

  // Filter providers based on search term and specialty
  const filteredProviders = useMemo(() => {
    return providers.filter(provider => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        provider.first_name.toLowerCase().includes(searchLower) ||
        provider.last_name.toLowerCase().includes(searchLower) ||
        provider.email.toLowerCase().includes(searchLower) ||
        provider.provider_specialties?.some(ps => 
          ps.specialty.name.toLowerCase().includes(searchLower)
        )
      
      const matchesSpecialty = 
        filterSpecialty === 'all' || 
        provider.provider_specialties?.some(ps => ps.specialty.name === filterSpecialty)
      
      return matchesSearch && matchesSpecialty
    })
  }, [providers, searchTerm, filterSpecialty])

  // Get unique specialties for filter dropdown
  const specialties = useMemo(() => {
    const allSpecialties = providers.flatMap(provider => 
      provider.provider_specialties?.map(ps => ps.specialty.name) || []
    )
    return [...new Set(allSpecialties)].sort()
  }, [providers])

  const handleViewSpecialties = (provider: ProviderWithSpecialties) => {
    setSelectedProvider(provider)
    setShowSpecialtyModal(true)
  }

  const handleSaveSpecialties = (providerId: string, selectedSpecialties: string[]) => {
    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        return {
          ...p,
          provider_specialties: selectedSpecialties.map((name, index) => ({
            id: `${index}`,
            specialty_id: `${index}`,
            specialty: {
              id: `${index}`,
              name,
              category: MENTAL_HEALTH_SPECIALTIES.find(s => s.name === name)?.category
            }
          }))
        }
      }
      return p
    }))
  }

  const toggleRowExpansion = (providerId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(providerId)) {
      newExpanded.delete(providerId)
    } else {
      newExpanded.add(providerId)
    }
    setExpandedRows(newExpanded)
  }

  const canEditSpecialties = (provider: ProviderWithSpecialties) => {
    return isAdmin || (isProvider && (
      provider.user_id === currentUser?.id || 
      provider.id === currentUser?.provider_id ||
      provider.email === currentUser?.email
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Provider Management</h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage healthcare providers and their specialties
              </p>
            </div>
            {isAdmin && (
              <div className="mt-4 sm:mt-0">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Provider
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="sr-only">Search providers</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by name, email, or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              <div className="sm:w-64">
                <label htmlFor="specialty-filter" className="sr-only">Filter by specialty</label>
                <select
                  id="specialty-filter"
                  value={filterSpecialty}
                  onChange={(e) => setFilterSpecialty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="all">All Specialties</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          {/* Desktop Table View */}
          <div className={`${isMobile ? 'hidden' : 'block'} overflow-x-auto"}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialties
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilization
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProviders.map((provider) => {
              const metrics = providerMetrics[provider.id] || { patientCount: 0, utilizationRate: 0 }
              const isExpanded = expandedRows.has(provider.id)
              const canEdit = canEditSpecialties(provider)

              return (
                <React.Fragment key={provider.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {provider.title} {provider.first_name} {provider.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {provider.license_number} ({provider.license_state})
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{provider.email}</div>
                      <div className="text-sm text-gray-500">{provider.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900">
                          {provider.provider_specialties?.slice(0, 2).map(ps => ps.specialty.name).join(', ')}
                          {provider.provider_specialties && provider.provider_specialties.length > 2 && (
                            <span className="text-gray-500"> +{provider.provider_specialties.length - 2} more</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {provider.availability ? 
                            Object.entries(provider.availability)
                              .filter(([_, times]) => times)
                              .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1, 3))
                              .join(', ') 
                            : 'Not set'}
                        </div>
                        {provider.availability && (
                          <div className="text-gray-500 text-xs mt-1">
                            {provider.session_duration_minutes} min sessions
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">{metrics.patientCount} patients</div>
                          <div className="text-gray-500">{metrics.utilizationRate}%</div>
                        </div>
                        <div className="ml-2 w-16">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${metrics.utilizationRate >= 90 ? 'bg-green-500' : metrics.utilizationRate >= 70 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                              style={{ width: `${metrics.utilizationRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        provider.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {provider.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewSpecialties(provider)}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md transition-colors ${
                            canEdit
                              ? 'text-white bg-blue-600 hover:bg-blue-700'
                              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {canEdit ? (
                            <>
                              <Edit className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Manage</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </>
                          )}
                          <span className="sm:inline">Specialties</span>
                        </button>
                        <button
                          onClick={() => toggleRowExpansion(provider.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="px-0 bg-gray-50">
                        <div className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Professional Details</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                {provider.experience_years} years experience
                              </div>
                              <div className="flex items-center gap-2">
                                <Languages className="w-4 h-4" />
                                {provider.languages.join(', ')}
                              </div>
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                License expires: {new Date(provider.license_expiry).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Service Details</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {provider.session_duration_minutes} min sessions
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Max {provider.max_patients_per_day} patients/day
                              </div>
                              <div className="flex items-center gap-2">
                                <Stethoscope className="w-4 h-4" />
                                {[
                                  provider.telehealth_enabled && 'Telehealth',
                                  provider.in_person_enabled && 'In-Person'
                                ].filter(Boolean).join(', ')}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Insurance</h4>
                            <div className="text-sm text-gray-600">
                              {provider.accepts_insurance ? (
                                <div>
                                  Accepts: {provider.insurance_providers?.join(', ') || 'Various'}
                                </div>
                              ) : (
                                <div>Private pay only</div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {provider.bio && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Biography</h4>
                            <p className="text-sm text-gray-600">{provider.bio}</p>
                          </div>
                        )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Card View */}
          {isMobile && (
            <div className="divide-y divide-gray-200">
              {filteredProviders.map((provider) => {
                const metrics = providerMetrics[provider.id] || { patientCount: 0, utilizationRate: 0 }
                const canEdit = canEditSpecialties(provider)
                
                return (
                  <div key={provider.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {provider.title} {provider.first_name} {provider.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {provider.email}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        provider.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {provider.status}
                      </span>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Specialties:</span>
                        <span className="text-gray-900">
                          {provider.provider_specialties?.length || 0} selected
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Utilization:</span>
                        <span className="text-gray-900">
                          {metrics.utilizationRate}% ({metrics.patientCount} patients)
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <button
                        onClick={() => handleViewSpecialties(provider)}
                        className={`w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md transition-colors ${
                          canEdit
                            ? 'text-white bg-blue-600 hover:bg-blue-700'
                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {canEdit ? (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            Manage Specialties
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            View Specialties
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          {filteredProviders.length === 0 && (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No providers found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>

        {/* Results summary */}
        <div className="mt-4 text-sm text-gray-700">
          Showing <span className="font-medium">{filteredProviders.length}</span> of{' '}
          <span className="font-medium">{providers.length}</span> providers
        </div>

      {/* Specialty Modal */}
        {selectedProvider && showSpecialtyModal && (
          <ProviderSpecialtyModal
            provider={selectedProvider}
            isOpen={showSpecialtyModal}
            onClose={() => {
              setShowSpecialtyModal(false)
              setSelectedProvider(null)
            }}
            canEdit={canEditSpecialties(selectedProvider)}
            onSave={handleSaveSpecialties}
          />
        )}
      </div>
    </div>
  )
}

export default ProvidersTable
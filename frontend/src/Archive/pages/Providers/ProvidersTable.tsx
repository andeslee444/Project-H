import React, { useState, useMemo } from 'react'
import { 
  Plus, Search, Filter, User, Mail, Phone, Calendar, Award, 
  Edit, Eye, ChevronDown, ChevronUp, MapPin, Clock, Shield,
  Languages, Users, Stethoscope, Video, Building, X, CheckCircle,
  MoreVertical, Activity, TrendingUp
} from 'lucide-react'
import type { Provider } from '@/lib/database/types'
import { useAuth } from '@/hooks/useAuthFixed'
import { ProviderSpecialtyModal, MENTAL_HEALTH_SPECIALTIES, ProviderWithSpecialties } from './ProviderSpecialtyModal'
import './Providers.css'

// Mock provider data with enhanced information
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
    max_patients_per_day: 6,
    session_duration_minutes: 60,
    telehealth_enabled: true,
    in_person_enabled: true,
    accepts_insurance: true,
    insurance_providers: ['Blue Shield', 'Anthem', 'Medi-Cal'],
    status: 'active',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    provider_specialties: [
      { id: '7', specialty_id: '7', years_experience: 6, certification_info: 'Child Development Specialist', specialty: { id: '7', name: 'ADD/ADHD', category: 'Neurodevelopmental' } },
      { id: '8', specialty_id: '8', years_experience: 5, certification_info: '', specialty: { id: '8', name: 'Autism', category: 'Neurodevelopmental' } },
      { id: '9', specialty_id: '9', years_experience: 8, certification_info: '', specialty: { id: '9', name: 'Developmental Disabilities', category: 'Developmental' } }
    ]
  }
]

// Mock utilization and patient data
const mockUtilizationData: Record<string, { utilization: number; patients: number }> = {
  '1': { utilization: 85, patients: 24 },
  '2': { utilization: 92, patients: 32 },
  '3': { utilization: 78, patients: 18 },
}

type SortField = 'name' | 'specialties' | 'utilization' | 'patients' | 'availability' | 'status'
type SortOrder = 'asc' | 'desc'

interface FilterState {
  search: string
  specialties: string[]
  availability: 'all' | 'available' | 'unavailable'
  insurance: string[]
  languages: string[]
  modality: 'all' | 'telehealth' | 'in-person' | 'both'
}

const ProvidersTable: React.FC = () => {
  const { user } = useAuth()
  const [selectedProvider, setSelectedProvider] = useState<ProviderWithSpecialties | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    specialties: [],
    availability: 'all',
    insurance: [],
    languages: [],
    modality: 'all'
  })
  const [showFilters, setShowFilters] = useState(false)

  const isAdmin = user?.email === 'admin@example.com'
  const canEditSpecialties = isAdmin || user?.email === 'provider@example.com'

  // Get unique values for filters
  const uniqueSpecialties = useMemo(() => {
    const specialties = new Set<string>()
    mockProviders.forEach(p => {
      p.provider_specialties?.forEach(ps => specialties.add(ps.specialty.name))
    })
    return Array.from(specialties).sort()
  }, [])

  const uniqueInsurance = useMemo(() => {
    const insurance = new Set<string>()
    mockProviders.forEach(p => {
      p.insurance_providers?.forEach(i => insurance.add(i))
    })
    return Array.from(insurance).sort()
  }, [])

  const uniqueLanguages = useMemo(() => {
    const languages = new Set<string>()
    mockProviders.forEach(p => {
      p.languages?.forEach(l => languages.add(l))
    })
    return Array.from(languages).sort()
  }, [])

  // Filter and sort providers
  const filteredProviders = useMemo(() => {
    let filtered = [...mockProviders]

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(p => 
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(search) ||
        p.email.toLowerCase().includes(search) ||
        p.specialties?.some(s => s.toLowerCase().includes(search))
      )
    }

    // Specialty filter
    if (filters.specialties.length > 0) {
      filtered = filtered.filter(p => 
        p.provider_specialties?.some(ps => 
          filters.specialties.includes(ps.specialty.name)
        )
      )
    }

    // Insurance filter
    if (filters.insurance.length > 0) {
      filtered = filtered.filter(p => 
        p.insurance_providers?.some(i => filters.insurance.includes(i))
      )
    }

    // Language filter
    if (filters.languages.length > 0) {
      filtered = filtered.filter(p => 
        p.languages?.some(l => filters.languages.includes(l))
      )
    }

    // Modality filter
    if (filters.modality !== 'all') {
      filtered = filtered.filter(p => {
        if (filters.modality === 'telehealth') return p.telehealth_enabled
        if (filters.modality === 'in-person') return p.in_person_enabled
        if (filters.modality === 'both') return p.telehealth_enabled && p.in_person_enabled
        return true
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any

      switch (sortField) {
        case 'name':
          aVal = `${a.first_name} ${a.last_name}`
          bVal = `${b.first_name} ${b.last_name}`
          break
        case 'specialties':
          aVal = a.specialties?.length || 0
          bVal = b.specialties?.length || 0
          break
        case 'utilization':
          aVal = mockUtilizationData[a.id]?.utilization || 0
          bVal = mockUtilizationData[b.id]?.utilization || 0
          break
        case 'patients':
          aVal = mockUtilizationData[a.id]?.patients || 0
          bVal = mockUtilizationData[b.id]?.patients || 0
          break
        case 'availability':
          aVal = Object.keys(a.availability || {}).length
          bVal = Object.keys(b.availability || {}).length
          break
        case 'status':
          aVal = a.status
          bVal = b.status
          break
        default:
          aVal = a.id
          bVal = b.id
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [filters, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
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

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600 bg-red-50'
    if (rate >= 75) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getAvailabilityDays = (availability: Provider['availability']) => {
    if (!availability) return 0
    return Object.keys(availability).length
  }

  return (
    <div className="providers-container">
      {/* Header */}
      <div className="providers-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage healthcare providers and their schedules
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-gray-100' : ''}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filters.specialties.length > 0 || filters.insurance.length > 0 || 
              filters.languages.length > 0 || filters.modality !== 'all') && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                {filters.specialties.length + filters.insurance.length + filters.languages.length + 
                 (filters.modality !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>
          {isAdmin && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              Add Provider
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search providers by name, email, or specialty..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties
              </label>
              <select
                multiple
                value={filters.specialties}
                onChange={(e) => setFilters({
                  ...filters,
                  specialties: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="w-full border rounded-lg p-2"
                size={4}
              >
                {uniqueSpecialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance
              </label>
              <select
                multiple
                value={filters.insurance}
                onChange={(e) => setFilters({
                  ...filters,
                  insurance: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="w-full border rounded-lg p-2"
                size={4}
              >
                {uniqueInsurance.map(insurance => (
                  <option key={insurance} value={insurance}>{insurance}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages
              </label>
              <select
                multiple
                value={filters.languages}
                onChange={(e) => setFilters({
                  ...filters,
                  languages: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="w-full border rounded-lg p-2"
                size={4}
              >
                {uniqueLanguages.map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modality
              </label>
              <select
                value={filters.modality}
                onChange={(e) => setFilters({
                  ...filters,
                  modality: e.target.value as FilterState['modality']
                })}
                className="w-full border rounded-lg p-2"
              >
                <option value="all">All</option>
                <option value="telehealth">Telehealth Only</option>
                <option value="in-person">In-Person Only</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({
                search: '',
                specialties: [],
                availability: 'all',
                insurance: [],
                languages: [],
                modality: 'all'
              })}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Providers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Provider
                    {sortField === 'name' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('specialties')}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Specialties
                    {sortField === 'specialties' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('utilization')}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Utilization
                    {sortField === 'utilization' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('patients')}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Patients
                    {sortField === 'patients' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('availability')}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Availability
                    {sortField === 'availability' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modality
                  </div>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    Status
                    {sortField === 'status' && (
                      sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-right">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProviders.map((provider) => {
                const utilization = mockUtilizationData[provider.id]
                const isExpanded = expandedRows.has(provider.id)
                
                return (
                  <React.Fragment key={provider.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {provider.title} {provider.first_name} {provider.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{provider.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {provider.provider_specialties?.slice(0, 2).map((ps) => (
                            <span key={ps.id} className="badge-blue text-xs">
                              {ps.specialty.name}
                            </span>
                          ))}
                          {provider.provider_specialties && provider.provider_specialties.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{provider.provider_specialties.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${utilization?.utilization || 0}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium px-2 py-1 rounded ${getUtilizationColor(utilization?.utilization || 0)}`}>
                            {utilization?.utilization || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{utilization?.patients || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getAvailabilityDays(provider.availability)} days/week
                        </div>
                        <div className="text-xs text-gray-500">
                          {provider.max_patients_per_day} patients/day max
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {provider.telehealth_enabled && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                              <Video className="w-3 h-3" />
                              Telehealth
                            </span>
                          )}
                          {provider.in_person_enabled && (
                            <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                              <Building className="w-3 h-3" />
                              In-Person
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          provider.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {provider.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleRowExpansion(provider.id)}
                            className="text-gray-400 hover:text-gray-600"
                            title={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProvider(provider)
                              setShowDetailModal(true)
                            }}
                            className="text-gray-400 hover:text-gray-600"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canEditSpecialties && (
                            <button
                              onClick={() => {
                                setSelectedProvider(provider)
                                setShowSpecialtyModal(true)
                              }}
                              className="text-gray-400 hover:text-gray-600"
                              title="Manage Specialties"
                            >
                              <Stethoscope className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setSelectedProvider(provider)
                                // Handle edit
                              }}
                              className="text-gray-400 hover:text-gray-600"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  {provider.phone}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  {provider.email}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  License: {provider.license_number} ({provider.license_state})
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Languages & Insurance</h4>
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <Languages className="w-4 h-4 text-gray-400 mt-0.5" />
                                  <div className="text-sm text-gray-600">
                                    {provider.languages?.join(', ')}
                                  </div>
                                </div>
                                {provider.accepts_insurance && (
                                  <div className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div className="text-sm text-gray-600">
                                      {provider.insurance_providers?.join(', ')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Schedule</h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                {Object.entries(provider.availability || {}).map(([day, hours]) => (
                                  <div key={day} className="flex justify-between">
                                    <span className="capitalize">{day}:</span>
                                    <span>{hours.start} - {hours.end}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {provider.bio && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Biography</h4>
                              <p className="text-sm text-gray-600">{provider.bio}</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No providers found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showSpecialtyModal && selectedProvider && (
        <ProviderSpecialtyModal
          provider={selectedProvider}
          isOpen={showSpecialtyModal}
          onClose={() => {
            setShowSpecialtyModal(false)
            setSelectedProvider(null)
          }}
          canEdit={canEditSpecialties}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedProvider && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-semibold">Provider Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold">
                    {selectedProvider.title} {selectedProvider.first_name} {selectedProvider.last_name}
                  </h3>
                  <p className="text-gray-600">{selectedProvider.email}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-sm text-gray-500">
                      {selectedProvider.experience_years} years experience
                    </span>
                    <span className="text-sm text-gray-500">
                      {selectedProvider.session_duration_minutes} min sessions
                    </span>
                  </div>
                </div>
              </div>

              {/* Full provider details here */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.provider_specialties?.map((ps) => (
                      <span key={ps.id} className="badge-blue">
                        {ps.specialty.name}
                        {ps.years_experience && (
                          <span className="ml-1 text-xs opacity-75">
                            ({ps.years_experience}y)
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utilization Rate</span>
                      <span className="font-medium">
                        {mockUtilizationData[selectedProvider.id]?.utilization || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Patients</span>
                      <span className="font-medium">
                        {mockUtilizationData[selectedProvider.id]?.patients || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProvidersTable
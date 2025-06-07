import React, { useState, useMemo } from 'react'
import { Plus, Search, Filter, User, Mail, Phone, Calendar, Award, Edit, Eye, X, CheckCircle } from 'lucide-react'
import type { Provider } from '@/lib/database/types'
import { useAuth } from '@/hooks/useAuthFixed'
import './Providers.css'

// Enhanced Provider type with specialties
interface ProviderWithSpecialties extends Provider {
  provider_specialties?: Array<{
    id: string
    specialty_id: string
    years_experience?: number
    certification_info?: string
    specialty: {
      id: string
      name: string
      category?: string
    }
  }>
}

// Complete list of specialties
const MENTAL_HEALTH_SPECIALTIES = [
  { category: 'Mental Health Conditions', name: 'Adjustment Disorders' },
  { category: 'Neurodevelopmental', name: 'ADD/ADHD' },
  { category: 'Anxiety Disorders', name: 'Anxiety/Panic' },
  { category: 'Behavioral', name: 'Anger Mgmt' },
  { category: 'Neurodevelopmental', name: 'Autism' },
  { category: 'Medical Clearance', name: 'Bariatric/Spinal Stimulator Clearance' },
  { category: 'Behavioral', name: 'Behavior Modification' },
  { category: 'Mood Disorders', name: 'Bipolar/Manic Depressive' },
  { category: 'Therapy Approaches', name: 'Brief Solution focused' },
  { category: 'Substance Use', name: 'Chemical Dependency Assessment' },
  { category: 'Faith-Based', name: 'Christian Counseling' },
  { category: 'Therapy Approaches', name: 'Cognitive Behavioral Therapy' },
  { category: 'Addiction', name: 'Compulsive Gambling' },
  { category: 'Substance Use', name: 'Co-Occurring (substance abuse) disorders' },
  { category: 'Cultural', name: 'Cultural/Ethnic Issues' },
  { category: 'Mood Disorders', name: 'Depression' },
  { category: 'Developmental', name: 'Developmental Disabilities' },
  { category: 'Therapy Approaches', name: 'Dialectical Behavioral Therapy' },
  { category: 'Assessment', name: 'Disability Assessment/Treatment' },
  { category: 'Mental Health Conditions', name: 'Dissociative/Identity Disorders' },
  { category: 'Life Transitions', name: 'Divorce' },
  { category: 'Eating & Body Image', name: 'Eating Disorders' },
  { category: 'Therapy Approaches', name: '(EMDR) Eye Movement Desensitisation Reprocessing' },
  { category: 'Life Transitions', name: 'End of life issues' },
  { category: 'Therapy Approaches', name: 'EX-RP Therapy' },
  { category: 'Faith-Based', name: 'Faith-based therapy' },
  { category: 'Life Transitions', name: 'Grief/Bereavement' },
  { category: 'LGBTQ+', name: 'Gay/Lesbian/Bisexual Issues' },
  { category: 'Gender-Specific', name: "Men's Issues" },
  { category: 'Anxiety Disorders', name: 'OCD' },
  { category: 'Medical', name: 'Pain Management' },
  { category: 'Mental Health Conditions', name: 'Personality Disorders' },
  { category: 'Trauma', name: 'PTSD/Trauma' },
  { category: 'Perinatal', name: 'Postpartum Issues' },
  { category: 'Attachment', name: 'Reactive Attachment Disorder' },
  { category: 'Psychotic Disorders', name: 'Schizophrenia' },
  { category: 'Sexual Health', name: 'Sexual Disorders' },
  { category: 'Sleep', name: 'Sleep Disorders' },
  { category: 'Stress & Coping', name: 'Stress Management' },
  { category: 'LGBTQ+', name: 'Transgender Issues' },
  { category: 'Gender-Specific', name: "Women's Issues" },
  { category: 'Family & Relationships', name: 'Relatives' },
  { category: 'Medical Clearance', name: 'Spinal Stimulator Clearance' },
  { category: 'Trauma', name: 'Domestic Violence' },
  { category: 'Sexual Health', name: 'Problematic Sexual Behaviors' },
  { category: 'Perinatal', name: 'Pregnant Women' }
]

// Mock provider data with new specialties structure
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

interface ProviderSpecialtyModalProps {
  provider: ProviderWithSpecialties
  isOpen: boolean
  onClose: () => void
  canEdit: boolean
  onSave?: (providerId: string, selectedSpecialties: string[]) => void
}

const ProviderSpecialtyModal: React.FC<ProviderSpecialtyModalProps> = ({
  provider,
  isOpen,
  onClose,
  canEdit,
  onSave
}) => {
  const [editMode, setEditMode] = useState(false)
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(
    new Set(provider.provider_specialties?.map(ps => ps.specialty.name) || [])
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  if (!isOpen) return null

  const groupedSpecialties = MENTAL_HEALTH_SPECIALTIES.reduce((acc, specialty) => {
    const category = specialty.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(specialty)
    return acc
  }, {} as Record<string, typeof MENTAL_HEALTH_SPECIALTIES>)

  const filteredGrouped = Object.entries(groupedSpecialties).reduce((acc, [category, items]) => {
    const filtered = items.filter(specialty =>
      specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (filtered.length > 0) {
      acc[category] = filtered
    }
    return acc
  }, {} as typeof groupedSpecialties)

  const handleToggleSpecialty = (specialtyName: string) => {
    const newSelected = new Set(selectedSpecialties)
    if (newSelected.has(specialtyName)) {
      newSelected.delete(specialtyName)
    } else {
      newSelected.add(specialtyName)
    }
    setSelectedSpecialties(newSelected)
  }

  const handleSave = () => {
    if (onSave) {
      onSave(provider.id, Array.from(selectedSpecialties))
    }
    setEditMode(false)
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {provider.title} {provider.first_name} {provider.last_name}'s Specialties
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {editMode 
                  ? 'Select all specialties that apply'
                  : `${selectedSpecialties.size} specialties selected`
                }
              </p>
            </div>
            
            <div className="flex gap-2">
              {canEdit && (
                editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Edit Specialties
                  </button>
                )
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {editMode && (
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search specialties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {editMode ? (
            <div className="space-y-4">
              {Object.entries(filteredGrouped).map(([category, items]) => (
                <div key={category} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900">{category}</span>
                    <span className="text-sm text-gray-500">
                      {items.filter(s => selectedSpecialties.has(s.name)).length} / {items.length} selected
                    </span>
                  </button>
                  
                  {(expandedCategories.has(category) || searchTerm) && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {items.map(specialty => (
                        <label
                          key={specialty.name}
                          className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSpecialties.has(specialty.name)}
                            onChange={() => handleToggleSpecialty(specialty.name)}
                            className="mt-1 w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-gray-900">{specialty.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from(selectedSpecialties).length > 0 ? (
                Array.from(selectedSpecialties).map(specialty => (
                  <div
                    key={specialty}
                    className="flex items-center gap-2 p-3 bg-blue-50 text-blue-900 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{specialty}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No specialties selected yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ProviderCardProps {
  provider: ProviderWithSpecialties
  utilizationRate: number
  patientCount: number
  onAction: (providerId: string, action: ProviderAction) => void
  onViewSpecialties: (provider: ProviderWithSpecialties) => void
  canEditSpecialties: boolean
}

type ProviderAction = 'view' | 'edit' | 'waitlist'

const ProviderCard: React.FC<ProviderCardProps> = ({ 
  provider, 
  utilizationRate, 
  patientCount, 
  onAction,
  onViewSpecialties,
  canEditSpecialties
}) => {
  const formatAvailability = () => {
    if (!provider.availability) return 'Not set'
    
    const days = Object.entries(provider.availability)
      .filter(([_, times]) => times !== undefined)
      .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1, 3))
      .join(', ')
    
    return days || 'Not available'
  }

  const modalities = [
    provider.telehealth_enabled && 'Telehealth',
    provider.in_person_enabled && 'In-Person'
  ].filter(Boolean).join(', ')

  const specialtyCount = provider.provider_specialties?.length || 0

  return (
    <div className="provider-card">
      <div className="provider-header">
        <h3 className="provider-name">
          {provider.title} {provider.first_name} {provider.last_name}
        </h3>
        <div 
          className="utilization-badge" 
          style={{ 
            backgroundColor: utilizationRate >= 90 ? '#47B881' : '#4A6FA5' 
          }}
        >
          {utilizationRate}% Utilized
        </div>
      </div>
      
      <div className="provider-details">
        <div className="detail-row">
          <span className="detail-label">Email:</span>
          <span className="detail-value">{provider.email}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Phone:</span>
          <span className="detail-value">{provider.phone}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">License:</span>
          <span className="detail-value">
            {provider.license_number} ({provider.license_state})
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Specialties:</span>
          <span className="detail-value">
            {specialtyCount > 0 ? (
              <>
                {provider.provider_specialties?.slice(0, 2).map(ps => ps.specialty.name).join(', ')}
                {specialtyCount > 2 && ` +${specialtyCount - 2} more`}
              </>
            ) : (
              'None selected'
            )}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Languages:</span>
          <span className="detail-value">{provider.languages.join(', ')}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Experience:</span>
          <span className="detail-value">{provider.experience_years} years</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Modalities:</span>
          <span className="detail-value">{modalities}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Availability:</span>
          <span className="detail-value">{formatAvailability()}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Insurance:</span>
          <span className="detail-value">
            {provider.accepts_insurance 
              ? provider.insurance_providers?.join(', ') || 'Various'
              : 'Private Pay Only'}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Patients:</span>
          <span className="detail-value">{patientCount}</span>
        </div>
      </div>
      
      <div className="provider-actions">
        <button 
          className="action-button"
          onClick={() => onViewSpecialties(provider)}
          style={{ 
            backgroundColor: canEditSpecialties ? '#4A6FA5' : '#6B7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {canEditSpecialties ? (
            <>
              <Edit className="w-4 h-4" />
              Manage Specialties
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              View Specialties
            </>
          )}
        </button>
        <button 
          className="action-button"
          onClick={() => onAction(provider.id, 'view')}
        >
          View Schedule
        </button>
        <button 
          className="action-button"
          onClick={() => onAction(provider.id, 'waitlist')}
        >
          View Waitlist
        </button>
      </div>
    </div>
  )
}

const ProvidersEnhanced: React.FC = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('all')
  const [providers, setProviders] = useState<ProviderWithSpecialties[]>(mockProviders)
  const [selectedProvider, setSelectedProvider] = useState<ProviderWithSpecialties | null>(null)
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false)

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
  
  // Handle provider action
  const handleProviderAction = (providerId: string, action: ProviderAction) => {
    console.log(`Action ${action} on provider ${providerId}`)
    // TODO: Implement actual actions
  }

  const handleViewSpecialties = (provider: ProviderWithSpecialties) => {
    setSelectedProvider(provider)
    setShowSpecialtyModal(true)
  }

  const handleSaveSpecialties = (providerId: string, selectedSpecialties: string[]) => {
    // Update the provider's specialties in the state
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

  return (
    <div className="providers-page">
      <h1 className="page-title">Provider Management</h1>
      
      <div className="providers-actions">
        {/* Only show Add Provider button for admins */}
        {isAdmin && (
          <button className="add-provider-button">
            <Plus className="w-4 h-4 inline mr-2" />
            Add Provider
          </button>
        )}
        
        <div className="provider-filters">
          <div className="filter-dropdown">
            <select 
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              aria-label="Filter by specialty"
            >
              <option value="all">All Specialties</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search providers"
            />
          </div>
        </div>
      </div>
      
      <div className="providers-grid">
        {filteredProviders.length === 0 ? (
          <div className="no-results">
            <p>No providers found matching your criteria.</p>
          </div>
        ) : (
          filteredProviders.map(provider => {
            const metrics = providerMetrics[provider.id] || {
              patientCount: 0,
              utilizationRate: 0
            }
            
            // Check if current user can edit this provider's specialties
            const canEditSpecialties = isAdmin || 
              (isProvider && (
                provider.user_id === currentUser?.id || 
                provider.id === currentUser?.provider_id ||
                provider.email === currentUser?.email
              ))
            
            return (
              <ProviderCard
                key={provider.id}
                provider={provider}
                utilizationRate={metrics.utilizationRate}
                patientCount={metrics.patientCount}
                onAction={handleProviderAction}
                onViewSpecialties={handleViewSpecialties}
                canEditSpecialties={canEditSpecialties}
              />
            )
          })
        )}
      </div>

      {selectedProvider && (
        <ProviderSpecialtyModal
          provider={selectedProvider}
          isOpen={showSpecialtyModal}
          onClose={() => {
            setShowSpecialtyModal(false)
            setSelectedProvider(null)
          }}
          canEdit={isAdmin || (isProvider && (
            selectedProvider.user_id === currentUser?.id || 
            selectedProvider.id === currentUser?.provider_id ||
            selectedProvider.email === currentUser?.email
          ))}
          onSave={handleSaveSpecialties}
        />
      )}
    </div>
  )
}

export default ProvidersEnhanced
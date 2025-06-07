import React, { useState } from 'react'
import { X, Edit, Eye, Search, CheckCircle } from 'lucide-react'

// Complete list of specialties
export const MENTAL_HEALTH_SPECIALTIES = [
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

// Enhanced Provider type with specialties
export interface ProviderWithSpecialties {
  id: string
  user_id?: string
  first_name: string
  last_name: string
  title?: string
  email: string
  phone: string
  license_number: string
  license_state: string
  license_expiry: string
  specialties?: string[]
  languages: string[]
  experience_years: number
  bio?: string
  availability?: Record<string, { start: string; end: string }>
  max_patients_per_day?: number
  session_duration_minutes?: number
  telehealth_enabled?: boolean
  in_person_enabled?: boolean
  accepts_insurance?: boolean
  insurance_providers?: string[]
  status: string
  created_at: string
  updated_at: string
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

interface ProviderSpecialtyModalProps {
  provider: ProviderWithSpecialties
  isOpen: boolean
  onClose: () => void
  canEdit: boolean
  onSave?: (providerId: string, selectedSpecialties: string[]) => void
}

export const ProviderSpecialtyModal: React.FC<ProviderSpecialtyModalProps> = ({
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
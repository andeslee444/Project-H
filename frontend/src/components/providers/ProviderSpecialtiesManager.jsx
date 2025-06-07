import React, { useState, useEffect } from 'react';
import { CheckCircle, X, Plus, Search, Edit2, Save, XCircle } from 'lucide-react';
import { providerSpecialtyService } from '../../services/providerSpecialtyService';
import { useAuth } from '../../hooks/useAuth';

const ProviderSpecialtiesManager = ({ providerId, providerName, isOwnProfile = false }) => {
  const { user } = useAuth();
  const [specialties, setSpecialties] = useState([]);
  const [providerSpecialties, setProviderSpecialties] = useState([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [specialtyDetails, setSpecialtyDetails] = useState({});

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const canEdit = isAdmin || isOwnProfile;

  useEffect(() => {
    loadData();
  }, [providerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load all specialties grouped by category
      const [allSpecialtiesData, providerSpecialtiesData] = await Promise.all([
        providerSpecialtyService.getSpecialtiesByCategory(),
        providerSpecialtyService.getProviderSpecialties(providerId)
      ]);

      setSpecialties(allSpecialtiesData);
      setProviderSpecialties(providerSpecialtiesData);
      
      // Set selected specialties
      const selected = new Set(providerSpecialtiesData.map(ps => ps.specialty_id));
      setSelectedSpecialties(selected);
      
      // Set specialty details (years experience, certifications)
      const details = {};
      providerSpecialtiesData.forEach(ps => {
        details[ps.specialty_id] = {
          yearsExperience: ps.years_experience,
          certificationInfo: ps.certification_info
        };
      });
      setSpecialtyDetails(details);
    } catch (error) {
      console.error('Error loading specialties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSpecialty = (specialtyId) => {
    if (!editMode) return;
    
    const newSelected = new Set(selectedSpecialties);
    if (newSelected.has(specialtyId)) {
      newSelected.delete(specialtyId);
      // Remove details for unselected specialty
      const newDetails = { ...specialtyDetails };
      delete newDetails[specialtyId];
      setSpecialtyDetails(newDetails);
    } else {
      newSelected.add(specialtyId);
    }
    setSelectedSpecialties(newSelected);
  };

  const handleSaveSpecialties = async () => {
    try {
      setSaving(true);
      await providerSpecialtyService.updateProviderSpecialties(
        providerId,
        Array.from(selectedSpecialties)
      );
      
      // Update details for each specialty
      for (const specialtyId of selectedSpecialties) {
        if (specialtyDetails[specialtyId]) {
          const providerSpecialty = providerSpecialties.find(
            ps => ps.specialty_id === specialtyId
          );
          if (providerSpecialty) {
            await providerSpecialtyService.updateProviderSpecialty(
              providerSpecialty.id,
              specialtyDetails[specialtyId]
            );
          }
        }
      }
      
      await loadData();
      setEditMode(false);
    } catch (error) {
      console.error('Error saving specialties:', error);
      alert('Failed to save specialties. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original state
    const selected = new Set(providerSpecialties.map(ps => ps.specialty_id));
    setSelectedSpecialties(selected);
    setEditMode(false);
  };

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredSpecialties = Object.entries(specialties).reduce((acc, [category, items]) => {
    const filtered = items.filter(specialty =>
      specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isOwnProfile ? 'My Specialties' : `${providerName}'s Specialties`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {editMode 
                ? 'Select all specialties that apply'
                : `${providerSpecialties.length} specialties selected`
              }
            </p>
          </div>
          
          {canEdit && (
            <div className="flex gap-2">
              {editMode ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSpecialties}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Specialties
                </button>
              )}
            </div>
          )}
        </div>

        {editMode && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      <div className="p-6">
        {editMode ? (
          <div className="space-y-4">
            {Object.entries(filteredSpecialties).map(([category, items]) => (
              <div key={category} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-gray-900">{category}</span>
                  <span className="text-sm text-gray-500">
                    {items.filter(s => selectedSpecialties.has(s.id)).length} / {items.length} selected
                  </span>
                </button>
                
                {(expandedCategories.has(category) || searchTerm) && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map(specialty => (
                      <label
                        key={specialty.id}
                        className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSpecialties.has(specialty.id)}
                          onChange={() => handleToggleSpecialty(specialty.id)}
                          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="text-gray-900">{specialty.name}</span>
                          {specialty.description && (
                            <p className="text-sm text-gray-600 mt-1">{specialty.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {providerSpecialties.length > 0 ? (
              providerSpecialties.map(ps => (
                <div
                  key={ps.id}
                  className="flex items-center gap-2 p-3 bg-blue-50 text-blue-900 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <span className="font-medium">{ps.specialty.name}</span>
                    {ps.years_experience && (
                      <span className="text-sm text-blue-700 block">
                        {ps.years_experience} years experience
                      </span>
                    )}
                  </div>
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
  );
};

export default ProviderSpecialtiesManager;
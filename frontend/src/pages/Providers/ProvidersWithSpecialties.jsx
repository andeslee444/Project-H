import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, User, Mail, Phone, Calendar, Award, Edit, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ProviderSpecialtiesManager from '../../components/providers/ProviderSpecialtiesManager';
import { providerSpecialtyService } from '../../services/providerSpecialtyService';

const ProvidersWithSpecialties = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [allSpecialties, setAllSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isProvider = user?.role === 'provider';

  useEffect(() => {
    loadProviders();
    loadSpecialties();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockProviders = [
        {
          provider_id: '1',
          user_id: user?.id === '1' ? user.id : '1',
          first_name: 'Dr. Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@example.com',
          phone: '(555) 123-4567',
          title: 'Psychiatrist',
          license_number: 'PSY12345',
          years_experience: 15,
          provider_specialties: [
            { specialty: { name: 'Depression' } },
            { specialty: { name: 'Anxiety/Panic' } },
            { specialty: { name: 'PTSD/Trauma' } }
          ]
        },
        {
          provider_id: '2',
          user_id: '2',
          first_name: 'Dr. Michael',
          last_name: 'Chen',
          email: 'michael.chen@example.com',
          phone: '(555) 234-5678',
          title: 'Clinical Psychologist',
          license_number: 'PSY23456',
          years_experience: 10,
          provider_specialties: [
            { specialty: { name: 'Cognitive Behavioral Therapy' } },
            { specialty: { name: 'Couples Therapy' } },
            { specialty: { name: 'Addiction' } }
          ]
        },
        {
          provider_id: '3',
          user_id: '3',
          first_name: 'Dr. Emily',
          last_name: 'Rodriguez',
          email: 'emily.rodriguez@example.com',
          phone: '(555) 345-6789',
          title: 'Licensed Clinical Social Worker',
          license_number: 'LCSW34567',
          years_experience: 8,
          provider_specialties: [
            { specialty: { name: 'Child & Adolescent' } },
            { specialty: { name: 'Family Therapy' } },
            { specialty: { name: 'School Issues' } }
          ]
        }
      ];
      
      setProviders(mockProviders);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSpecialties = async () => {
    try {
      const specialties = await providerSpecialtyService.getAllSpecialties();
      setAllSpecialties(specialties);
    } catch (error) {
      console.error('Error loading specialties:', error);
    }
  };

  const handleViewSpecialties = (provider) => {
    setSelectedProvider(provider);
    setShowSpecialtyModal(true);
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      provider.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = !filterSpecialty || 
      provider.provider_specialties?.some(ps => 
        ps.specialty.name === filterSpecialty
      );
    
    return matchesSearch && matchesSpecialty;
  });

  const currentUserProvider = isProvider ? 
    providers.find(p => p.user_id === user?.id) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Providers</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? 'Manage all providers and their specialties' : 
               isProvider ? 'View providers and manage your specialties' : 
               'Browse our healthcare providers'}
            </p>
          </div>
          
          {isAdmin && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Provider
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Specialties</option>
              {allSpecialties.map(specialty => (
                <option key={specialty.id} value={specialty.name}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* My Profile Section (for providers) */}
      {isProvider && currentUserProvider && (
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-900">My Provider Profile</h2>
            <button
              onClick={() => handleViewSpecialties(currentUserProvider)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Manage My Specialties
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-700">Name</p>
              <p className="font-medium text-blue-900">
                {currentUserProvider.first_name} {currentUserProvider.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Title</p>
              <p className="font-medium text-blue-900">{currentUserProvider.title}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Specialties</p>
              <p className="font-medium text-blue-900">
                {currentUserProvider.provider_specialties?.length || 0} selected
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map(provider => (
          <div key={provider.provider_id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {provider.first_name} {provider.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">{provider.title}</p>
                  </div>
                </div>
                <Award className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{provider.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{provider.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{provider.years_experience} years experience</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Top Specialties:</p>
                <div className="flex flex-wrap gap-2">
                  {provider.provider_specialties?.slice(0, 3).map((ps, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {ps.specialty.name}
                    </span>
                  ))}
                  {provider.provider_specialties?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{provider.provider_specialties.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleViewSpecialties(provider)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                {isAdmin || (isProvider && provider.user_id === user?.id) ? (
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
            </div>
          </div>
        ))}
      </div>

      {/* Specialty Modal */}
      {showSpecialtyModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {selectedProvider.first_name} {selectedProvider.last_name}'s Specialties
              </h2>
              <button
                onClick={() => {
                  setShowSpecialtyModal(false);
                  setSelectedProvider(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <ProviderSpecialtiesManager
                providerId={selectedProvider.provider_id}
                providerName={`${selectedProvider.first_name} ${selectedProvider.last_name}`}
                isOwnProfile={isProvider && selectedProvider.user_id === user?.id}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProvidersWithSpecialties;
import { supabase } from '../lib/supabase';

class ProviderSpecialtyService {
  // Get all available specialties
  async getAllSpecialties() {
    const { data, error } = await supabase
      .from('specialties')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data;
  }

  // Get specialties by category
  async getSpecialtiesByCategory() {
    const { data, error } = await supabase
      .from('specialties')
      .select('*')
      .eq('is_active', true)
      .order('category, name');
    
    if (error) throw error;
    
    // Group by category
    const grouped = data.reduce((acc, specialty) => {
      const category = specialty.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(specialty);
      return acc;
    }, {});
    
    return grouped;
  }

  // Get provider's specialties
  async getProviderSpecialties(providerId) {
    const { data, error } = await supabase
      .from('provider_specialties')
      .select(`
        *,
        specialty:specialties(*)
      `)
      .eq('provider_id', providerId);
    
    if (error) throw error;
    return data;
  }

  // Add specialty to provider
  async addProviderSpecialty(providerId, specialtyId, additionalInfo = {}) {
    const { data, error } = await supabase
      .from('provider_specialties')
      .insert({
        provider_id: providerId,
        specialty_id: specialtyId,
        years_experience: additionalInfo.yearsExperience || null,
        certification_info: additionalInfo.certificationInfo || null
      })
      .select(`
        *,
        specialty:specialties(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Update provider specialty info
  async updateProviderSpecialty(providerSpecialtyId, updates) {
    const { data, error } = await supabase
      .from('provider_specialties')
      .update({
        years_experience: updates.yearsExperience,
        certification_info: updates.certificationInfo
      })
      .eq('id', providerSpecialtyId)
      .select(`
        *,
        specialty:specialties(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Remove specialty from provider
  async removeProviderSpecialty(providerId, specialtyId) {
    const { error } = await supabase
      .from('provider_specialties')
      .delete()
      .eq('provider_id', providerId)
      .eq('specialty_id', specialtyId);
    
    if (error) throw error;
    return { success: true };
  }

  // Bulk update provider specialties
  async updateProviderSpecialties(providerId, specialtyIds) {
    // Start a transaction-like operation
    // First, get current specialties
    const { data: currentSpecialties } = await this.getProviderSpecialties(providerId);
    const currentIds = currentSpecialties.map(ps => ps.specialty_id);
    
    // Determine which to add and which to remove
    const toAdd = specialtyIds.filter(id => !currentIds.includes(id));
    const toRemove = currentIds.filter(id => !specialtyIds.includes(id));
    
    // Remove specialties
    if (toRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('provider_specialties')
        .delete()
        .eq('provider_id', providerId)
        .in('specialty_id', toRemove);
      
      if (deleteError) throw deleteError;
    }
    
    // Add new specialties
    if (toAdd.length > 0) {
      const newSpecialties = toAdd.map(specialtyId => ({
        provider_id: providerId,
        specialty_id: specialtyId
      }));
      
      const { error: insertError } = await supabase
        .from('provider_specialties')
        .insert(newSpecialties);
      
      if (insertError) throw insertError;
    }
    
    // Return updated list
    return this.getProviderSpecialties(providerId);
  }

  // Search providers by specialty
  async searchProvidersBySpecialty(specialtyIds) {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        *,
        provider_specialties!inner(
          specialty_id,
          specialty:specialties(*)
        )
      `)
      .in('provider_specialties.specialty_id', specialtyIds);
    
    if (error) throw error;
    return data;
  }

  // Admin functions
  async createSpecialty(specialtyData) {
    const { data, error } = await supabase
      .from('specialties')
      .insert({
        name: specialtyData.name,
        description: specialtyData.description,
        category: specialtyData.category,
        is_active: true
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateSpecialty(specialtyId, updates) {
    const { data, error } = await supabase
      .from('specialties')
      .update(updates)
      .eq('id', specialtyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async toggleSpecialtyStatus(specialtyId, isActive) {
    const { data, error } = await supabase
      .from('specialties')
      .update({ is_active: isActive })
      .eq('id', specialtyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

export const providerSpecialtyService = new ProviderSpecialtyService();
export default providerSpecialtyService;
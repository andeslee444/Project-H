/**
 * Provider-Patient Matching Utilities
 * Provides sophisticated matching logic based on multiple criteria
 */

interface MatchingCriteria {
  diagnosis: string | string[];
  insurance: string;
  location: string;
  preferredModality?: string;
  preferredGender?: string;
}

interface Provider {
  specialties: string[];
  insurance_accepted: string[];
  location?: string;
  virtual_available?: boolean;
  in_person_available?: boolean;
}

interface MatchResult {
  matches: boolean;
  score: number;
  reasons: string[];
}

// Comprehensive diagnosis mapping to provider specialties
const DIAGNOSIS_SPECIALTY_MAP: Record<string, string[]> = {
  // Anxiety-related
  'anxiety disorders': ['anxiety', 'panic', 'stress management', 'phobias'],
  'anxiety': ['anxiety', 'panic', 'stress management'],
  'panic disorder': ['anxiety', 'panic disorder', 'panic'],
  'social anxiety': ['anxiety', 'social anxiety'],
  'generalized anxiety': ['anxiety', 'generalized anxiety disorder'],
  
  // Depression-related
  'depression': ['depression', 'mood disorders', 'major depressive disorder'],
  'major depression': ['depression', 'major depressive disorder'],
  'seasonal depression': ['depression', 'seasonal affective disorder'],
  
  // ADHD/Neurodevelopmental
  'adhd': ['adhd', 'add', 'attention deficit', 'child psychology', 'adolescent psychology'],
  'add': ['adhd', 'add', 'attention deficit'],
  'autism': ['autism', 'autism spectrum', 'developmental disabilities'],
  
  // Trauma-related
  'ptsd': ['ptsd', 'trauma', 'trauma therapy', 'emdr'],
  'trauma': ['trauma', 'ptsd', 'trauma therapy', 'emdr'],
  'ptsd/trauma': ['ptsd', 'trauma', 'trauma therapy', 'emdr'],
  
  // Relationship/Family
  'couples therapy': ['couples therapy', 'family therapy', 'relationships', 'marriage counseling'],
  'relationship issues': ['couples therapy', 'relationships', 'marriage counseling'],
  'family therapy': ['family therapy', 'family systems', 'parenting'],
  'marriage counseling': ['couples therapy', 'marriage counseling', 'relationships'],
  
  // Mood disorders
  'bipolar disorder': ['bipolar', 'mood disorders', 'medication management'],
  'bipolar': ['bipolar disorder', 'bipolar', 'mood disorders'],
  'mood disorders': ['mood disorders', 'bipolar', 'depression'],
  
  // OCD/Compulsive
  'ocd': ['ocd', 'obsessive compulsive', 'ex-rp therapy', 'exposure therapy'],
  'obsessive compulsive': ['ocd', 'obsessive compulsive disorder'],
  
  // Substance/Addiction
  'substance abuse': ['substance abuse', 'addiction', 'dual diagnosis', 'chemical dependency'],
  'addiction': ['addiction', 'substance abuse', 'addiction recovery'],
  'alcohol abuse': ['substance abuse', 'addiction', 'alcohol dependency'],
  
  // Eating disorders
  'eating disorders': ['eating disorders', 'body image', 'anorexia', 'bulimia'],
  'anorexia': ['eating disorders', 'anorexia nervosa'],
  'bulimia': ['eating disorders', 'bulimia nervosa'],
  
  // Sleep/Stress
  'sleep disorders': ['sleep disorders', 'insomnia', 'sleep hygiene'],
  'stress management': ['stress management', 'burnout', 'work-life balance'],
  
  // Specialized
  'grief counseling': ['grief', 'bereavement', 'loss', 'end of life'],
  'anger management': ['anger management', 'impulse control', 'behavioral issues'],
  'personality disorders': ['personality disorders', 'borderline', 'dialectical behavior therapy']
};

// Insurance provider matching with variations
const INSURANCE_VARIATIONS: Record<string, string[]> = {
  'blue cross blue shield': ['bcbs', 'blue cross', 'blue shield', 'empire bcbs', 'anthem'],
  'aetna': ['aetna', 'aet'],
  'united healthcare': ['united', 'uhc', 'united healthcare', 'oxford'],
  'cigna': ['cigna', 'cig'],
  'humana': ['humana', 'hum'],
  'kaiser': ['kaiser', 'kaiser permanente', 'kp'],
  'medicare': ['medicare', 'cms'],
  'medicaid': ['medicaid', 'state insurance']
};

export function calculateProviderPatientMatch(
  provider: Provider,
  patient: MatchingCriteria
): MatchResult {
  const reasons: string[] = [];
  let score = 0;
  
  // 1. Diagnosis/Specialty matching (40 points max)
  // Handle both string (legacy) and array formats
  const diagnoses = Array.isArray(patient.diagnosis) ? patient.diagnosis : [patient.diagnosis];
  
  let diagnosisMatch = false;
  let matchedDiagnosis = '';
  
  // Check each diagnosis
  for (const diagnosis of diagnoses) {
    const diagnosisLower = diagnosis.toLowerCase();
    const relatedSpecialties = DIAGNOSIS_SPECIALTY_MAP[diagnosisLower] || [diagnosisLower];
    
    for (const specialty of provider.specialties || []) {
      const specialtyLower = specialty.toLowerCase();
      
      // Check direct match or related specialties
      if (relatedSpecialties.some(related => 
        specialtyLower.includes(related) || related.includes(specialtyLower)
      )) {
        diagnosisMatch = true;
        matchedDiagnosis = diagnosis;
        score += 40;
        reasons.push(`Specializes in ${diagnosis}`);
        break;
      }
    }
    
    if (diagnosisMatch) break;
  }
  
  // 2. Insurance matching (30 points max)
  const patientInsuranceLower = patient.insurance.toLowerCase();
  let insuranceMatch = false;
  
  for (const accepted of provider.insurance_accepted || []) {
    const acceptedLower = accepted.toLowerCase();
    
    // Check for "most insurance accepted" or similar
    if (acceptedLower.includes('most') || acceptedLower.includes('major')) {
      insuranceMatch = true;
      score += 25; // Slightly lower score for generic acceptance
      reasons.push('Accepts most major insurance');
      break;
    }
    
    // Check direct match
    if (acceptedLower.includes(patientInsuranceLower) || 
        patientInsuranceLower.includes(acceptedLower)) {
      insuranceMatch = true;
      score += 30;
      reasons.push(`Accepts ${patient.insurance}`);
      break;
    }
    
    // Check variations
    for (const [standard, variations] of Object.entries(INSURANCE_VARIATIONS)) {
      if (variations.some(v => patientInsuranceLower.includes(v)) &&
          (acceptedLower.includes(standard) || variations.some(v => acceptedLower.includes(v)))) {
        insuranceMatch = true;
        score += 30;
        reasons.push(`Accepts ${patient.insurance}`);
        break;
      }
    }
    
    if (insuranceMatch) break;
  }
  
  // 3. Location matching (20 points max)
  if (provider.location && patient.location) {
    const providerLocationLower = provider.location.toLowerCase();
    const patientLocationLower = patient.location.toLowerCase();
    
    // Same borough/area
    if (providerLocationLower === patientLocationLower ||
        providerLocationLower.includes(patientLocationLower) ||
        patientLocationLower.includes(providerLocationLower)) {
      score += 20;
      reasons.push('Same location');
    } else if (providerLocationLower.includes('ny') && patientLocationLower.includes('ny')) {
      // Same city but different borough
      score += 10;
      reasons.push('Same city');
    }
  }
  
  // 4. Modality preference matching (10 points max)
  if (patient.preferredModality) {
    const modalityLower = patient.preferredModality.toLowerCase();
    
    if (modalityLower === 'virtual' && provider.virtual_available) {
      score += 10;
      reasons.push('Offers virtual sessions');
    } else if (modalityLower === 'in-person' && provider.in_person_available) {
      score += 10;
      reasons.push('Offers in-person sessions');
    } else if (modalityLower === 'either' && (provider.virtual_available || provider.in_person_available)) {
      score += 5;
      reasons.push('Flexible session options');
    }
  }
  
  // Determine if this is a match (need at least diagnosis AND insurance)
  const matches = diagnosisMatch && insuranceMatch;
  
  return {
    matches,
    score,
    reasons
  };
}

export function sortPatientsByMatchScore(
  patients: Array<MatchingCriteria & { handRaised?: boolean }>,
  provider: Provider
): Array<MatchingCriteria & { matchScore: number; matchReasons: string[] }> {
  return patients
    .map(patient => {
      const matchResult = calculateProviderPatientMatch(provider, patient);
      let finalScore = matchResult.score;
      
      // Bonus for hand-raised patients
      if (patient.handRaised) {
        finalScore += 20;
        matchResult.reasons.unshift('Patient requested provider');
      }
      
      return {
        ...patient,
        matchScore: finalScore,
        matchReasons: matchResult.reasons
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
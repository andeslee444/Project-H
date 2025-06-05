import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../ui/HealthcareIcons';
import { cn } from '../../utils/cn';

const PatientBookingFlow = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const services = [
    {
      id: 'therapy',
      title: 'Therapy Session',
      description: 'Individual counseling and support',
      duration: '50 minutes',
      price: '$150',
      icon: <Icons.Heart className="w-8 h-8" />,
      gradient: 'from-blue-500 to-blue-600',
      popular: true
    },
    {
      id: 'consultation',
      title: 'Initial Consultation',
      description: 'First-time assessment and planning',
      duration: '60 minutes',
      price: '$200',
      icon: <Icons.Stethoscope className="w-8 h-8" />,
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'medication',
      title: 'Medication Review',
      description: 'Review and adjust medications',
      duration: '30 minutes',
      price: '$100',
      icon: <Icons.Pills className="w-8 h-8" />,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'crisis',
      title: 'Crisis Support',
      description: 'Immediate mental health support',
      duration: '45 minutes',
      price: '$175',
      icon: <Icons.AlertTriangle className="w-8 h-8" />,
      gradient: 'from-red-500 to-red-600',
      urgent: true
    }
  ];

  const providers = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Clinical Psychologist',
      experience: '8 years',
      rating: 4.9,
      reviews: 127,
      avatar: null,
      nextAvailable: 'Today at 3:00 PM',
      languages: ['English', 'Spanish'],
      specialties: ['Anxiety', 'Depression', 'PTSD'],
      approach: 'Cognitive Behavioral Therapy',
      price: '$150',
      responseTime: '< 2 hours',
      verified: true,
      acceptsInsurance: true
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Psychiatrist',
      experience: '12 years',
      rating: 4.8,
      reviews: 89,
      avatar: null,
      nextAvailable: 'Tomorrow at 10:00 AM',
      languages: ['English', 'Mandarin'],
      specialties: ['Medication Management', 'Bipolar Disorder'],
      approach: 'Integrative Treatment',
      price: '$200',
      responseTime: '< 4 hours',
      verified: true,
      acceptsInsurance: true
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Licensed Therapist',
      experience: '6 years',
      rating: 4.9,
      reviews: 156,
      avatar: null,
      nextAvailable: 'Next week',
      languages: ['English', 'Spanish'],
      specialties: ['Trauma', 'Relationships', 'Family Therapy'],
      approach: 'EMDR & Somatic Therapy',
      price: '$140',
      responseTime: '< 1 hour',
      verified: true,
      acceptsInsurance: false
    }
  ];

  const timeSlots = [
    { time: '9:00 AM', available: true, popular: false },
    { time: '10:30 AM', available: true, popular: true },
    { time: '12:00 PM', available: false, popular: false },
    { time: '1:30 PM', available: true, popular: false },
    { time: '3:00 PM', available: true, popular: true },
    { time: '4:30 PM', available: true, popular: false },
    { time: '6:00 PM', available: true, popular: true }
  ];

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <motion.div
            initial={false}
            animate={{
              backgroundColor: step <= currentStep ? '#3B82F6' : '#E5E7EB',
              scale: step === currentStep ? 1.2 : 1
            }}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
            )}
          />
          {step < 4 && (
            <div className={cn(
              "w-8 h-0.5 mx-1 transition-colors",
              step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
            )} />
          )}
        </div>
      ))}
    </div>
  );

  const renderServiceSelection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What type of session?</h2>
        <p className="text-gray-600">Choose the service that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {services.map((service) => (
          <motion.button
            key={service.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedService(service)}
            className={cn(
              "relative p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg",
              selectedService?.id === service.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            {service.popular && (
              <div className="absolute -top-2 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                Most Popular
              </div>
            )}
            {service.urgent && (
              <div className="absolute -top-2 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                Urgent Care
              </div>
            )}
            
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={cn(
                  "p-3 rounded-xl bg-gradient-to-br text-white",
                  service.gradient
                )}>
                  {service.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Icons.Clock className="w-3 h-3" />
                      <span>{service.duration}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">{service.price}</div>
                <div className="text-xs text-gray-500">per session</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  const renderProviderSelection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your provider</h2>
        <p className="text-gray-600">All providers are licensed and verified</p>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => (
          <motion.button
            key={provider.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedProvider(provider)}
            className={cn(
              "w-full p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg",
              selectedProvider?.id === provider.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {provider.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg text-gray-900">{provider.name}</h3>
                      {provider.verified && (
                        <Icons.CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{provider.specialty}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{provider.price}</div>
                    <div className="text-xs text-gray-500">per session</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Icons.Heart
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < Math.floor(provider.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{provider.rating}</span>
                    <span className="text-sm text-gray-500">({provider.reviews} reviews)</span>
                  </div>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{provider.experience} experience</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {provider.specialties.slice(0, 3).map((specialty) => (
                      <span key={specialty} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">
                        {specialty}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-gray-500">
                      <span>Next available: {provider.nextAvailable}</span>
                      <span>•</span>
                      <span>Responds in {provider.responseTime}</span>
                    </div>
                    {provider.acceptsInsurance && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs">
                        Insurance Accepted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  const renderDateTimeSelection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pick your time</h2>
        <p className="text-gray-600">Available times with {selectedProvider?.name}</p>
      </div>

      {/* Calendar would go here - simplified for demo */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Today, December 4</h3>
        <div className="grid grid-cols-2 gap-3">
          {timeSlots.map((slot, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.95 }}
              disabled={!slot.available}
              onClick={() => setSelectedDateTime(slot)}
              className={cn(
                "p-4 rounded-xl text-center font-medium transition-all relative",
                !slot.available 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : selectedDateTime?.time === slot.time
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              )}
            >
              {slot.popular && slot.available && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
              )}
              {slot.time}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderConfirmation = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icons.CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Summary</h2>
        <p className="text-gray-600">Review your appointment details</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Service</span>
          <span className="font-medium">{selectedService?.title}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Provider</span>
          <span className="font-medium">{selectedProvider?.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Date & Time</span>
          <span className="font-medium">Today at {selectedDateTime?.time}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Duration</span>
          <span className="font-medium">{selectedService?.duration}</span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{selectedService?.price}</span>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4">
        <h4 className="font-medium text-blue-900 mb-2">Before your appointment</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• You&apos;ll receive a confirmation email with meeting details</li>
          <li>• Join the virtual session 5 minutes early</li>
          <li>• Have your insurance card ready</li>
        </ul>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={cn(
              "p-2 rounded-full transition-colors",
              currentStep === 1 
                ? "text-gray-400 cursor-not-allowed" 
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Icons.ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900">Book Appointment</h1>
            <p className="text-sm text-gray-500">Step {currentStep} of 4</p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Icons.XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderStepIndicator()}
          
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderServiceSelection()}
            {currentStep === 2 && renderProviderSelection()}
            {currentStep === 3 && renderDateTimeSelection()}
            {currentStep === 4 && renderConfirmation()}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {currentStep < 4 ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !selectedService) ||
                  (currentStep === 2 && !selectedProvider) ||
                  (currentStep === 3 && !selectedDateTime)
                }
                className={cn(
                  "flex-1 py-3 px-6 rounded-xl font-medium transition-all",
                  (currentStep === 1 && !selectedService) ||
                  (currentStep === 2 && !selectedProvider) ||
                  (currentStep === 3 && !selectedDateTime)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                Continue
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 px-6 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                Confirm Booking
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PatientBookingFlow;
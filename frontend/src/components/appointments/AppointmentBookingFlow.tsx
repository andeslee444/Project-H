import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, FileText, CreditCard, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/card/Card';
import { Select } from '@/components/ui/select/Select';
import { Input } from '@/components/ui/input/Input';
import { Textarea } from '@/components/ui/textarea/Textarea';
import { formatDate, formatTime } from '@/utils/formatters';

interface Provider {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  availableSlots: TimeSlot[];
}

interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface BookingData {
  providerId: string;
  appointmentType: string;
  date: Date | null;
  time: string;
  reason: string;
  insuranceProvider: string;
  insuranceId: string;
  symptoms: string[];
  medications: string;
  notes: string;
}

const APPOINTMENT_TYPES = [
  { value: 'initial', label: 'Initial Consultation (60 min)', duration: 60 },
  { value: 'followup', label: 'Follow-up Session (30 min)', duration: 30 },
  { value: 'therapy', label: 'Therapy Session (50 min)', duration: 50 },
  { value: 'assessment', label: 'Psychological Assessment (90 min)', duration: 90 },
  { value: 'urgent', label: 'Urgent Consultation (30 min)', duration: 30 }
];

const INSURANCE_PROVIDERS = [
  { value: 'aetna', label: 'Aetna' },
  { value: 'bcbs', label: 'Blue Cross Blue Shield' },
  { value: 'cigna', label: 'Cigna' },
  { value: 'united', label: 'UnitedHealthcare' },
  { value: 'medicare', label: 'Medicare' },
  { value: 'medicaid', label: 'Medicaid' },
  { value: 'self_pay', label: 'Self-Pay' }
];

const COMMON_SYMPTOMS = [
  'Anxiety', 'Depression', 'Stress', 'Sleep Issues', 'Mood Swings',
  'Panic Attacks', 'Relationship Issues', 'Grief', 'Trauma', 'Other'
];

export const AppointmentBookingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    providerId: '',
    appointmentType: '',
    date: null,
    time: '',
    reason: '',
    insuranceProvider: '',
    insuranceId: '',
    symptoms: [],
    medications: '',
    notes: ''
  });

  // Mock providers data
  const providers: Provider[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      title: 'Psychiatrist',
      specialties: ['Anxiety', 'Depression', 'PTSD'],
      availableSlots: generateMockSlots()
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      title: 'Clinical Psychologist',
      specialties: ['CBT', 'Trauma', 'Addiction'],
      availableSlots: generateMockSlots()
    }
  ];

  const steps = [
    { number: 1, title: 'Provider & Type', icon: User },
    { number: 2, title: 'Date & Time', icon: Calendar },
    { number: 3, title: 'Health Information', icon: FileText },
    { number: 4, title: 'Insurance', icon: CreditCard },
    { number: 5, title: 'Review & Confirm', icon: CheckCircle }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Submit booking data
    console.log('Submitting booking:', bookingData);
    // Show success message
    setCurrentStep(6);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return bookingData.providerId && bookingData.appointmentType;
      case 2:
        return bookingData.date && bookingData.time;
      case 3:
        return bookingData.reason && bookingData.symptoms.length > 0;
      case 4:
        return bookingData.insuranceProvider && bookingData.insuranceId;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: currentStep >= step.number ? 1 : 0.8 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep > step.number
                      ? 'bg-green-500 border-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </motion.div>
                <span className={`text-xs mt-2 text-center hidden sm:block ${
                  currentStep >= step.number ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 transition-colors ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Select Provider & Appointment Type</h2>
                <p className="text-gray-600">Choose your healthcare provider and the type of appointment you need</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Provider
                  </label>
                  <div className="space-y-3">
                    {providers.map((provider) => (
                      <label
                        key={provider.id}
                        className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                          bookingData.providerId === provider.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="provider"
                          value={provider.id}
                          checked={bookingData.providerId === provider.id}
                          onChange={(e) => setBookingData({ ...bookingData, providerId: e.target.value })}
                          className="sr-only"
                        />
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{provider.name}</h3>
                            <p className="text-sm text-gray-600">{provider.title}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {provider.specialties.map((specialty) => (
                                <span
                                  key={specialty}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type
                  </label>
                  <Select
                    value={bookingData.appointmentType}
                    onChange={(e) => setBookingData({ ...bookingData, appointmentType: e.target.value })}
                    placeholder="Select appointment type"
                    options={APPOINTMENT_TYPES}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Select Date & Time</h2>
                <p className="text-gray-600">Choose an available time slot for your appointment</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingData.date ? bookingData.date.toISOString().split('T')[0] : ''}
                      onChange={(e) => setBookingData({ ...bookingData, date: new Date(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {bookingData.date && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Time Slots
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
                          <button
                            key={time}
                            onClick={() => setBookingData({ ...bookingData, time })}
                            className={`p-2 text-sm border rounded-lg transition-colors ${
                              bookingData.time === time
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Health Information</h2>
                <p className="text-gray-600">Help us understand your needs better</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit
                  </label>
                  <Textarea
                    value={bookingData.reason}
                    onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                    placeholder="Please describe the main reason for your visit"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Symptoms (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {COMMON_SYMPTOMS.map((symptom) => (
                      <label
                        key={symptom}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={bookingData.symptoms.includes(symptom)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBookingData({
                                ...bookingData,
                                symptoms: [...bookingData.symptoms, symptom]
                              });
                            } else {
                              setBookingData({
                                ...bookingData,
                                symptoms: bookingData.symptoms.filter(s => s !== symptom)
                              });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{symptom}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Medications (Optional)
                  </label>
                  <Textarea
                    value={bookingData.medications}
                    onChange={(e) => setBookingData({ ...bookingData, medications: e.target.value })}
                    placeholder="List any medications you're currently taking"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Insurance Information</h2>
                <p className="text-gray-600">We'll verify your coverage before your appointment</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Provider
                  </label>
                  <Select
                    value={bookingData.insuranceProvider}
                    onChange={(e) => setBookingData({ ...bookingData, insuranceProvider: e.target.value })}
                    placeholder="Select insurance provider"
                    options={INSURANCE_PROVIDERS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member ID
                  </label>
                  <Input
                    value={bookingData.insuranceId}
                    onChange={(e) => setBookingData({ ...bookingData, insuranceId: e.target.value })}
                    placeholder="Enter your insurance member ID"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> We'll verify your insurance coverage and inform you of any co-pays or out-of-pocket costs before your appointment.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Review & Confirm</h2>
                <p className="text-gray-600">Please review your appointment details</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Provider & Type</h3>
                    <p className="text-sm text-gray-600">
                      {providers.find(p => p.id === bookingData.providerId)?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {APPOINTMENT_TYPES.find(t => t.value === bookingData.appointmentType)?.label}
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Date & Time</h3>
                    <p className="text-sm text-gray-600">
                      {bookingData.date && formatDate(bookingData.date)} at {bookingData.time}
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Reason for Visit</h3>
                    <p className="text-sm text-gray-600">{bookingData.reason}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Symptoms: {bookingData.symptoms.join(', ')}
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Insurance</h3>
                    <p className="text-sm text-gray-600">
                      {INSURANCE_PROVIDERS.find(i => i.value === bookingData.insuranceProvider)?.label}
                    </p>
                    <p className="text-sm text-gray-600">ID: {bookingData.insuranceId}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <Textarea
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                      placeholder="Any additional information you'd like to share"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 6 && (
            <Card>
              <CardContent className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </motion.div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Appointment Booked Successfully!
                </h2>
                <p className="text-gray-600 mb-6">
                  We've sent a confirmation email with your appointment details.
                </p>
                <div className="space-y-2">
                  <Button onClick={() => window.location.href = '/appointments'}>
                    View My Appointments
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep(1);
                      setBookingData({
                        providerId: '',
                        appointmentType: '',
                        date: null,
                        time: '',
                        reason: '',
                        insuranceProvider: '',
                        insuranceId: '',
                        symptoms: [],
                        medications: '',
                        notes: ''
                      });
                    }}
                  >
                    Book Another Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      {currentStep < 6 && (
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid()}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Confirm Booking
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to generate mock time slots
function generateMockSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();
  
  for (let d = 0; d < 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    
    const times = ['9:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    
    times.forEach((time) => {
      slots.push({
        id: `${date.toISOString()}-${time}`,
        date,
        startTime: time,
        endTime: time, // Would calculate end time based on appointment duration
        available: Math.random() > 0.3 // 70% availability
      });
    });
  }
  
  return slots;
}
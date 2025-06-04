import React, { useState } from 'react';
import { motion } from 'framer-motion';
import EnhancedDashboard from '../provider/EnhancedDashboard';
import AdvancedScheduler from '../provider/AdvancedScheduler';
import ConsumerDashboard from '../patient/ConsumerDashboard';
import BookingFlow from '../patient/BookingFlow';
import { Icons, HealthcareIcons } from '../ui/HealthcareIcons';
import { healthcareToast } from '../ui/Toast';
import { HealthcareSkeletons } from '../ui/LoadingSkeletons';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

const ComponentShowcase = () => {
  const [activeDemo, setActiveDemo] = useState('provider-dashboard');
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);

  const demoSections = [
    {
      id: 'provider-dashboard',
      title: '🏥 Provider Dashboard',
      description: 'Enhanced command center for healthcare providers',
      component: <EnhancedDashboard />
    },
    {
      id: 'provider-scheduler',
      title: '📅 Advanced Scheduler',
      description: 'Drag-and-drop appointment management',
      component: <AdvancedScheduler />
    },
    {
      id: 'patient-dashboard',
      title: '📱 Patient Dashboard',
      description: 'Consumer-grade mobile experience',
      component: <ConsumerDashboard />
    },
    {
      id: 'design-system',
      title: '🎨 Design System',
      description: 'Healthcare UI components and patterns',
      component: <DesignSystemDemo />
    }
  ];

  function DesignSystemDemo() {
    return (
      <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Healthcare Design System</h1>
          <p className="text-gray-600">Modern UI components for healthcare applications</p>
        </div>

        {/* Color Palette */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-full h-16 bg-blue-600 rounded-lg"></div>
              <div className="text-sm font-medium">Primary Blue</div>
              <div className="text-xs text-gray-500">#3B82F6</div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-green-600 rounded-lg"></div>
              <div className="text-sm font-medium">Secondary Green</div>
              <div className="text-xs text-gray-500">#22C55E</div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-purple-600 rounded-lg"></div>
              <div className="text-sm font-medium">Accent Purple</div>
              <div className="text-xs text-gray-500">#D946EF</div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-red-600 rounded-lg"></div>
              <div className="text-sm font-medium">Error Red</div>
              <div className="text-xs text-gray-500">#EF4444</div>
            </div>
          </div>
        </div>

        {/* Healthcare Icons */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Healthcare Icons</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
            {Object.entries(HealthcareIcons).slice(0, 16).map(([name, IconComponent]) => (
              <div key={name} className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-gray-600 text-center">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="success">Success Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" loading>Loading...</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </div>

        {/* Toast Notifications */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Healthcare Notifications</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="primary" 
              onClick={() => healthcareToast.success('Appointment confirmed successfully!')}
            >
              Success Toast
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => healthcareToast.info('New message from Dr. Johnson')}
            >
              Info Toast
            </Button>
            <Button 
              variant="outline" 
              onClick={() => healthcareToast.warning('Medication reminder: Take your evening dose')}
            >
              Warning Toast
            </Button>
            <Button 
              variant="danger" 
              onClick={() => healthcareToast.error('Unable to book appointment. Please try again.')}
            >
              Error Toast
            </Button>
            <Button 
              variant="primary" 
              onClick={() => healthcareToast.appointment('Appointment with Dr. Johnson tomorrow at 2:00 PM')}
            >
              Appointment
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => healthcareToast.medication('Time to take your medication')}
            >
              Medication
            </Button>
          </div>
        </div>

        {/* Loading Skeletons */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Loading States</h2>
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="primary" 
              onClick={() => setShowSkeletons(!showSkeletons)}
            >
              {showSkeletons ? 'Hide' : 'Show'} Loading Skeletons
            </Button>
          </div>
          
          {showSkeletons && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Patient Card Skeleton</h3>
                <HealthcareSkeletons.PatientCard />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Appointment Card Skeleton</h3>
                <HealthcareSkeletons.AppointmentCard />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Provider Card Skeleton</h3>
                <HealthcareSkeletons.ProviderCard />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Stats Card Skeleton</h3>
                <HealthcareSkeletons.StatsCard />
              </div>
            </div>
          )}
        </div>

        {/* Interactive Demo */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Interactive Components</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="primary" 
              onClick={() => setShowBookingFlow(true)}
              icon={<Icons.Calendar className="w-4 h-4" />}
            >
              Launch Booking Flow
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Component Showcase</h1>
              <p className="text-gray-600">Award-winning healthcare UI/UX components</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/docs/COMPONENT_SHOWCASE.md', '_blank')}
              >
                📚 Documentation
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => window.open('https://github.com/andeslee444/Project-H', '_blank')}
              >
                💻 GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {demoSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveDemo(section.id)}
                className={cn(
                  "py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors",
                  activeDemo === section.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                )}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeDemo}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {demoSections.find(section => section.id === activeDemo)?.component}
      </motion.div>

      {/* Booking Flow Modal */}
      {showBookingFlow && (
        <BookingFlow onClose={() => setShowBookingFlow(false)} />
      )}
    </div>
  );
};

export default ComponentShowcase;
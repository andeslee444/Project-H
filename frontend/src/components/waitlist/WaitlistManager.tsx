import React, { useState, useEffect } from 'react';
import { Clock, Users, Calendar, Filter, Search, AlertCircle, ChevronUp, ChevronDown, Phone, Mail, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card/Card';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Select } from '@/components/ui/select/Select';
import { Badge } from '@/components/ui/badge/Badge';
import { formatDate, formatRelativeTime } from '@/utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationService } from '@/lib/notifications/NotificationService';

interface WaitlistEntry {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  providerId: string;
  providerName: string;
  requestedService: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  flexibility: 'specific' | 'flexible' | 'very_flexible';
  preferredDays: string[];
  preferredTimes: string[];
  reason: string;
  createdAt: Date;
  lastContactedAt?: Date;
  position: number;
  estimatedWaitDays: number;
  status: 'waiting' | 'contacted' | 'scheduled' | 'cancelled';
  notes: string[];
}

const PRIORITY_COLORS = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  normal: 'bg-blue-100 text-blue-800 border-blue-200',
  low: 'bg-gray-100 text-gray-800 border-gray-200'
};

const PRIORITY_LABELS = {
  urgent: 'Urgent',
  high: 'High Priority',
  normal: 'Normal',
  low: 'Low Priority'
};

export const WaitlistManager: React.FC = () => {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState<'position' | 'priority' | 'created'>('position');
  const [showContactModal, setShowContactModal] = useState(false);

  const notificationService = NotificationService.getInstance();

  // Mock data
  useEffect(() => {
    const mockEntries: WaitlistEntry[] = [
      {
        id: '1',
        patientId: 'P001',
        patientName: 'Sarah Williams',
        patientPhone: '(555) 123-4567',
        patientEmail: 'sarah.williams@email.com',
        providerId: 'D001',
        providerName: 'Dr. Sarah Johnson',
        requestedService: 'Individual Therapy',
        priority: 'urgent',
        flexibility: 'flexible',
        preferredDays: ['Monday', 'Wednesday', 'Friday'],
        preferredTimes: ['Morning', 'Afternoon'],
        reason: 'Experiencing severe anxiety attacks',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastContactedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        position: 1,
        estimatedWaitDays: 3,
        status: 'contacted',
        notes: ['Called patient, awaiting response', 'Left voicemail']
      },
      {
        id: '2',
        patientId: 'P002',
        patientName: 'Michael Brown',
        patientPhone: '(555) 234-5678',
        patientEmail: 'michael.brown@email.com',
        providerId: 'D001',
        providerName: 'Dr. Sarah Johnson',
        requestedService: 'Psychiatric Evaluation',
        priority: 'high',
        flexibility: 'very_flexible',
        preferredDays: ['Any'],
        preferredTimes: ['Any'],
        reason: 'Medication adjustment needed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        position: 2,
        estimatedWaitDays: 7,
        status: 'waiting',
        notes: []
      },
      {
        id: '3',
        patientId: 'P003',
        patientName: 'Emily Davis',
        patientPhone: '(555) 345-6789',
        patientEmail: 'emily.davis@email.com',
        providerId: 'D002',
        providerName: 'Dr. Michael Chen',
        requestedService: 'Couples Therapy',
        priority: 'normal',
        flexibility: 'specific',
        preferredDays: ['Tuesday', 'Thursday'],
        preferredTimes: ['Evening'],
        reason: 'Relationship counseling',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        position: 3,
        estimatedWaitDays: 14,
        status: 'waiting',
        notes: ['Prefers evening appointments only']
      }
    ];

    setWaitlistEntries(mockEntries);
  }, []);

  // Filter and sort entries
  const filteredEntries = waitlistEntries
    .filter(entry => {
      const matchesSearch = entry.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.patientEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProvider = filterProvider === 'all' || entry.providerId === filterProvider;
      const matchesPriority = filterPriority === 'all' || entry.priority === filterPriority;
      return matchesSearch && matchesProvider && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'created':
          return a.createdAt.getTime() - b.createdAt.getTime();
        default:
          return a.position - b.position;
      }
    });

  const handleContactPatient = async (entry: WaitlistEntry, method: 'phone' | 'email' | 'sms') => {
    // Update last contacted time
    const updatedEntries = waitlistEntries.map(e => 
      e.id === entry.id 
        ? { ...e, lastContactedAt: new Date(), status: 'contacted' as const }
        : e
    );
    setWaitlistEntries(updatedEntries);

    // Log contact in notes
    const note = `Contacted via ${method} on ${formatDate(new Date())}`;
    // Add note to entry...

    // Send notification
    if (method === 'email' || method === 'sms') {
      await notificationService.sendNotification({
        userId: entry.patientId,
        type: 'waitlist_available',
        variables: {
          providerName: entry.providerName,
          availableDate: 'Next available',
          availableTime: 'Multiple options'
        },
        channels: [method]
      });
    }

    setShowContactModal(false);
  };

  const handleScheduleAppointment = (entry: WaitlistEntry) => {
    // Navigate to scheduling with pre-filled data
    window.location.href = `/schedule?patientId=${entry.patientId}&providerId=${entry.providerId}`;
  };

  const handleUpdatePosition = (entryId: string, direction: 'up' | 'down') => {
    const currentEntry = waitlistEntries.find(e => e.id === entryId);
    if (!currentEntry) return;

    const newPosition = direction === 'up' 
      ? Math.max(1, currentEntry.position - 1)
      : currentEntry.position + 1;

    const updatedEntries = waitlistEntries.map(entry => {
      if (entry.id === entryId) {
        return { ...entry, position: newPosition };
      }
      // Adjust other positions
      if (direction === 'up' && entry.position === newPosition) {
        return { ...entry, position: entry.position + 1 };
      }
      if (direction === 'down' && entry.position === newPosition) {
        return { ...entry, position: entry.position - 1 };
      }
      return entry;
    });

    setWaitlistEntries(updatedEntries);
  };

  // Calculate stats
  const stats = {
    total: waitlistEntries.length,
    urgent: waitlistEntries.filter(e => e.priority === 'urgent').length,
    avgWaitTime: Math.round(waitlistEntries.reduce((sum, e) => sum + e.estimatedWaitDays, 0) / waitlistEntries.length) || 0,
    contacted: waitlistEntries.filter(e => e.status === 'contacted').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Waitlist Management</h1>
        <p className="text-gray-600">Manage patient waitlist and prioritize appointments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Waiting</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent Cases</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Wait Time</p>
                <p className="text-2xl font-bold">{stats.avgWaitTime} days</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold">{stats.contacted}</p>
              </div>
              <Phone className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <Select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              options={[
                { value: 'all', label: 'All Providers' },
                { value: 'D001', label: 'Dr. Sarah Johnson' },
                { value: 'D002', label: 'Dr. Michael Chen' }
              ]}
            />
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'high', label: 'High' },
                { value: 'normal', label: 'Normal' },
                { value: 'low', label: 'Low' }
              ]}
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              options={[
                { value: 'position', label: 'Sort by Position' },
                { value: 'priority', label: 'Sort by Priority' },
                { value: 'created', label: 'Sort by Date Added' }
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Waitlist Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Waitlist Entries</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {filteredEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedEntry?.id === entry.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-gray-400">#{entry.position}</span>
                        <div className="flex flex-col gap-1 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdatePosition(entry.id, 'up');
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                            disabled={entry.position === 1}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdatePosition(entry.id, 'down');
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">{entry.patientName}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${PRIORITY_COLORS[entry.priority]}`}>
                            {PRIORITY_LABELS[entry.priority]}
                          </span>
                          {entry.status === 'contacted' && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Contacted
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{entry.reason}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span>Provider: {entry.providerName}</span>
                          <span>Service: {entry.requestedService}</span>
                          <span>Added: {formatRelativeTime(entry.createdAt)}</span>
                          <span>Est. Wait: {entry.estimatedWaitDays} days</span>
                        </div>
                        {entry.lastContactedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last contacted: {formatRelativeTime(entry.lastContactedAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntry(entry);
                          setShowContactModal(true);
                        }}
                        icon={<Phone className="w-4 h-4" />}
                      >
                        Contact
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScheduleAppointment(entry);
                        }}
                        icon={<Calendar className="w-4 h-4" />}
                      >
                        Schedule
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Contact Patient</h3>
              <p className="text-gray-600 mb-4">
                Choose how to contact {selectedEntry.patientName}:
              </p>
              <div className="space-y-3">
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => handleContactPatient(selectedEntry, 'phone')}
                  icon={<Phone className="w-4 h-4" />}
                >
                  Call {selectedEntry.patientPhone}
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => handleContactPatient(selectedEntry, 'email')}
                  icon={<Mail className="w-4 h-4" />}
                >
                  Email {selectedEntry.patientEmail}
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => handleContactPatient(selectedEntry, 'sms')}
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  Send SMS
                </Button>
              </div>
              <Button
                fullWidth
                variant="ghost"
                className="mt-4"
                onClick={() => setShowContactModal(false)}
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
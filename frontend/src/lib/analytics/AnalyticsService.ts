/**
 * Analytics Service for Mental Health Practice Management System
 * 
 * Tracks key metrics and provides insights for:
 * - Patient engagement and outcomes
 * - Provider utilization and efficiency
 * - Appointment patterns and no-shows
 * - Waitlist dynamics
 * - Revenue and billing metrics
 * - System performance
 */

import { supabase } from '@/lib/supabase';
import { AuditService } from '@/lib/security/hipaa/AuditService';

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface PatientMetrics {
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;
  averageSatisfactionScore: number;
  retentionRate: number;
  moodTrendImprovement: number;
}

export interface ProviderMetrics {
  totalProviders: number;
  averageUtilization: number;
  appointmentsPerDay: number;
  averageSessionDuration: number;
  patientSatisfaction: number;
  revenuePerProvider: number;
}

export interface AppointmentMetrics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowRate: number;
  averageWaitTime: number;
  bookingLeadTime: number;
  peakHours: { hour: number; count: number }[];
  popularServices: { service: string; count: number; percentage: number }[];
}

export interface WaitlistMetrics {
  totalOnWaitlist: number;
  averageWaitTime: number;
  conversionRate: number;
  abandonmentRate: number;
  waitlistByProvider: { providerId: string; name: string; count: number }[];
  waitlistTrends: { date: string; count: number }[];
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerPatient: number;
  collectionRate: number;
  outstandingBalance: number;
  revenueByService: { service: string; amount: number }[];
  revenueGrowth: number;
}

export interface SystemMetrics {
  activeUsers: number;
  pageViews: number;
  averageSessionDuration: number;
  errorRate: number;
  apiResponseTime: number;
  uptime: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private auditService = AuditService.getInstance();
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Start event flush interval
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 30000); // Flush every 30 seconds
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Track a custom analytics event
   */
  trackEvent(event: AnalyticsEvent): void {
    // Add timestamp
    const eventWithTimestamp = {
      ...event,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      userId: this.getCurrentUserId()
    };

    this.eventQueue.push(eventWithTimestamp);

    // Flush if queue is getting large
    if (this.eventQueue.length >= 50) {
      this.flushEvents();
    }
  }

  /**
   * Track page view
   */
  trackPageView(page: string, title?: string): void {
    this.trackEvent({
      category: 'Navigation',
      action: 'Page View',
      label: page,
      metadata: { title }
    });
  }

  /**
   * Track user action
   */
  trackUserAction(action: string, details?: Record<string, any>): void {
    this.trackEvent({
      category: 'User Action',
      action,
      metadata: details
    });
  }

  /**
   * Track appointment event
   */
  trackAppointmentEvent(
    action: 'scheduled' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled',
    appointmentId: string,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent({
      category: 'Appointment',
      action,
      label: appointmentId,
      metadata
    });
  }

  /**
   * Track waitlist event
   */
  trackWaitlistEvent(
    action: 'joined' | 'left' | 'converted' | 'position_changed',
    waitlistId: string,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent({
      category: 'Waitlist',
      action,
      label: waitlistId,
      metadata
    });
  }

  /**
   * Get patient metrics
   */
  async getPatientMetrics(
    dateRange?: { start: Date; end: Date }
  ): Promise<PatientMetrics> {
    try {
      // Total patients
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Active patients (had appointment in last 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: activePatientData } = await supabase
        .from('appointments')
        .select('patient_id')
        .gte('appointment_date', ninetyDaysAgo.toISOString())
        .eq('status', 'completed');

      const activePatients = new Set(activePatientData?.map(a => a.patient_id)).size;

      // New patients this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newPatientsThisMonth } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Mock data for demo - in production, these would be calculated from real data
      const averageSatisfactionScore = 4.5;
      const retentionRate = 0.85;
      const moodTrendImprovement = 0.32;

      // Log metrics access
      this.auditService.logDataAccess({
        userId: this.getCurrentUserId() || 'system',
        action: 'VIEW_PATIENT_METRICS',
        resourceType: 'analytics',
        resourceId: 'patient_metrics',
        details: { dateRange }
      });

      return {
        totalPatients: totalPatients || 0,
        activePatients,
        newPatientsThisMonth: newPatientsThisMonth || 0,
        averageSatisfactionScore,
        retentionRate,
        moodTrendImprovement
      };
    } catch (error) {
      console.error('Failed to get patient metrics:', error);
      throw error;
    }
  }

  /**
   * Get provider metrics
   */
  async getProviderMetrics(
    providerId?: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<ProviderMetrics> {
    try {
      let providerQuery = supabase.from('providers').select('*', { count: 'exact' });
      
      if (providerId) {
        providerQuery = providerQuery.eq('id', providerId);
      }

      const { count: totalProviders } = await providerQuery;

      // Calculate utilization and other metrics
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      let appointmentQuery = supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', thirtyDaysAgo.toISOString())
        .lte('appointment_date', today.toISOString());

      if (providerId) {
        appointmentQuery = appointmentQuery.eq('provider_id', providerId);
      }

      const { data: appointments } = await appointmentQuery;

      const completedAppointments = appointments?.filter(a => a.status === 'completed') || [];
      const workDays = 22; // Assuming 22 work days per month
      const appointmentsPerDay = completedAppointments.length / workDays;

      // Mock data for demo
      const averageUtilization = 0.75;
      const averageSessionDuration = 50; // minutes
      const patientSatisfaction = 4.6;
      const revenuePerProvider = 125000; // annual

      // Log metrics access
      this.auditService.logDataAccess({
        userId: this.getCurrentUserId() || 'system',
        action: 'VIEW_PROVIDER_METRICS',
        resourceType: 'analytics',
        resourceId: providerId || 'all_providers',
        details: { dateRange }
      });

      return {
        totalProviders: totalProviders || 1,
        averageUtilization,
        appointmentsPerDay,
        averageSessionDuration,
        patientSatisfaction,
        revenuePerProvider
      };
    } catch (error) {
      console.error('Failed to get provider metrics:', error);
      throw error;
    }
  }

  /**
   * Get appointment metrics
   */
  async getAppointmentMetrics(
    dateRange?: { start: Date; end: Date }
  ): Promise<AppointmentMetrics> {
    try {
      const start = dateRange?.start || new Date(new Date().setMonth(new Date().getMonth() - 1));
      const end = dateRange?.end || new Date();

      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', start.toISOString())
        .lte('appointment_date', end.toISOString());

      const totalAppointments = appointments?.length || 0;
      const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
      const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled').length || 0;
      const noShows = appointments?.filter(a => a.status === 'no_show').length || 0;

      const noShowRate = totalAppointments > 0 ? noShows / totalAppointments : 0;

      // Calculate peak hours
      const hourCounts: Record<number, number> = {};
      appointments?.forEach(apt => {
        const hour = new Date(apt.appointment_date).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const peakHours = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Mock data for demo
      const averageWaitTime = 3.5; // days
      const bookingLeadTime = 7.2; // days
      const popularServices = [
        { service: 'Individual Therapy', count: 450, percentage: 45 },
        { service: 'Psychiatric Evaluation', count: 250, percentage: 25 },
        { service: 'Group Therapy', count: 150, percentage: 15 },
        { service: 'Couples Therapy', count: 100, percentage: 10 },
        { service: 'Family Therapy', count: 50, percentage: 5 }
      ];

      return {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowRate,
        averageWaitTime,
        bookingLeadTime,
        peakHours,
        popularServices
      };
    } catch (error) {
      console.error('Failed to get appointment metrics:', error);
      throw error;
    }
  }

  /**
   * Get waitlist metrics
   */
  async getWaitlistMetrics(): Promise<WaitlistMetrics> {
    try {
      const { data: waitlistEntries } = await supabase
        .from('waitlist')
        .select('*, providers(id, user_id, users(email))')
        .eq('status', 'waiting');

      const totalOnWaitlist = waitlistEntries?.length || 0;

      // Calculate average wait time for converted entries
      const { data: convertedEntries } = await supabase
        .from('waitlist')
        .select('*')
        .eq('status', 'scheduled')
        .not('scheduled_date', 'is', null);

      let averageWaitTime = 0;
      if (convertedEntries && convertedEntries.length > 0) {
        const waitTimes = convertedEntries.map(entry => {
          const created = new Date(entry.created_at);
          const scheduled = new Date(entry.scheduled_date!);
          return (scheduled.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
        });
        averageWaitTime = waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length;
      }

      // Group by provider
      const waitlistByProvider: Record<string, { name: string; count: number }> = {};
      waitlistEntries?.forEach(entry => {
        const providerId = entry.provider_id;
        const providerName = entry.providers?.users?.email || 'Unknown';
        if (!waitlistByProvider[providerId]) {
          waitlistByProvider[providerId] = { name: providerName, count: 0 };
        }
        waitlistByProvider[providerId].count++;
      });

      // Mock data for trends
      const waitlistTrends = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 20) + 30
        };
      });

      return {
        totalOnWaitlist,
        averageWaitTime,
        conversionRate: 0.65, // Mock
        abandonmentRate: 0.15, // Mock
        waitlistByProvider: Object.entries(waitlistByProvider).map(([id, data]) => ({
          providerId: id,
          name: data.name,
          count: data.count
        })),
        waitlistTrends
      };
    } catch (error) {
      console.error('Failed to get waitlist metrics:', error);
      throw error;
    }
  }

  /**
   * Get revenue metrics
   */
  async getRevenueMetrics(
    dateRange?: { start: Date; end: Date }
  ): Promise<RevenueMetrics> {
    // In a real implementation, this would query billing/payment tables
    // For demo purposes, returning mock data
    
    const mockRevenueByService = [
      { service: 'Individual Therapy', amount: 45000 },
      { service: 'Psychiatric Evaluation', amount: 35000 },
      { service: 'Group Therapy', amount: 15000 },
      { service: 'Couples Therapy', amount: 20000 },
      { service: 'Family Therapy', amount: 10000 }
    ];

    return {
      totalRevenue: 125000,
      monthlyRecurringRevenue: 85000,
      averageRevenuePerPatient: 250,
      collectionRate: 0.92,
      outstandingBalance: 15000,
      revenueByService: mockRevenueByService,
      revenueGrowth: 0.15
    };
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    // In a real implementation, this would query system monitoring data
    // For demo purposes, returning mock data
    
    return {
      activeUsers: 156,
      pageViews: 12450,
      averageSessionDuration: 8.5, // minutes
      errorRate: 0.002, // 0.2%
      apiResponseTime: 145, // ms
      uptime: 0.9999 // 99.99%
    };
  }

  /**
   * Generate insights based on metrics
   */
  async generateInsights(): Promise<{
    category: string;
    insight: string;
    impact: 'positive' | 'negative' | 'neutral';
    recommendation?: string;
  }[]> {
    const insights = [];

    try {
      // Get various metrics
      const patientMetrics = await this.getPatientMetrics();
      const appointmentMetrics = await this.getAppointmentMetrics();
      const waitlistMetrics = await this.getWaitlistMetrics();

      // Patient growth insight
      if (patientMetrics.newPatientsThisMonth > 20) {
        insights.push({
          category: 'Growth',
          insight: `Strong patient acquisition with ${patientMetrics.newPatientsThisMonth} new patients this month`,
          impact: 'positive' as const,
          recommendation: 'Consider expanding provider capacity to maintain service quality'
        });
      }

      // No-show rate insight
      if (appointmentMetrics.noShowRate > 0.1) {
        insights.push({
          category: 'Operations',
          insight: `No-show rate is ${(appointmentMetrics.noShowRate * 100).toFixed(1)}%, above industry average`,
          impact: 'negative' as const,
          recommendation: 'Implement automated reminders 24 hours before appointments'
        });
      }

      // Waitlist insight
      if (waitlistMetrics.averageWaitTime > 7) {
        insights.push({
          category: 'Access',
          insight: `Average waitlist time is ${waitlistMetrics.averageWaitTime.toFixed(1)} days`,
          impact: 'negative' as const,
          recommendation: 'Consider adding providers or optimizing scheduling to reduce wait times'
        });
      }

      // Peak hours insight
      if (appointmentMetrics.peakHours.length > 0) {
        const peakHour = appointmentMetrics.peakHours[0];
        insights.push({
          category: 'Scheduling',
          insight: `Peak appointment time is ${peakHour.hour}:00 with ${peakHour.count} appointments`,
          impact: 'neutral' as const,
          recommendation: 'Distribute appointments more evenly throughout the day'
        });
      }

      return insights;
    } catch (error) {
      console.error('Failed to generate insights:', error);
      return [];
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    format: 'csv' | 'json' | 'pdf',
    dateRange?: { start: Date; end: Date }
  ): Promise<Blob> {
    try {
      // Gather all metrics
      const [
        patientMetrics,
        providerMetrics,
        appointmentMetrics,
        waitlistMetrics,
        revenueMetrics,
        systemMetrics
      ] = await Promise.all([
        this.getPatientMetrics(dateRange),
        this.getProviderMetrics(undefined, dateRange),
        this.getAppointmentMetrics(dateRange),
        this.getWaitlistMetrics(),
        this.getRevenueMetrics(dateRange),
        this.getSystemMetrics()
      ]);

      const data = {
        exportDate: new Date().toISOString(),
        dateRange,
        metrics: {
          patients: patientMetrics,
          providers: providerMetrics,
          appointments: appointmentMetrics,
          waitlist: waitlistMetrics,
          revenue: revenueMetrics,
          system: systemMetrics
        }
      };

      // Log export
      this.auditService.logDataAccess({
        userId: this.getCurrentUserId() || 'system',
        action: 'EXPORT_ANALYTICS',
        resourceType: 'analytics',
        resourceId: 'full_export',
        details: { format, dateRange }
      });

      switch (format) {
        case 'json':
          return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        
        case 'csv':
          // Convert to CSV format
          const csv = this.convertToCSV(data);
          return new Blob([csv], { type: 'text/csv' });
        
        case 'pdf':
          // In a real implementation, this would generate a PDF report
          throw new Error('PDF export not yet implemented');
        
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error('Failed to export analytics:', error);
      throw error;
    }
  }

  /**
   * Helper: Flush queued events
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // In a real implementation, this would send to analytics backend
      console.log('Flushing analytics events:', events);
      
      // Store in database for now
      const { error } = await supabase
        .from('analytics_events')
        .insert(events);

      if (error) {
        console.error('Failed to flush analytics events:', error);
        // Re-queue events on failure
        this.eventQueue.unshift(...events);
      }
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Helper: Get current session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Helper: Get current user ID
   */
  private getCurrentUserId(): string | null {
    const user = supabase.auth.getUser();
    return user ? String(user) : null;
  }

  /**
   * Helper: Convert data to CSV
   */
  private convertToCSV(data: any): string {
    // Simple CSV conversion - in production, use a proper CSV library
    const lines: string[] = [];
    
    // Patient metrics
    lines.push('Patient Metrics');
    lines.push('Metric,Value');
    Object.entries(data.metrics.patients).forEach(([key, value]) => {
      lines.push(`${key},${value}`);
    });
    lines.push('');

    // Provider metrics
    lines.push('Provider Metrics');
    lines.push('Metric,Value');
    Object.entries(data.metrics.providers).forEach(([key, value]) => {
      lines.push(`${key},${value}`);
    });
    lines.push('');

    // Add other sections similarly...

    return lines.join('\n');
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushEvents();
  }
}
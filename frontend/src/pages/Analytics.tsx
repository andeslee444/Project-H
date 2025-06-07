import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Activity,
  Download,
  Filter,
  RefreshCw,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import {
  AnalyticsService,
  PatientMetrics,
  ProviderMetrics,
  AppointmentMetrics,
  WaitlistMetrics,
  RevenueMetrics
} from '@/lib/analytics/AnalyticsService';
import { Card, CardHeader, CardContent } from '@/components/ui/card/Card';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/select/Select';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color
}) => {
  const isPositive = change && change > 0;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-2">
                {isPositive ? (
                  <ChevronUp className="w-4 h-4 text-green-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(change)}%
                </span>
                {changeLabel && (
                  <span className="text-sm text-gray-500 ml-1">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [patientMetrics, setPatientMetrics] = useState<PatientMetrics | null>(null);
  const [providerMetrics, setProviderMetrics] = useState<ProviderMetrics | null>(null);
  const [appointmentMetrics, setAppointmentMetrics] = useState<AppointmentMetrics | null>(null);
  const [waitlistMetrics, setWaitlistMetrics] = useState<WaitlistMetrics | null>(null);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  
  const { user } = useAuth();
  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    fetchAllMetrics();
  }, [timeRange]);

  const fetchAllMetrics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const end = new Date();
      const start = new Date();
      switch (timeRange) {
        case '7d':
          start.setDate(end.getDate() - 7);
          break;
        case '30d':
          start.setDate(end.getDate() - 30);
          break;
        case '90d':
          start.setDate(end.getDate() - 90);
          break;
        case '1y':
          start.setFullYear(end.getFullYear() - 1);
          break;
      }

      const dateRange = { start, end };

      // Fetch all metrics in parallel
      const [
        patientData,
        providerData,
        appointmentData,
        waitlistData,
        revenueData,
        insightsData
      ] = await Promise.all([
        analyticsService.getPatientMetrics(dateRange),
        analyticsService.getProviderMetrics(undefined, dateRange),
        analyticsService.getAppointmentMetrics(dateRange),
        analyticsService.getWaitlistMetrics(),
        analyticsService.getRevenueMetrics(dateRange),
        analyticsService.generateInsights()
      ]);

      setPatientMetrics(patientData);
      setProviderMetrics(providerData);
      setAppointmentMetrics(appointmentData);
      setWaitlistMetrics(waitlistData);
      setRevenueMetrics(revenueData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllMetrics();
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const blob = await analyticsService.exportAnalytics(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Track performance and gain insights into your practice
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              options={[
                { value: '7d', label: 'Last 7 days' },
                { value: '30d', label: 'Last 30 days' },
                { value: '90d', label: 'Last 90 days' },
                { value: '1y', label: 'Last year' }
              ]}
            />
            <Button
              variant="outline"
              onClick={handleRefresh}
              loading={refreshing}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                icon={<Download className="w-4 h-4" />}
                onClick={() => {}}
              >
                Export
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden">
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Export as JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Patients"
          value={patientMetrics?.totalPatients || 0}
          change={12}
          changeLabel="vs last period"
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <MetricCard
          title="Monthly Revenue"
          value={formatCurrency(revenueMetrics?.monthlyRecurringRevenue || 0)}
          change={15}
          changeLabel="growth"
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <MetricCard
          title="Appointments"
          value={appointmentMetrics?.totalAppointments || 0}
          change={-5}
          changeLabel="this period"
          icon={<Calendar className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
        <MetricCard
          title="Avg Wait Time"
          value={`${waitlistMetrics?.averageWaitTime.toFixed(1) || 0} days`}
          change={-10}
          changeLabel="improvement"
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-amber-500"
        />
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h2>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-l-4 ${
                  insight.impact === 'positive' ? 'border-green-500' :
                  insight.impact === 'negative' ? 'border-red-500' :
                  'border-blue-500'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {insight.category}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {insight.insight}
                        </p>
                        {insight.recommendation && (
                          <p className="text-sm text-gray-600 mt-2">
                            💡 {insight.recommendation}
                          </p>
                        )}
                      </div>
                      <div className={`p-2 rounded-full ${
                        insight.impact === 'positive' ? 'bg-green-100' :
                        insight.impact === 'negative' ? 'bg-red-100' :
                        'bg-blue-100'
                      }`}>
                        <TrendingUp className={`w-4 h-4 ${
                          insight.impact === 'positive' ? 'text-green-600' :
                          insight.impact === 'negative' ? 'text-red-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Metrics */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Patient Metrics</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Patients</span>
                <span className="font-medium">{patientMetrics?.activePatients}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New This Month</span>
                <span className="font-medium">{patientMetrics?.newPatientsThisMonth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Retention Rate</span>
                <span className="font-medium">
                  {formatPercentage(patientMetrics?.retentionRate || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Satisfaction Score</span>
                <span className="font-medium">
                  {patientMetrics?.averageSatisfactionScore}/5.0
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mood Improvement</span>
                <span className="font-medium text-green-600">
                  +{formatPercentage(patientMetrics?.moodTrendImprovement || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Metrics */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Provider Metrics</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Providers</span>
                <span className="font-medium">{providerMetrics?.totalProviders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Utilization</span>
                <span className="font-medium">
                  {formatPercentage(providerMetrics?.averageUtilization || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Appointments/Day</span>
                <span className="font-medium">
                  {providerMetrics?.appointmentsPerDay.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Session Duration</span>
                <span className="font-medium">{providerMetrics?.averageSessionDuration} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Patient Satisfaction</span>
                <span className="font-medium">{providerMetrics?.patientSatisfaction}/5.0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Patterns */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Appointment Patterns</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-medium">
                  {formatPercentage(
                    appointmentMetrics ? 
                    appointmentMetrics.completedAppointments / appointmentMetrics.totalAppointments : 
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">No-Show Rate</span>
                <span className="font-medium text-red-600">
                  {formatPercentage(appointmentMetrics?.noShowRate || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Booking Lead Time</span>
                <span className="font-medium">
                  {appointmentMetrics?.bookingLeadTime.toFixed(1)} days
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Peak Hours</p>
                <div className="space-y-2">
                  {appointmentMetrics?.peakHours.slice(0, 3).map((peak, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{peak.hour}:00</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(peak.count / (appointmentMetrics.peakHours[0]?.count || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-700 w-8 text-right">{peak.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Popular Services</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointmentMetrics?.popularServices.map((service, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{service.service}</span>
                    <span className="text-sm text-gray-600">{service.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                      style={{ width: `${service.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
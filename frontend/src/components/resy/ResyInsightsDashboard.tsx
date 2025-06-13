import React, { useState } from 'react';
import { 
  TrendingUp, Users, Calendar, DollarSign, Clock,
  AlertCircle, CheckCircle, ChevronRight, BarChart3,
  Activity, Zap, Target, Eye, Download, Filter,
  ArrowUp, ArrowDown, Info, PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeSlot {
  hour: string;
  day: string;
  utilization: number;
  revenue: number;
}

interface Metric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  subtitle?: string;
}

interface PredictiveInsight {
  type: 'warning' | 'opportunity' | 'suggestion';
  title: string;
  description: string;
  action?: string;
  impact?: string;
}

const ResyInsightsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Real-time metrics
  const todayMetrics: Metric[] = [
    {
      label: 'Patients Seen',
      value: 23,
      change: 15,
      trend: 'up',
      subtitle: 'vs. yesterday'
    },
    {
      label: 'No-Shows',
      value: '4 (17%)',
      change: -3,
      trend: 'down',
      subtitle: 'rate improved'
    },
    {
      label: 'Revenue',
      value: '$4,200',
      change: 8,
      trend: 'up',
      subtitle: 'on track for goal'
    },
    {
      label: 'Utilization',
      value: '82%',
      change: 5,
      trend: 'up',
      subtitle: 'optimal range'
    }
  ];

  // Predictive insights
  const insights: PredictiveInsight[] = [
    {
      type: 'warning',
      title: 'Tuesday Afternoons Underutilized',
      description: 'Tuesdays 3-5pm are 40% underutilized compared to other days',
      action: 'Consider targeted outreach or scheduling adjustments',
      impact: 'Could add $800/week in revenue'
    },
    {
      type: 'opportunity',
      title: 'Thursday Evening Demand',
      description: '8 patients on waitlist specifically requesting Thursday evenings',
      action: 'Consider opening Thursday evening slots',
      impact: '~$1,200 additional revenue/month'
    },
    {
      type: 'warning',
      title: 'No-Show Risk Tomorrow',
      description: '3 patients have high no-show probability based on history',
      action: 'Send reminder messages this afternoon',
      impact: 'Prevent $600 in lost revenue'
    },
    {
      type: 'suggestion',
      title: 'Insurance Mix Optimization',
      description: 'Current insurance mix is 70% lower-reimbursement plans',
      action: 'Adjust marketing to attract higher-reimbursement insurances',
      impact: '15% revenue increase potential'
    }
  ];

  // Utilization heatmap data
  const generateHeatmapData = () => {
    const hours = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
    return days.map(day => 
      hours.map(hour => ({
        day,
        hour,
        utilization: Math.floor(Math.random() * 100),
        hasOpenings: Math.random() > 0.7
      }))
    ).flat();
  };

  const heatmapData = generateHeatmapData();

  // Revenue breakdown
  const revenueBreakdown = [
    { category: 'Individual Therapy', amount: 2800, percentage: 67 },
    { category: 'Group Sessions', amount: 800, percentage: 19 },
    { category: 'Assessments', amount: 600, percentage: 14 }
  ];

  // Patient flow data
  const patientFlowStages = [
    { stage: 'Inquiries', count: 45, conversion: 100 },
    { stage: 'Scheduled', count: 38, conversion: 84 },
    { stage: 'Attended', count: 32, conversion: 84 },
    { stage: 'Follow-up Booked', count: 28, conversion: 88 }
  ];

  const getMetricIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <ArrowUp className="w-4 h-4" />;
    if (trend === 'down') return <ArrowDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getMetricColor = (trend: 'up' | 'down' | 'stable', isPositive: boolean) => {
    if (trend === 'stable') return 'text-gray-600';
    if (trend === 'up') return isPositive ? 'text-green-600' : 'text-red-600';
    return isPositive ? 'text-red-600' : 'text-green-600';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'opportunity':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'suggestion':
        return <Zap className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Insights Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Real-time performance metrics and predictive analytics
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTimeRange('today')}
                  className={`px-3 py-1 rounded text-sm ${
                    timeRange === 'today' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-3 py-1 rounded text-sm ${
                    timeRange === 'week' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-3 py-1 rounded text-sm ${
                    timeRange === 'month' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  This Month
                </button>
              </div>

              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Real-time Metrics */}
        <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {todayMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedMetric(metric.label)}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">{metric.label}</p>
                <div className={`flex items-center gap-1 ${
                  getMetricColor(metric.trend, metric.change > 0)
                }`}>
                  {getMetricIcon(metric.trend)}
                  <span className="text-sm font-medium">
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              {metric.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Utilization Heatmap */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Utilization Heatmap</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              View Details
            </button>
          </div>
          
          <div className="grid grid-cols-11 gap-1 text-xs">
            <div></div>
            {['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'].map(hour => (
              <div key={hour} className="text-center text-gray-600">{hour}</div>
            ))}
            
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
              <React.Fragment key={day}>
                <div className="text-right pr-2 text-gray-600">{day}</div>
                {heatmapData
                  .filter(slot => slot.day === day)
                  .map((slot, index) => (
                    <motion.div
                      key={`${day}-${index}`}
                      whileHover={{ scale: 1.1 }}
                      className="h-8 rounded cursor-pointer relative group"
                      style={{
                        backgroundColor: slot.utilization > 80 ? '#dc2626' :
                                       slot.utilization > 60 ? '#f59e0b' :
                                       slot.utilization > 40 ? '#10b981' :
                                       '#e5e7eb'
                      }}
                    >
                      {slot.hasOpenings && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full opacity-75" />
                        </div>
                      )}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {slot.utilization}% booked
                      </div>
                    </motion.div>
                  ))}
              </React.Fragment>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <span className="text-gray-600">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span className="text-gray-600">Optimal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded" />
                <span className="text-gray-600">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded" />
                <span className="text-gray-600">Full</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span>Has openings</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Predictive Analytics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Predictive Analytics</h2>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    insight.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                    insight.type === 'opportunity' ? 'bg-green-50 border-green-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h3 className="font-medium">{insight.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      {insight.action && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Action:</span> {insight.action}
                        </p>
                      )}
                      {insight.impact && (
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Impact:</span> {insight.impact}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Revenue & Patient Flow */}
          <div className="space-y-6">
            {/* Revenue Optimization */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Revenue Breakdown</h2>
              <div className="space-y-3">
                {revenueBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm text-gray-600">${item.amount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-blue-500 h-2 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.percentage}% of total</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Suggested adjustment:</span>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Optimize Mix →
                  </button>
                </div>
              </div>
            </div>

            {/* Patient Flow Sankey */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Patient Flow Analysis</h2>
              <div className="space-y-3">
                {patientFlowStages.map((stage, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-700">
                          {stage.count}
                        </div>
                        <div>
                          <p className="font-medium">{stage.stage}</p>
                          {index > 0 && (
                            <p className="text-xs text-gray-500">
                              {stage.conversion}% conversion
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < patientFlowStages.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300" />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    16% drop-off at scheduling. Consider streamlining booking process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Based on Insights */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Recommended Actions</h3>
          <div className="grid grid-cols-3 gap-4">
            <button className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow text-left">
              <Target className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-medium">Open Thursday Evenings</h4>
              <p className="text-sm text-gray-600 mt-1">Capture $1,200/mo in unmet demand</p>
            </button>
            <button className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow text-left">
              <Users className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-medium">Send No-Show Reminders</h4>
              <p className="text-sm text-gray-600 mt-1">Prevent 3 likely cancellations tomorrow</p>
            </button>
            <button className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow text-left">
              <DollarSign className="w-8 h-8 text-purple-600 mb-2" />
              <h4 className="font-medium">Adjust Insurance Mix</h4>
              <p className="text-sm text-gray-600 mt-1">15% revenue increase potential</p>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ResyInsightsDashboard;
/**
 * HIPAA Compliance Dashboard Component
 * 
 * React component demonstrating the HIPAA Compliance Audit Framework
 * Provides a user interface for security monitoring and compliance management
 * 
 * @author Project-H Security Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  createAuditSuite, 
  HIPAAComplianceAuditSuite,
  type AuditSuiteConfig 
} from '@/lib/security/audit';

interface DashboardState {
  auditSuite: HIPAAComplianceAuditSuite | null;
  complianceStatus: any;
  monitoringDashboard: any;
  currentAlerts: any[];
  auditInProgress: boolean;
  lastAuditResult: any;
  loading: boolean;
  error: string | null;
}

export const HIPAAComplianceDashboard: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    auditSuite: null,
    complianceStatus: null,
    monitoringDashboard: null,
    currentAlerts: [],
    auditInProgress: false,
    lastAuditResult: null,
    loading: true,
    error: null
  });

  // Initialize audit suite on component mount
  useEffect(() => {
    const initializeAuditSuite = async () => {
      try {
        const config: AuditSuiteConfig = {
          organizationName: 'Mental Health Practice',
          facilityId: 'MHP-001',
          enableRealTimeMonitoring: true,
          enableAutomaticDocumentation: true,
          notificationEndpoints: [
            {
              type: 'email',
              endpoint: 'security@mentalhealthpractice.com',
              severity: 'medium',
              enabled: true
            }
          ]
        };

        const auditSuite = createAuditSuite(config);
        
        // Start continuous monitoring
        auditSuite.startContinuousMonitoring();
        
        // Get initial status
        const complianceStatus = await auditSuite.getComplianceStatus();
        const monitoringDashboard = auditSuite.getMonitoringDashboard();
        const currentAlerts = auditSuite.getCurrentSecurityAlerts();

        setState(prev => ({
          ...prev,
          auditSuite,
          complianceStatus,
          monitoringDashboard,
          currentAlerts,
          loading: false
        }));

        // Set up periodic updates
        const interval = setInterval(() => {
          updateDashboardData(auditSuite);
        }, 30000); // Update every 30 seconds

        return () => {
          clearInterval(interval);
          auditSuite.stopContinuousMonitoring();
        };

      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
      }
    };

    initializeAuditSuite();
  }, []);

  const updateDashboardData = async (auditSuite: HIPAAComplianceAuditSuite) => {
    try {
      const complianceStatus = await auditSuite.getComplianceStatus();
      const monitoringDashboard = auditSuite.getMonitoringDashboard();
      const currentAlerts = auditSuite.getCurrentSecurityAlerts();

      setState(prev => ({
        ...prev,
        complianceStatus,
        monitoringDashboard,
        currentAlerts
      }));
    } catch (error) {
      console.error('Error updating dashboard data:', error);
    }
  };

  const runComprehensiveAudit = async () => {
    if (!state.auditSuite) return;

    setState(prev => ({ ...prev, auditInProgress: true }));

    try {
      const auditResult = await state.auditSuite.executeFullComplianceAudit();
      setState(prev => ({
        ...prev,
        lastAuditResult: auditResult,
        auditInProgress: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        auditInProgress: false
      }));
    }
  };

  const generateExecutiveReport = async () => {
    if (!state.auditSuite) return;

    try {
      const report = await state.auditSuite.generateExecutiveReport();
      
      // In a real implementation, this would trigger a file download
      console.log('Executive Report Generated:', report);
      
      // Create downloadable blob
      const blob = new Blob([JSON.stringify(report, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `executive-report-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    // In a real implementation, this would call the monitoring system
    console.log(`Acknowledging alert: ${alertId}`);
    
    setState(prev => ({
      ...prev,
      currentAlerts: prev.currentAlerts.filter(alert => alert.alertId !== alertId)
    }));
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-lg">Initializing HIPAA Compliance Framework...</span>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-red-800 font-medium">Error</h3>
        <p className="text-red-600 mt-2">{state.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          HIPAA Compliance Dashboard
        </h1>
        <p className="text-gray-600">
          Comprehensive security monitoring and compliance management for Mental Health Practice
        </p>
      </div>

      {/* Compliance Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                state.complianceStatus?.overall >= 90 ? 'bg-green-100' : 
                state.complianceStatus?.overall >= 75 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={`text-sm font-bold ${
                  state.complianceStatus?.overall >= 90 ? 'text-green-800' : 
                  state.complianceStatus?.overall >= 75 ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {state.complianceStatus?.overall || 0}%
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Overall Compliance</h3>
              <p className="text-sm text-gray-500">{state.complianceStatus?.status}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-800">
                  {state.currentAlerts.length}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Active Alerts</h3>
              <p className="text-sm text-gray-500">Security notifications</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                state.monitoringDashboard?.overview.systemHealth === 'healthy' ? 'bg-green-100' : 
                state.monitoringDashboard?.overview.systemHealth === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className="text-sm font-bold text-green-800">✓</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">System Health</h3>
              <p className="text-sm text-gray-500 capitalize">
                {state.monitoringDashboard?.overview.systemHealth || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-800">
                  {state.monitoringDashboard?.realTimeMetrics.activeUsers || 0}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Active Users</h3>
              <p className="text-sm text-gray-500">Current sessions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Component Scores */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Compliance Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {state.complianceStatus?.components && Object.entries(state.complianceStatus.components).map(([component, score]: [string, any]) => (
            <div key={component} className="text-center">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                score >= 90 ? 'bg-green-100' : score >= 75 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={`text-lg font-bold ${
                  score >= 90 ? 'text-green-800' : score >= 75 ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {score}%
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 capitalize">
                {component.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Audit Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={runComprehensiveAudit}
            disabled={state.auditInProgress}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md font-medium"
          >
            {state.auditInProgress ? 'Running Audit...' : 'Run Comprehensive Audit'}
          </button>
          
          <button
            onClick={generateExecutiveReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Generate Executive Report
          </button>

          <button
            onClick={() => window.open('/hipaa-compliance-docs', '_blank')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
          >
            View Documentation
          </button>
        </div>
      </div>

      {/* Current Alerts */}
      {state.currentAlerts.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Current Security Alerts</h2>
          <div className="space-y-3">
            {state.currentAlerts.map((alert, index) => (
              <div key={index} className={`border-l-4 p-4 ${
                alert.severity === 'critical' ? 'border-red-400 bg-red-50' :
                alert.severity === 'high' ? 'border-orange-400 bg-orange-50' :
                alert.severity === 'medium' ? 'border-yellow-400 bg-yellow-50' :
                'border-blue-400 bg-blue-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{alert.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                    <button
                      onClick={() => acknowledgeAlert(alert.alertId)}
                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Audit Results */}
      {state.lastAuditResult && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Last Audit Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Overall Compliance</h3>
              <p className="text-2xl font-bold text-blue-600">
                {state.lastAuditResult.overallCompliance}%
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Security Score</h3>
              <p className="text-2xl font-bold text-green-600">
                {state.lastAuditResult.securityScan?.score || 0}/100
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Privacy Score</h3>
              <p className="text-2xl font-bold text-purple-600">
                {state.lastAuditResult.privacyAssessment?.overallScore || 0}/100
              </p>
            </div>
          </div>
          
          {state.lastAuditResult.recommendations?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Top Recommendations</h3>
              <ul className="space-y-2">
                {state.lastAuditResult.recommendations.slice(0, 5).map((recommendation: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Real-time Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Real-time Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {state.monitoringDashboard?.realTimeMetrics.eventsPerMinute || 0}
            </p>
            <p className="text-sm text-gray-500">Events/min</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {state.monitoringDashboard?.realTimeMetrics.responseTime || 0}ms
            </p>
            <p className="text-sm text-gray-500">Avg Response</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {state.monitoringDashboard?.realTimeMetrics.errorRate || 0}%
            </p>
            <p className="text-sm text-gray-500">Error Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {state.monitoringDashboard?.realTimeMetrics.systemLoad || 0}%
            </p>
            <p className="text-sm text-gray-500">System Load</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HIPAAComplianceDashboard;
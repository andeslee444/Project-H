/**
 * Accessibility Dashboard Component
 * 
 * Provides a comprehensive dashboard for monitoring accessibility
 * compliance in healthcare applications.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  useAccessibilityTest, 
  useAccessibilityCompliance, 
  useKeyboardNavigationTest,
  useScreenReaderTest
} from '../hooks/useAccessibilityTesting';
import { AccessibilityTestResult, AccessibilityReport } from '../AccessibilityTester';

interface AccessibilityDashboardProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function AccessibilityDashboard({ 
  className = '',
  autoRefresh = false,
  refreshInterval = 60000 
}: AccessibilityDashboardProps) {
  const { report, isRunning, runTest } = useAccessibilityTest();
  const { complianceHistory, getComplianceTrend } = useAccessibilityCompliance();
  const { navigationIssues, analyzeKeyboardNavigation } = useKeyboardNavigationTest();
  const { announcements, announce } = useScreenReaderTest();
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    // Run initial test
    runTest();

    if (autoRefresh) {
      const interval = setInterval(runTest, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [runTest, autoRefresh, refreshInterval]);

  const getComplianceColor = (level: string) => {
    switch (level) {
      case 'compliant': return 'text-green-600 bg-green-50';
      case 'partially-compliant': return 'text-yellow-600 bg-yellow-50';
      case 'non-compliant': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'serious': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'minor': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleRunTest = () => {
    announce('Starting accessibility test', 'polite');
    runTest();
  };

  const handleAnalyzeKeyboard = () => {
    announce('Analyzing keyboard navigation', 'polite');
    analyzeKeyboardNavigation();
  };

  return (
    <div className={`space-y-6 ${className}`} role="main" aria-label="Accessibility Dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accessibility Dashboard</h1>
          <p className="text-gray-600">Monitor WCAG compliance and accessibility metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleRunTest} 
            disabled={isRunning}
            aria-describedby="test-button-desc"
          >
            {isRunning ? 'Testing...' : 'Run Test'}
          </Button>
          <span id="test-button-desc" className="sr-only">
            Runs comprehensive accessibility test on current page
          </span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" role="region" aria-label="Accessibility metrics summary">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold px-2 py-1 rounded ${getComplianceColor(report?.complianceLevel || 'unknown')}`}>
              {report?.complianceLevel || 'Unknown'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-red-600">
                {report?.summary.violationCount || 0}
              </div>
              {(report?.summary.violationCount || 0) > 0 && (
                <Badge variant="destructive" className="text-xs">
                  Needs Attention
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {report?.summary.criticalIssues || 0}
            </div>
            <p className="text-xs text-gray-600">Immediate fixes required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                getComplianceTrend() === 'improving' ? 'bg-green-500' :
                getComplianceTrend() === 'degrading' ? 'bg-red-500' : 'bg-gray-500'
              }`} />
              <span className="text-sm font-medium capitalize">
                {getComplianceTrend()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList role="tablist" aria-label="Accessibility dashboard sections">
          <TabsTrigger value="overview" role="tab">Overview</TabsTrigger>
          <TabsTrigger value="violations" role="tab">Violations</TabsTrigger>
          <TabsTrigger value="keyboard" role="tab">Keyboard Nav</TabsTrigger>
          <TabsTrigger value="recommendations" role="tab">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4" role="tabpanel">
          {report && (
            <>
              {/* Compliance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Summary</CardTitle>
                  <CardDescription>
                    Last tested: {report.timestamp.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {report.summary.passCount}
                      </div>
                      <p className="text-sm text-gray-600">Passed</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {report.summary.violationCount}
                      </div>
                      <p className="text-sm text-gray-600">Violations</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {report.summary.incompleteCount}
                      </div>
                      <p className="text-sm text-gray-600">Incomplete</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {report.summary.inapplicableCount}
                      </div>
                      <p className="text-sm text-gray-600">Not Applicable</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Critical Issues Alert */}
              {report.summary.criticalIssues > 0 && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertTitle className="text-red-700">
                    Critical Accessibility Issues Detected
                  </AlertTitle>
                  <AlertDescription className="text-red-600">
                    {report.summary.criticalIssues} critical accessibility issues require immediate attention.
                    These issues may prevent users with disabilities from accessing essential healthcare functions.
                  </AlertDescription>
                </Alert>
              )}

              {/* Healthcare-Specific Issues */}
              {report.violations.some(v => v.tags.includes('healthcare')) && (
                <Alert className="border-orange-500 bg-orange-50">
                  <AlertTitle className="text-orange-700">
                    Healthcare-Specific Accessibility Issues
                  </AlertTitle>
                  <AlertDescription className="text-orange-600">
                    Healthcare-specific accessibility patterns need attention. These are critical for
                    patient data privacy and emergency access scenarios.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="violations" className="space-y-4" role="tabpanel">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Violations</CardTitle>
              <CardDescription>
                Detailed breakdown of accessibility issues found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report?.violations.length === 0 ? (
                  <div className="text-center py-8 text-green-600">
                    <p className="text-lg font-medium">No violations found!</p>
                    <p className="text-sm">Your page meets accessibility standards.</p>
                  </div>
                ) : (
                  report?.violations.map((violation, index) => (
                    <div 
                      key={violation.id} 
                      className="border rounded-lg p-4 space-y-2"
                      role="article"
                      aria-labelledby={`violation-title-${index}`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 id={`violation-title-${index}`} className="font-medium text-gray-900">
                          {violation.description}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${getSeverityColor(violation.impact)}`}
                            aria-label={`${violation.impact} severity`}
                          />
                          <Badge variant="outline" className="text-xs">
                            {violation.level}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {violation.impact}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        Rule: {violation.rule}
                      </p>
                      
                      {violation.element && (
                        <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                          Element: {typeof violation.element === 'string' 
                            ? violation.element 
                            : violation.element.tagName.toLowerCase()}
                        </div>
                      )}
                      
                      {violation.tags.includes('healthcare') && (
                        <Badge variant="destructive" className="text-xs">
                          Healthcare-Critical
                        </Badge>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>WCAG {violation.level}</span>
                        <a 
                          href={violation.helpUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Learn more
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keyboard" className="space-y-4" role="tabpanel">
          <Card>
            <CardHeader>
              <CardTitle>Keyboard Navigation Analysis</CardTitle>
              <CardDescription>
                Test keyboard accessibility and navigation patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={handleAnalyzeKeyboard} size="sm">
                  Analyze Keyboard Navigation
                </Button>
                
                {navigationIssues.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Navigation Issues Found:</h4>
                    {navigationIssues.map((issue, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded border-l-4 ${
                          issue.severity === 'error' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Badge variant={issue.severity === 'error' ? 'destructive' : 'secondary'}>
                            {issue.severity}
                          </Badge>
                          <span className="text-sm font-medium">{issue.issue}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1 font-mono">
                          {issue.element.tagName.toLowerCase()}
                          {issue.element.id && `#${issue.element.id}`}
                          {issue.element.className && `.${issue.element.className.split(' ')[0]}`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-green-600">
                    <p>No keyboard navigation issues detected!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4" role="tabpanel">
          <div className="grid gap-4">
            {report?.recommendations.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-green-600">
                    <p className="text-lg font-medium">No recommendations needed!</p>
                    <p className="text-sm">Your accessibility implementation is on track.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              report?.recommendations.map((rec) => (
                <Alert 
                  key={rec.id} 
                  className={
                    rec.priority === 'critical' ? 'border-red-500 bg-red-50' :
                    rec.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                    rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' : 
                    'border-blue-500 bg-blue-50'
                  }
                >
                  <AlertTitle className="flex items-center justify-between">
                    <span>{rec.title}</span>
                    <Badge variant={
                      rec.priority === 'critical' ? 'destructive' :
                      rec.priority === 'high' ? 'destructive' :
                      rec.priority === 'medium' ? 'secondary' : 'outline'
                    }>
                      {rec.priority}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription className="space-y-3">
                    <p>{rec.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Impact:</strong> {rec.impact}
                      </div>
                      <div>
                        <strong>Effort:</strong> {rec.estimatedEffort}
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <strong>Solution:</strong> {rec.solution}
                    </div>
                    
                    <div className="text-sm">
                      <strong>WCAG Reference:</strong> {rec.wcagReference}
                    </div>
                    
                    {rec.affectedElements.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-sm font-medium">Affected elements:</span>
                        {rec.affectedElements.slice(0, 5).map((element, index) => (
                          <Badge key={index} variant="outline" className="text-xs font-mono">
                            {element}
                          </Badge>
                        ))}
                        {rec.affectedElements.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{rec.affectedElements.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Screen Reader Announcements Log (for testing) */}
      {announcements.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Screen Reader Announcements</CardTitle>
            <CardDescription>
              Recent accessibility announcements (for testing purposes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {announcements.slice(-5).map((announcement) => (
                <div key={announcement.id} className="text-xs border-l-2 border-blue-500 pl-2">
                  <span className="font-medium">{announcement.priority}:</span> {announcement.message}
                  <div className="text-gray-500">{announcement.timestamp.toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
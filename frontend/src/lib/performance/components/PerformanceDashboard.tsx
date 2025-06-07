/**
 * Performance Dashboard Component
 * 
 * Provides a comprehensive dashboard for monitoring application
 * performance in healthcare environments.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  usePerformanceReporting, 
  useRealTimeMetrics, 
  usePerformanceOptimization 
} from '../hooks/usePerformanceMonitoring';
import { PerformanceMetric, PerformanceReport } from '../PerformanceMonitor';

interface PerformanceDashboardProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function PerformanceDashboard({ 
  className = '',
  autoRefresh = true,
  refreshInterval = 30000 
}: PerformanceDashboardProps) {
  const { report, isGenerating, generateReport } = usePerformanceReporting();
  const { metrics: realtimeMetrics, summary } = useRealTimeMetrics();
  const { optimizations } = usePerformanceOptimization();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d'>('1h');

  useEffect(() => {
    // Generate initial report
    generateReport();

    if (autoRefresh) {
      const interval = setInterval(() => {
        generateReport();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [generateReport, autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    const now = new Date();
    let start: Date;

    switch (selectedTimeframe) {
      case '1h':
        start = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    generateReport({ start, end: now });
  };

  const getStatusColor = (value: number, threshold?: { warning: number; critical: number }) => {
    if (!threshold) return 'bg-gray-500';
    if (value >= threshold.critical) return 'bg-red-500';
    if (value >= threshold.warning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (value: number, threshold?: { warning: number; critical: number }) => {
    if (!threshold) return 'Unknown';
    if (value >= threshold.critical) return 'Critical';
    if (value >= threshold.warning) return 'Warning';
    return 'Good';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
          <p className="text-gray-600">Monitor application performance and user experience</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as '1h' | '24h' | '7d')}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <Button onClick={handleRefresh} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-gray-600">Last 60 seconds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-red-600">{summary.criticalIssues}</div>
              {summary.criticalIssues > 0 && (
                <Badge variant="destructive" className="text-xs">Alert</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
              {summary.warnings > 0 && (
                <Badge variant="secondary" className="text-xs">Monitor</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(summary.average)}ms</div>
            <p className="text-xs text-gray-600">Average response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {report && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Page Load Performance</CardTitle>
                    <CardDescription>Average page load time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${getStatusColor(report.summary.averagePageLoad, { warning: 2000, critical: 4000 })}`}
                      />
                      <span className="text-2xl font-bold">
                        {Math.round(report.summary.averagePageLoad)}ms
                      </span>
                      <Badge variant="outline">
                        {getStatusText(report.summary.averagePageLoad, { warning: 2000, critical: 4000 })}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Target: &lt;2s (Good), &lt;4s (Acceptable)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Render Performance</CardTitle>
                    <CardDescription>Average render time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${getStatusColor(report.summary.averageRenderTime, { warning: 100, critical: 300 })}`}
                      />
                      <span className="text-2xl font-bold">
                        {Math.round(report.summary.averageRenderTime)}ms
                      </span>
                      <Badge variant="outline">
                        {getStatusText(report.summary.averageRenderTime, { warning: 100, critical: 300 })}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Target: &lt;100ms (Good), &lt;300ms (Acceptable)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Error Rate</CardTitle>
                    <CardDescription>Percentage of failed operations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${getStatusColor(report.summary.errorRate * 100, { warning: 1, critical: 5 })}`}
                      />
                      <span className="text-2xl font-bold">
                        {(report.summary.errorRate * 100).toFixed(2)}%
                      </span>
                      <Badge variant="outline">
                        {getStatusText(report.summary.errorRate * 100, { warning: 1, critical: 5 })}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Target: &lt;1% (Good), &lt;5% (Acceptable)
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>How performance is changing over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full ${
                          report.trends.pageLoadTrend === 'improving' ? 'bg-green-500' :
                          report.trends.pageLoadTrend === 'degrading' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">Page Load</p>
                        <p className="text-sm text-gray-600 capitalize">{report.trends.pageLoadTrend}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full ${
                          report.trends.memoryTrend === 'improving' ? 'bg-green-500' :
                          report.trends.memoryTrend === 'degrading' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">Memory Usage</p>
                        <p className="text-sm text-gray-600 capitalize">{report.trends.memoryTrend}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full ${
                          report.trends.errorTrend === 'improving' ? 'bg-green-500' :
                          report.trends.errorTrend === 'degrading' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">Error Rate</p>
                        <p className="text-sm text-gray-600 capitalize">{report.trends.errorTrend}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Detailed breakdown of all performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report?.metrics.slice(0, 50).map((metric, index) => (
                  <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{metric.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {metric.category}
                        </Badge>
                        {metric.threshold && (
                          <div 
                            className={`w-2 h-2 rounded-full ${getStatusColor(metric.value, metric.threshold)}`}
                          />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {metric.timestamp.toLocaleTimeString()}
                        {metric.metadata?.component && ` • ${metric.metadata.component}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {metric.value.toFixed(2)} {metric.unit}
                      </div>
                    </div>
                  </div>
                ))}
                
                {report && report.metrics.length > 50 && (
                  <p className="text-center text-gray-600">
                    Showing 50 of {report.metrics.length} metrics
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {report?.recommendations.map((rec) => (
              <Alert key={rec.id} className={
                rec.priority === 'critical' ? 'border-red-500' :
                rec.priority === 'high' ? 'border-orange-500' :
                rec.priority === 'medium' ? 'border-yellow-500' : 'border-blue-500'
              }>
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
                <AlertDescription className="space-y-2">
                  <p>{rec.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Impact:</strong> {rec.impact}
                    </div>
                    <div>
                      <strong>Expected Gain:</strong> {rec.estimatedGain}
                    </div>
                  </div>
                  <div className="text-sm">
                    <strong>Implementation:</strong> {rec.implementation}
                  </div>
                  {rec.affectedComponents && (
                    <div className="flex flex-wrap gap-1">
                      {rec.affectedComponents.map(component => (
                        <Badge key={component} variant="outline" className="text-xs">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ))}

            {optimizations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Optimization Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {optimizations.map((opt, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{opt.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={
                              opt.impact === 'high' ? 'destructive' :
                              opt.impact === 'medium' ? 'secondary' : 'outline'
                            } className="text-xs">
                              {opt.impact} impact
                            </Badge>
                            {opt.implemented && (
                              <Badge variant="outline" className="text-xs text-green-600">
                                Implemented
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends Analysis</CardTitle>
              <CardDescription>Long-term performance patterns and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* This would contain charts in a real implementation */}
                <div className="text-center py-8 text-gray-500">
                  <p>Performance trend charts would be displayed here.</p>
                  <p className="text-sm">This would include line charts showing performance over time,</p>
                  <p className="text-sm">histogram distributions, and correlation analysis.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
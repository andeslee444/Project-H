import React, { useState, useEffect, useCallback } from 'react';
import { OptimizationMonitor, runPerformanceMaintenance } from '../../lib/performance/OptimizationEngine';
import './PerformanceDashboard.css';

const PerformanceDashboard = ({ isVisible = false }) => {
  const [performanceData, setPerformanceData] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  const updatePerformanceData = useCallback(() => {
    const report = OptimizationMonitor.generateReport();
    setPerformanceData(report);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Initial load
    updatePerformanceData();

    // Set up refresh interval
    const interval = setInterval(updatePerformanceData, refreshInterval);

    return () => clearInterval(interval);
  }, [isVisible, refreshInterval, updatePerformanceData]);

  const handleClearData = useCallback(() => {
    // Clear performance data (would reset OptimizationMonitor in real implementation)
    setPerformanceData({});
  }, []);

  const handleRunMaintenance = useCallback(() => {
    runPerformanceMaintenance();
    updatePerformanceData();
  }, [updatePerformanceData]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatRenderTime = (time) => {
    return `${time.toFixed(2)}ms`;
  };

  if (!isVisible) return null;

  return (
    <div className={`performance-dashboard ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="dashboard-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="dashboard-title">
          🚀 Performance Monitor
          <span className="component-count">
            ({Object.keys(performanceData).length} components tracked)
          </span>
        </div>
        <div className="dashboard-controls">
          <button 
            className="control-button"
            onClick={(e) => {
              e.stopPropagation();
              handleRunMaintenance();
            }}
            title="Run maintenance"
          >
            🔧
          </button>
          <button 
            className="control-button"
            onClick={(e) => {
              e.stopPropagation();
              handleClearData();
            }}
            title="Clear data"
          >
            🗑️
          </button>
          <span className="expand-icon">{isExpanded ? '▼' : '▲'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="dashboard-content">
          <div className="dashboard-settings">
            <label>
              Refresh Rate:
              <select 
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
              >
                <option value={1000}>1s</option>
                <option value={2000}>2s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
              </select>
            </label>
          </div>

          <div className="performance-summary">
            <div className="summary-card">
              <div className="summary-value">
                {Object.values(performanceData).filter(c => c.needsOptimization).length}
              </div>
              <div className="summary-label">Components Need Optimization</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">
                {Object.values(performanceData).filter(c => c.severity === 'high').length}
              </div>
              <div className="summary-label">High Priority Issues</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">
                {Object.values(performanceData).reduce((sum, c) => sum + c.count, 0)}
              </div>
              <div className="summary-label">Total Renders Tracked</div>
            </div>
          </div>

          <div className="performance-table">
            <div className="table-header">
              <div className="table-cell">Component</div>
              <div className="table-cell">Avg Render Time</div>
              <div className="table-cell">Min/Max</div>
              <div className="table-cell">Render Count</div>
              <div className="table-cell">Severity</div>
            </div>

            {Object.keys(performanceData).length === 0 ? (
              <div className="no-data">
                No performance data available. Use the application to generate metrics.
              </div>
            ) : (
              Object.entries(performanceData)
                .sort(([,a], [,b]) => b.average - a.average)
                .map(([componentName, stats]) => (
                  <div key={componentName} className="table-row">
                    <div className="table-cell component-name">
                      {componentName}
                      {stats.needsOptimization && <span className="warning-icon">⚠️</span>}
                    </div>
                    <div className="table-cell render-time">
                      {formatRenderTime(stats.average)}
                    </div>
                    <div className="table-cell min-max">
                      {formatRenderTime(stats.min)} / {formatRenderTime(stats.max)}
                    </div>
                    <div className="table-cell render-count">
                      {stats.count}
                    </div>
                    <div className="table-cell severity">
                      <span 
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(stats.severity) }}
                      >
                        {stats.severity}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>

          <div className="optimization-tips">
            <h4>💡 Optimization Tips</h4>
            <ul>
              <li>Components with render times &gt; 16ms may cause frame drops</li>
              <li>Use React.memo() for components that re-render frequently</li>
              <li>Consider virtualization for lists with many items</li>
              <li>Implement useCallback() for event handlers</li>
              <li>Use useMemo() for expensive calculations</li>
            </ul>
          </div>

          <div className="performance-metrics">
            <h4>📊 Real-time Metrics</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Memory Usage:</span>
                <span className="metric-value">
                  {typeof window !== 'undefined' && window.performance?.memory 
                    ? `${Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024)}MB`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Navigation Type:</span>
                <span className="metric-value">
                  {typeof window !== 'undefined' && window.performance?.navigation
                    ? window.performance.navigation.type === 0 ? 'Navigate' : 'Reload'
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Connection:</span>
                <span className="metric-value">
                  {typeof navigator !== 'undefined' && navigator.connection
                    ? navigator.connection.effectiveType || 'Unknown'
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
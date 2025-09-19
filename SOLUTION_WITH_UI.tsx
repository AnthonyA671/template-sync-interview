/**
 * COMPLETE SOLUTION WITH VISUAL INTERFACE
 *
 * This file shows what the final working solution should look like visually.
 * It demonstrates the synchronization problems and their solutions in real-time.
 *
 * FOR INTERVIEWERS ONLY - Shows expected end result
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './solution-styles.css';

// Import the solution service (from SOLUTION.ts)
import { TemplateService, TemplateFieldProcessor } from './SOLUTION';
import { MockDatabase, createMockSupabase, createTestTemplate } from './src/test-utils';
import { initializeSupabase } from './src/problem';

interface UpdateLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: 'success' | 'conflict' | 'error' | 'pending';
  version?: string;
  details?: string;
}

interface CacheState {
  hasData: boolean;
  version?: string;
  lastUpdated?: string;
  isStale?: boolean;
}

/**
 * Visual Template Synchronization Demo
 *
 * This component visually demonstrates:
 * 1. Concurrent update conflicts
 * 2. Cache invalidation
 * 3. Version control
 * 4. Background job coordination
 * 5. Retry mechanisms
 */
export const TemplateSyncDemo: React.FC = () => {
  const [template, setTemplate] = useState<any>(null);
  const [updateLogs, setUpdateLogs] = useState<UpdateLog[]>([]);
  const [cacheStates, setCacheStates] = useState<Record<string, CacheState>>({});
  const [isBackgroundJobRunning, setIsBackgroundJobRunning] = useState(false);
  const [concurrentUpdates, setConcurrentUpdates] = useState(0);
  const [conflicts, setConflicts] = useState(0);
  const [successfulUpdates, setSuccessfulUpdates] = useState(0);

  const dbRef = useRef<MockDatabase>();
  const serviceRef = useRef<TemplateService>();
  const processorRef = useRef<TemplateFieldProcessor>();

  // Initialize services
  useEffect(() => {
    dbRef.current = new MockDatabase();
    initializeSupabase(createMockSupabase(dbRef.current));
    serviceRef.current = new TemplateService();
    processorRef.current = new TemplateFieldProcessor(serviceRef.current);

    // Set up initial template
    const initialTemplate = createTestTemplate();
    dbRef.current.set(initialTemplate.id, initialTemplate);
    setTemplate(initialTemplate);
  }, []);

  // Add log entry
  const addLog = useCallback((log: Omit<UpdateLog, 'id' | 'timestamp'>) => {
    setUpdateLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...log
    }, ...prev].slice(0, 20)); // Keep last 20 logs
  }, []);

  // Update cache visualization
  const updateCacheState = useCallback((userId: string, state: Partial<CacheState>) => {
    setCacheStates(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        ...state
      }
    }));
  }, []);

  // Simulate User A update
  const handleUserAUpdate = async () => {
    const userId = 'User A';
    setConcurrentUpdates(prev => prev + 1);

    addLog({
      user: userId,
      action: 'Starting template name update',
      status: 'pending'
    });

    try {
      const result = await serviceRef.current!.updateTemplate(
        'test-template-123',
        { name: `Updated by ${userId} at ${new Date().toLocaleTimeString()}` }
      );

      if (result.success) {
        setSuccessfulUpdates(prev => prev + 1);
        addLog({
          user: userId,
          action: 'Successfully updated template name',
          status: 'success',
          version: result.newVersion
        });

        // Update cache state
        updateCacheState(userId, {
          hasData: true,
          version: result.newVersion,
          lastUpdated: new Date().toISOString(),
          isStale: false
        });

        // Refresh template display
        const updated = await serviceRef.current!.getTemplate('test-template-123');
        setTemplate(updated);
      } else {
        throw result.error;
      }
    } catch (error: any) {
      if (error.name === 'VersionConflictError') {
        setConflicts(prev => prev + 1);
        addLog({
          user: userId,
          action: 'Version conflict detected - retrying with exponential backoff',
          status: 'conflict',
          details: error.message
        });
      } else {
        addLog({
          user: userId,
          action: 'Update failed',
          status: 'error',
          details: error.message
        });
      }
    } finally {
      setConcurrentUpdates(prev => Math.max(0, prev - 1));
    }
  };

  // Simulate User B update
  const handleUserBUpdate = async () => {
    const userId = 'User B';
    setConcurrentUpdates(prev => prev + 1);

    addLog({
      user: userId,
      action: 'Starting field definitions update',
      status: 'pending'
    });

    try {
      const newField = {
        id: `field-${Date.now()}`,
        type: 'select' as const,
        label: 'Status',
        required: true,
        options: ['Active', 'Inactive', 'Pending']
      };

      const result = await serviceRef.current!.updateTemplate(
        'test-template-123',
        {
          field_definitions: {
            ...template?.field_definitions,
            [newField.id]: newField
          }
        }
      );

      if (result.success) {
        setSuccessfulUpdates(prev => prev + 1);
        addLog({
          user: userId,
          action: 'Successfully added new field definition',
          status: 'success',
          version: result.newVersion
        });

        updateCacheState(userId, {
          hasData: true,
          version: result.newVersion,
          lastUpdated: new Date().toISOString(),
          isStale: false
        });

        const updated = await serviceRef.current!.getTemplate('test-template-123');
        setTemplate(updated);
      } else {
        throw result.error;
      }
    } catch (error: any) {
      if (error.name === 'VersionConflictError') {
        setConflicts(prev => prev + 1);
        addLog({
          user: userId,
          action: 'Version conflict - will retry',
          status: 'conflict',
          details: error.message
        });
      } else {
        addLog({
          user: userId,
          action: 'Update failed',
          status: 'error',
          details: error.message
        });
      }
    } finally {
      setConcurrentUpdates(prev => Math.max(0, prev - 1));
    }
  };

  // Simulate background job
  const handleBackgroundJob = async () => {
    setIsBackgroundJobRunning(true);

    addLog({
      user: 'Background Job',
      action: 'Processing template fields',
      status: 'pending'
    });

    try {
      await processorRef.current!.processTemplateFields('test-template-123');

      addLog({
        user: 'Background Job',
        action: 'Field processing completed',
        status: 'success',
        details: 'Added validation rules and computed fields'
      });

      const updated = await serviceRef.current!.getTemplate('test-template-123');
      setTemplate(updated);
    } catch (error: any) {
      addLog({
        user: 'Background Job',
        action: 'Processing skipped or failed',
        status: 'error',
        details: 'Recent user update detected - skipping to prevent overwrite'
      });
    } finally {
      setIsBackgroundJobRunning(false);
    }
  };

  // Simulate concurrent updates
  const handleConcurrentUpdates = async () => {
    addLog({
      user: 'System',
      action: 'Triggering concurrent updates from multiple users',
      status: 'pending'
    });

    // Fire all updates simultaneously
    await Promise.allSettled([
      handleUserAUpdate(),
      handleUserBUpdate(),
      handleBackgroundJob()
    ]);
  };

  // Invalidate all caches
  const handleInvalidateCaches = () => {
    serviceRef.current!.clearCache();
    setCacheStates({});

    addLog({
      user: 'System',
      action: 'All caches invalidated',
      status: 'success'
    });
  };

  // Reset everything
  const handleReset = () => {
    const newTemplate = createTestTemplate();
    dbRef.current!.clear();
    dbRef.current!.set(newTemplate.id, newTemplate);
    setTemplate(newTemplate);
    setUpdateLogs([]);
    setCacheStates({});
    setConflicts(0);
    setSuccessfulUpdates(0);

    addLog({
      user: 'System',
      action: 'System reset to initial state',
      status: 'success'
    });
  };

  return (
    <div className="sync-demo">
      <header className="demo-header">
        <h1>🔄 Template Synchronization Visualizer</h1>
        <p>Interactive demonstration of distributed system synchronization challenges</p>
      </header>

      <div className="demo-stats">
        <div className="stat">
          <span className="stat-label">Concurrent Updates</span>
          <span className="stat-value">{concurrentUpdates}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Version Conflicts</span>
          <span className="stat-value conflict">{conflicts}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Successful Updates</span>
          <span className="stat-value success">{successfulUpdates}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Current Version</span>
          <span className="stat-value">{template?.version?.substring(0, 8) || 'N/A'}</span>
        </div>
      </div>

      <div className="demo-grid">
        {/* Control Panel */}
        <section className="control-panel">
          <h2>🎮 Control Panel</h2>

          <div className="control-group">
            <h3>Individual Updates</h3>
            <button
              onClick={handleUserAUpdate}
              disabled={concurrentUpdates > 0}
              className="btn btn-user-a"
            >
              👤 User A: Update Name
            </button>
            <button
              onClick={handleUserBUpdate}
              disabled={concurrentUpdates > 0}
              className="btn btn-user-b"
            >
              👥 User B: Add Field
            </button>
            <button
              onClick={handleBackgroundJob}
              disabled={isBackgroundJobRunning}
              className="btn btn-background"
            >
              🤖 Background Job
            </button>
          </div>

          <div className="control-group">
            <h3>Chaos Testing</h3>
            <button
              onClick={handleConcurrentUpdates}
              disabled={concurrentUpdates > 0}
              className="btn btn-concurrent"
            >
              ⚡ Trigger Concurrent Updates
            </button>
            <button
              onClick={handleInvalidateCaches}
              className="btn btn-cache"
            >
              🗑️ Invalidate All Caches
            </button>
            <button
              onClick={handleReset}
              className="btn btn-reset"
            >
              🔄 Reset System
            </button>
          </div>
        </section>

        {/* Template State */}
        <section className="template-state">
          <h2>📄 Current Template State</h2>
          <div className="template-view">
            <div className="template-field">
              <strong>ID:</strong> {template?.id}
            </div>
            <div className="template-field">
              <strong>Name:</strong> {template?.name}
            </div>
            <div className="template-field">
              <strong>Version:</strong>
              <code>{template?.version}</code>
            </div>
            <div className="template-field">
              <strong>Last Updated:</strong> {template?.updated_at ?
                new Date(template.updated_at).toLocaleTimeString() : 'N/A'}
            </div>
            <div className="template-field">
              <strong>Update Count:</strong> {template?.update_count || 0}
            </div>
            <div className="template-field">
              <strong>Fields:</strong> {
                template?.field_definitions ?
                Object.keys(template.field_definitions).length : 0
              }
            </div>
            <details className="template-details">
              <summary>Field Definitions</summary>
              <pre>{JSON.stringify(template?.field_definitions, null, 2)}</pre>
            </details>
          </div>
        </section>

        {/* Cache States */}
        <section className="cache-states">
          <h2>💾 Cache States</h2>
          <div className="cache-grid">
            {Object.entries(cacheStates).map(([userId, state]) => (
              <div
                key={userId}
                className={`cache-card ${state.isStale ? 'stale' : 'fresh'}`}
              >
                <h4>{userId}</h4>
                <div className="cache-info">
                  <span>Has Data: {state.hasData ? '✅' : '❌'}</span>
                  <span>Version: {state.version?.substring(0, 8) || 'None'}</span>
                  <span className={state.isStale ? 'stale-indicator' : ''}>
                    {state.isStale ? '⚠️ STALE' : '✨ FRESH'}
                  </span>
                </div>
              </div>
            ))}
            {Object.keys(cacheStates).length === 0 && (
              <div className="empty-state">No cached data</div>
            )}
          </div>
        </section>

        {/* Update Log */}
        <section className="update-log">
          <h2>📝 Update Log</h2>
          <div className="log-container">
            {updateLogs.map(log => (
              <div
                key={log.id}
                className={`log-entry log-${log.status}`}
              >
                <span className="log-time">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="log-user">{log.user}</span>
                <span className="log-action">{log.action}</span>
                {log.version && (
                  <span className="log-version">v:{log.version.substring(0, 8)}</span>
                )}
                {log.details && (
                  <span className="log-details">{log.details}</span>
                )}
              </div>
            ))}
            {updateLogs.length === 0 && (
              <div className="empty-state">No updates yet. Try clicking some buttons!</div>
            )}
          </div>
        </section>
      </div>

      {/* Problem Indicators */}
      <div className="problem-indicators">
        <h3>🎯 Key Synchronization Concepts Demonstrated</h3>
        <div className="indicators-grid">
          <div className="indicator">
            <span className="indicator-icon">🔒</span>
            <span>Optimistic Locking</span>
          </div>
          <div className="indicator">
            <span className="indicator-icon">♻️</span>
            <span>Cache Invalidation</span>
          </div>
          <div className="indicator">
            <span className="indicator-icon">📦</span>
            <span>JSONB Serialization</span>
          </div>
          <div className="indicator">
            <span className="indicator-icon">⏳</span>
            <span>Exponential Backoff</span>
          </div>
          <div className="indicator">
            <span className="indicator-icon">🤝</span>
            <span>Service Coordination</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export the expected CSS for the solution
export const solutionStyles = `
.sync-demo {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.demo-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.demo-header h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
}

.demo-stats {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 30px;
}

.stat {
  background: white;
  padding: 15px 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 2em;
  font-weight: bold;
  color: #333;
}

.stat-value.conflict {
  color: #e74c3c;
}

.stat-value.success {
  color: #27ae60;
}

.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
  margin-bottom: 30px;
}

.control-panel, .template-state, .cache-states, .update-log {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.control-panel h2, .template-state h2, .cache-states h2, .update-log h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.control-group {
  margin-bottom: 20px;
}

.control-group h3 {
  font-size: 1.1em;
  color: #666;
  margin-bottom: 10px;
}

.btn {
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-user-a {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-user-b {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-background {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-concurrent {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.btn-cache {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
  color: white;
}

.btn-reset {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #333;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.template-view {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.template-field {
  margin-bottom: 10px;
  font-size: 0.95em;
}

.template-field strong {
  color: #555;
  margin-right: 10px;
}

.template-field code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}

.template-details {
  margin-top: 15px;
}

.template-details summary {
  cursor: pointer;
  color: #667eea;
  font-weight: 500;
}

.template-details pre {
  background: white;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
  font-size: 0.85em;
  margin-top: 10px;
}

.cache-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.cache-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #e9ecef;
}

.cache-card.stale {
  border-color: #ffc107;
  background: #fff3cd;
}

.cache-card h4 {
  margin: 0 0 10px 0;
  color: #495057;
}

.cache-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.9em;
}

.stale-indicator {
  color: #856404;
  font-weight: bold;
}

.update-log {
  grid-column: 1 / -1;
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.log-entry {
  display: grid;
  grid-template-columns: auto auto 1fr auto auto;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  background: white;
  border-radius: 6px;
  font-size: 0.9em;
  align-items: center;
  border-left: 4px solid #dee2e6;
}

.log-entry.log-success {
  border-left-color: #28a745;
  background: #d4edda;
}

.log-entry.log-conflict {
  border-left-color: #ffc107;
  background: #fff3cd;
}

.log-entry.log-error {
  border-left-color: #dc3545;
  background: #f8d7da;
}

.log-entry.log-pending {
  border-left-color: #17a2b8;
  background: #d1ecf1;
}

.log-time {
  color: #6c757d;
  font-size: 0.85em;
}

.log-user {
  font-weight: bold;
  color: #495057;
}

.log-action {
  color: #212529;
}

.log-version {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.85em;
}

.log-details {
  color: #6c757d;
  font-size: 0.85em;
  font-style: italic;
}

.empty-state {
  text-align: center;
  color: #6c757d;
  padding: 20px;
  font-style: italic;
}

.problem-indicators {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.problem-indicators h3 {
  margin-top: 0;
  color: #333;
  text-align: center;
}

.indicators-grid {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 20px;
}

.indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 20px;
  font-size: 0.95em;
  color: #495057;
}

.indicator-icon {
  font-size: 1.2em;
}

/* Animations */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.stat-value {
  animation: pulse 2s infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }

  .demo-stats {
    flex-wrap: wrap;
  }

  .stat {
    flex: 1 1 40%;
  }
}
`;
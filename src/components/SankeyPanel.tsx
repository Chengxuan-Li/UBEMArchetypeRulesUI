import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../lib/store';
import { renderSankey, getSankeyStats } from '../lib/sankey-build';
import { SettingsPanel } from './SettingsPanel';
import { getFeatureFields } from '../lib/rules-engine';

export function SankeyPanel() {
  const { ruleset, features } = useAppStore();
  const sankeyRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<any>(null);

  // Update Sankey diagram when rules, features, or settings change
  useEffect(() => {
    if (sankeyRef.current && features.length > 0 && ruleset.rules.length > 0) {
      try {
        // Ensure the container has an ID
        if (!sankeyRef.current.id) {
          sankeyRef.current.id = 'sankey-container';
        }
        
        renderSankey(
          sankeyRef.current.id,
          features,
          ruleset.rules,
          ruleset.settings,
          ruleset.archetypeOptions
        );
        
        // Update stats
        const newStats = getSankeyStats(
          features,
          ruleset.rules,
          ruleset.settings,
          ruleset.archetypeOptions
        );
        setStats(newStats);
      } catch (error) {
        console.error('Error rendering Sankey:', error);
        // Set stats even if rendering fails
        const newStats = getSankeyStats(
          features,
          ruleset.rules,
          ruleset.settings,
          ruleset.archetypeOptions
        );
        setStats(newStats);
      }
    }
  }, [ruleset.rules, ruleset.settings, ruleset.archetypeOptions, features]);

  const availableFields = getFeatureFields(features);

  if (features.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Sankey Visualization</h2>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No features loaded</h3>
            <p className="mt-1 text-sm text-gray-500">
              Load features to visualize the assignment flow.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (ruleset.rules.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Sankey Visualization</h2>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No rules defined</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create rules to see the assignment flow.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sankey Visualization */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Assignment Flow</h2>
            <div className="flex items-center space-x-2">
              {stats && (
                <div className="text-sm text-gray-500">
                  {stats.assignedFeatures} of {stats.totalFeatures} features assigned
                </div>
              )}
              <button
                onClick={() => {
                  console.log('Debug info:', {
                    features: features.length,
                    rules: ruleset.rules.length,
                    archetypeOptions: ruleset.archetypeOptions.length,
                    settings: ruleset.settings
                  });
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Debug
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div 
            ref={sankeyRef}
            id="sankey-container"
            className="plotly-chart"
          />
          {!stats && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Loading visualization...
            </div>
          )}
          
          {stats && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Assignment Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Assignment Rate:</span>
                  <span className="ml-2 font-medium">
                    {Math.round(stats.assignmentRate * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Unassigned:</span>
                  <span className="ml-2 font-medium">{stats.unassignedFeatures}</span>
                </div>
              </div>
              
              {Object.keys(stats.archetypeDistribution).length > 0 && (
                <div className="mt-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Archetype Distribution</h4>
                  <div className="space-y-1">
                    {Object.entries(stats.archetypeDistribution)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([archetype, count]) => (
                        <div key={archetype} className="flex justify-between text-xs">
                          <span className="text-gray-600 truncate">
                            {archetype.replace(/\.json$/, '')}
                          </span>
                          <span className="font-medium">{count as number}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel 
        availableFields={availableFields}
      />
    </div>
  );
}

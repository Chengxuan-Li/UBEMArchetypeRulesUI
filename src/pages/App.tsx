import { useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { loadRuleset, loadFeatures } from '../lib/storage';
import { Toolbar } from '../components/Toolbar';
import { RuleList } from '../components/RuleList';
import { SankeyPanel } from '../components/SankeyPanel';

export function App() {
  const { 
    ruleset, 
    features, 
    updateRuleset, 
    updateFeatures,
    loadSampleData 
  } = useAppStore();

  // Load data from localStorage on mount
  useEffect(() => {
    const storedRuleset = loadRuleset();
    const storedFeatures = loadFeatures();
    
    if (storedRuleset) {
      updateRuleset(storedRuleset);
    }
    
    if (storedFeatures.length > 0) {
      updateFeatures(storedFeatures);
    } else {
      // Load sample data if no features are stored
      loadSampleData();
    }
  }, [updateRuleset, updateFeatures, loadSampleData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                UbemArchetypeRulesUI
              </h1>
              <span className="ml-2 text-sm text-gray-500">
                Building Archetype Rule Authoring Tool
              </span>
            </div>
            <Toolbar />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Rules */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Rules</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Create and manage rules to assign building archetypes to features
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Add Rule Button */}
                    <button
                      onClick={() => useAppStore.getState().addRule()}
                      className="btn btn-primary btn-sm"
                      title="Add new rule"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Rule
                    </button>

                    {/* Add Custom Rule Button */}
                    <button
                      onClick={() => {
                        const newRule = {
                          id: crypto.randomUUID(),
                          type: 'custom' as const,
                          logic: 'all' as const,
                          conditions: [],
                          assignArchetype: '',
                          priority: 99,
                          formula: '',
                          name: '',
                          enabled: true
                        };
                        const { ruleset, updateRuleset } = useAppStore.getState();
                        const updatedRules = [...ruleset.rules, newRule];
                        updateRuleset({ ...ruleset, rules: updatedRules });
                      }}
                      className="btn btn-secondary btn-sm"
                      title="Add custom formula rule"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Custom Rule
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <RuleList />
              </div>
            </div>
          </div>

          {/* Right Panel - Sankey Visualization */}
          <div className="lg:col-span-1">
            <SankeyPanel />
          </div>
        </div>

        {/* Features Summary */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Features Summary</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{features.length}</div>
                <div className="text-sm text-gray-500">Total Features</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{ruleset.rules.length}</div>
                <div className="text-sm text-gray-500">Active Rules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{ruleset.archetypeOptions.length}</div>
                <div className="text-sm text-gray-500">Archetype Options</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {ruleset.settings.featuresGroupLevel1 ? '2' : ruleset.settings.featuresGroupLevel2 ? '1' : '0'}
                </div>
                <div className="text-sm text-gray-500">Grouping Levels</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

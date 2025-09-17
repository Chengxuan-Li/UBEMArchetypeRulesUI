import { useRef } from 'react';
import { useAppStore } from '../lib/store';
import { exportRulesetToFile, importRulesetFromFile, importFeaturesFromFile } from '../lib/storage';

export function Toolbar() {
  const { 
    ruleset, 
    updateRuleset, 
    updateFeatures, 
    resetRuleset,
    loadSampleData 
  } = useAppStore();
  
  const rulesetFileRef = useRef<HTMLInputElement>(null);
  const featuresFileRef = useRef<HTMLInputElement>(null);

  const handleExportRuleset = () => {
    exportRulesetToFile(ruleset);
  };

  const handleImportRuleset = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importRulesetFromFile(file)
      .then((importedRuleset) => {
        updateRuleset(importedRuleset);
        alert('Ruleset imported successfully!');
      })
      .catch((error) => {
        alert(`Failed to import ruleset: ${error.message}`);
      })
      .finally(() => {
        if (rulesetFileRef.current) {
          rulesetFileRef.current.value = '';
        }
      });
  };

  const handleImportFeatures = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importFeaturesFromFile(file)
      .then((importedFeatures) => {
        updateFeatures(importedFeatures);
        alert(`Imported ${importedFeatures.length} features successfully!`);
      })
      .catch((error) => {
        alert(`Failed to import features: ${error.message}`);
      })
      .finally(() => {
        if (featuresFileRef.current) {
          featuresFileRef.current.value = '';
        }
      });
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all rules? This action cannot be undone.')) {
      resetRuleset();
    }
  };

  const handleLoadSampleData = () => {
    if (confirm('Load sample data? This will replace current features and archetype options.')) {
      loadSampleData();
    }
  };

  return (
    <div className="flex items-center space-x-2">

      {/* Import/Export Ruleset */}
      <div className="relative">
        <button
          onClick={() => rulesetFileRef.current?.click()}
          className="btn btn-secondary btn-sm"
          title="Import ruleset from JSON file"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Import Ruleset
        </button>
        <input
          ref={rulesetFileRef}
          type="file"
          accept=".json"
          onChange={handleImportRuleset}
          className="hidden"
        />
      </div>

      <button
        onClick={handleExportRuleset}
        className="btn btn-secondary btn-sm"
        title="Export ruleset to JSON file"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Export Ruleset
      </button>

      <div className="h-6 w-px bg-gray-300" />

      {/* Import Features */}
      <div className="relative">
        <button
          onClick={() => featuresFileRef.current?.click()}
          className="btn btn-secondary btn-sm"
          title="Import features from JSON file"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Import Features
        </button>
        <input
          ref={featuresFileRef}
          type="file"
          accept=".json"
          onChange={handleImportFeatures}
          className="hidden"
        />
      </div>

      <div className="h-6 w-px bg-gray-300" />

      {/* Sample Data */}
      <button
        onClick={handleLoadSampleData}
        className="btn btn-secondary btn-sm"
        title="Load sample data for testing"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Sample Data
      </button>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="btn btn-danger btn-sm"
        title="Reset all rules to default"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset
      </button>
    </div>
  );
}

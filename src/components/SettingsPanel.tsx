import { useAppStore } from '../lib/store';
import { SearchableSelect } from './SearchableSelect';

interface SettingsPanelProps {
  availableFields: string[];
}

export function SettingsPanel({ availableFields }: SettingsPanelProps) {
  const { ruleset, updateSettings } = useAppStore();

  const handleFieldChange = (level: 'featuresGroupLevel1' | 'featuresGroupLevel2', field: string) => {
    const newSettings = { ...ruleset.settings };
    if (field === '') {
      // Clear the field
      newSettings[level] = undefined;
    } else {
      newSettings[level] = field;
    }
    updateSettings(newSettings);
  };

  const handleColorMapChange = (colorMap: 'Accent' | 'Set1') => {
    updateSettings({ colorMap });
  };

  const handleTemplateGroupedChange = (templateGrouped: boolean) => {
    updateSettings({ templateGrouped });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-medium text-gray-900">Visualization Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure how features and archetypes are grouped in the Sankey diagram
        </p>
      </div>
      <div className="card-body space-y-4">
        {/* Feature Grouping */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Feature Grouping</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Level 1 (Primary grouping)
              </label>
              <SearchableSelect
                options={availableFields}
                value={ruleset.settings.featuresGroupLevel1 || ''}
                onChange={(value) => handleFieldChange('featuresGroupLevel1', value)}
                placeholder="No grouping"
                className="form-select text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Level 2 (Secondary grouping)
              </label>
              <SearchableSelect
                options={availableFields.filter(field => field !== ruleset.settings.featuresGroupLevel1)}
                value={ruleset.settings.featuresGroupLevel2 || ''}
                onChange={(value) => handleFieldChange('featuresGroupLevel2', value)}
                placeholder="No secondary grouping"
                className="form-select text-sm"
              />
            </div>
          </div>
        </div>

        {/* Archetype Grouping */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Archetype Grouping</h3>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="templateGrouped"
              checked={ruleset.settings.templateGrouped}
              onChange={(e) => handleTemplateGroupedChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="templateGrouped" className="ml-2 text-sm text-gray-700">
              Group archetypes by template (AAAA from AAAA_BB_CC.json)
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            When enabled, archetypes will be grouped by their prefix (e.g., RES, COM, IND)
          </p>
        </div>

        {/* Color Scheme */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Color Scheme</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleColorMapChange('Accent')}
              className={`p-3 text-sm rounded-lg border ${
                ruleset.settings.colorMap === 'Accent'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              Accent
            </button>
            <button
              onClick={() => handleColorMapChange('Set1')}
              className={`p-3 text-sm rounded-lg border ${
                ruleset.settings.colorMap === 'Set1'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              Set1
            </button>
          </div>
        </div>

        {/* Grouping Preview */}
        {(ruleset.settings.featuresGroupLevel1 || ruleset.settings.templateGrouped) && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Grouping Preview</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>
                <span className="font-medium">Features:</span>
                <span className="ml-1">
                  {ruleset.settings.featuresGroupLevel1 ? (
                    <>
                      Grouped by <code>{ruleset.settings.featuresGroupLevel1}</code>
                      {ruleset.settings.featuresGroupLevel2 && (
                        <>, then by <code>{ruleset.settings.featuresGroupLevel2}</code></>
                      )}
                    </>
                  ) : (
                    'No grouping (all features together)'
                  )}
                </span>
              </div>
              <div>
                <span className="font-medium">Archetypes:</span>
                <span className="ml-1">
                  {ruleset.settings.templateGrouped ? (
                    'Grouped by template prefix (e.g., RES, COM, IND)'
                  ) : (
                    'Individual archetypes'
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

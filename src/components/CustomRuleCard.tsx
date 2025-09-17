import { useState } from 'react';
import { Rule } from '../lib/schemas';
import { formulaEvaluator } from '../lib/formula-eval';
import { useAppStore } from '../lib/store';

interface CustomRuleCardProps {
  rule: Rule;
  index: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPriorityChange: (priority: number) => void;
  onArchetypeChange: (archetype: string) => void;
  canDelete: boolean;
  dragAttributes: any;
  dragListeners: any;
}

export function CustomRuleCard({
  rule,
  index,
  isExpanded,
  onToggleExpanded,
  onDelete,
  onDuplicate,
  onPriorityChange,
  onArchetypeChange,
  canDelete,
  dragAttributes,
  dragListeners
}: CustomRuleCardProps) {
  const [formula, setFormula] = useState(rule.formula || '');
  const [validation, setValidation] = useState<{ valid: boolean; error?: string }>({ valid: true });
  const [showExamples, setShowExamples] = useState(false);

  const handleFormulaChange = (newFormula: string) => {
    setFormula(newFormula);
    const validationResult = formulaEvaluator.validate(newFormula);
    setValidation(validationResult);
    
    // Update rule if formula is valid
    if (validationResult.valid) {
      const { updateRule } = useAppStore.getState();
      updateRule(rule.id, { formula: newFormula });
    }
  };

  const handlePriorityChange = (priority: number) => {
    onPriorityChange(priority);
  };

  const handleArchetypeChange = (archetype: string) => {
    onArchetypeChange(archetype);
  };

  const examples = formulaEvaluator.getExamples();

  return (
    <div className={rule.enabled === false ? 'opacity-60 bg-gray-50' : ''}>
      {/* Rule Header */}
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Drag Handle */}
            <div
              {...dragAttributes}
              {...dragListeners}
              className="drag-handle text-gray-400 hover:text-gray-600"
              title="Drag to reorder"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>

            {/* Rule Title */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  Custom Rule #{index + 1}
                </span>
                <input
                  type="text"
                  value={rule.name || ''}
                  onChange={(e) => {
                    const { updateRule } = useAppStore.getState();
                    updateRule(rule.id, { name: e.target.value });
                  }}
                  placeholder="Rule name (optional)"
                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <button
                onClick={onToggleExpanded}
                className="text-left hover:text-blue-600"
              >
                <p className="text-xs text-gray-500">
                  Formula: {formula ? formula.substring(0, 50) + (formula.length > 50 ? '...' : '') : 'No formula'}
                </p>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center space-x-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rule.enabled !== false}
                  onChange={(e) => {
                    const { updateRule } = useAppStore.getState();
                    updateRule(rule.id, { enabled: e.target.checked });
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-1 text-xs text-gray-600">
                  {rule.enabled !== false ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
            
            <span className="text-xs text-gray-500">
              Priority: {rule.priority}
            </span>
            
            <button
              onClick={onDuplicate}
              className="text-gray-400 hover:text-blue-600"
              title="Duplicate rule"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>

            <button
              onClick={onDelete}
              disabled={!canDelete}
              className={`${canDelete ? 'text-gray-400 hover:text-red-600' : 'text-gray-300 cursor-not-allowed'}`}
              title={canDelete ? 'Delete rule' : 'Cannot delete the last rule'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <button
              onClick={onToggleExpanded}
              className="text-gray-400 hover:text-gray-600"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg 
                className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Rule Content */}
      {isExpanded && (
        <div className="card-body space-y-4">
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <input
              type="number"
              value={rule.priority}
              onChange={(e) => handlePriorityChange(parseInt(e.target.value) || 99)}
              className="form-input"
              min="0"
              max="999"
            />
          </div>

          {/* Formula */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Formula
              </label>
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showExamples ? 'Hide Examples' : 'Show Examples'}
              </button>
            </div>
            
            <textarea
              value={formula}
              onChange={(e) => handleFormulaChange(e.target.value)}
              placeholder="Enter formula (e.g., toNumber(feature['height']) > 20)"
              className={`form-input text-mono min-h-[80px] ${validation.valid ? '' : 'border-red-300 focus:border-red-500 focus:ring-red-500'}`}
              rows={3}
            />
            
            {!validation.valid && (
              <p className="mt-1 text-sm text-red-600">
                {validation.error}
              </p>
            )}
            
            {validation.valid && formula && (
              <p className="mt-1 text-sm text-green-600">
                ✓ Formula is valid
              </p>
            )}
          </div>

          {/* Examples */}
          {showExamples && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-3">Formula Examples</h4>
              <div className="space-y-3">
                {examples.map((example, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="font-medium text-blue-800">{example.title}</div>
                    <div className="text-mono bg-blue-100 p-2 rounded mt-1 text-blue-900">
                      {example.formula}
                    </div>
                    <div className="text-blue-700 mt-1">{example.description}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-blue-200">
                <h5 className="text-sm font-medium text-blue-900 mb-2">Available Functions</h5>
                <div className="text-sm text-blue-800">
                  <code>lower(str)</code>, <code>upper(str)</code>, <code>trim(str)</code>,{' '}
                  <code>toNumber(x)</code>, <code>includes(hay, needle)</code>,{' '}
                  <code>in(x, array)</code>, <code>isEmpty(x)</code>
                </div>
              </div>
            </div>
          )}

          {/* Assign Archetype */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Archetype
            </label>
            <select
              value={rule.assignArchetype}
              onChange={(e) => handleArchetypeChange(e.target.value)}
              className="form-select"
            >
              <option value="">Select archetype...</option>
              {useAppStore.getState().ruleset.archetypeOptions.map((archetype: string) => (
                <option key={archetype} value={archetype}>
                  {archetype.replace(/\.json$/, '')}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

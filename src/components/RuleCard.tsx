import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Rule, Operator, Logic } from '../lib/schemas';
import { useAppStore } from '../lib/store';
import { getFeatureFields } from '../lib/rules-engine';
import { ConditionRow } from './ConditionRow';
import { CustomRuleCard } from './CustomRuleCard';

interface RuleCardProps {
  rule: Rule;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export function RuleCard({ rule, index, isSelected, onSelect }: RuleCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { 
    ruleset,
    features,
    updateRule, 
    deleteRule, 
    duplicateRule 
  } = useAppStore();

  const [isExpanded, setIsExpanded] = useState(isSelected);

  const availableFields = getFeatureFields(features);
  const canDelete = ruleset.rules.length > 1;

  const handleLogicChange = (logic: Logic) => {
    updateRule(rule.id, { logic });
  };

  const handlePriorityChange = (priority: number) => {
    updateRule(rule.id, { priority });
  };

  const handleArchetypeChange = (assignArchetype: string) => {
    updateRule(rule.id, { assignArchetype });
  };

  const handleDelete = () => {
    if (canDelete && confirm('Are you sure you want to delete this rule?')) {
      deleteRule(rule.id);
    }
  };

  const handleDuplicate = () => {
    duplicateRule(rule.id);
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      onSelect();
    }
  };

  if (rule.type === 'custom') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`card ${isDragging ? 'opacity-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      >
        <CustomRuleCard
          rule={rule}
          index={index}
          isExpanded={isExpanded}
          onToggleExpanded={handleToggleExpanded}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onPriorityChange={handlePriorityChange}
          onArchetypeChange={handleArchetypeChange}
          canDelete={canDelete}
          dragAttributes={attributes}
          dragListeners={listeners}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card ${isDragging ? 'opacity-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''} ${rule.enabled === false ? 'opacity-60 bg-gray-50' : ''}`}
    >
      {/* Rule Header */}
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
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
                  Rule #{index + 1}
                </span>
                <input
                  type="text"
                  value={rule.name || ''}
                  onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                  placeholder="Rule name (optional)"
                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <button
                onClick={handleToggleExpanded}
                className="text-left hover:text-blue-600"
              >
                <p className="text-xs text-gray-500">
                  {rule.logic} of {rule.conditions.length} conditions
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
                  onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })}
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
              onClick={handleDuplicate}
              className="text-gray-400 hover:text-blue-600"
              title="Duplicate rule"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>

            <button
              onClick={handleDelete}
              disabled={!canDelete}
              className={`${canDelete ? 'text-gray-400 hover:text-red-600' : 'text-gray-300 cursor-not-allowed'}`}
              title={canDelete ? 'Delete rule' : 'Cannot delete the last rule'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <button
              onClick={handleToggleExpanded}
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
          {/* Logic Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logic
            </label>
            <select
              value={rule.logic}
              onChange={(e) => handleLogicChange(e.target.value as Logic)}
              className="form-select"
            >
              <option value="all">All conditions must be true</option>
              <option value="any">Any condition can be true</option>
              <option value="none">No condition should be true</option>
            </select>
          </div>

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

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Conditions
              </label>
              <button
                onClick={() => {
                  const newCondition = {
                    field: '',
                    operator: 'equals' as Operator,
                    value: null
                  };
                  updateRule(rule.id, {
                    conditions: [...rule.conditions, newCondition]
                  });
                }}
                className="btn btn-secondary btn-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Condition
              </button>
            </div>
            
            <div className="space-y-2">
              {rule.conditions.map((condition, conditionIndex) => (
                <ConditionRow
                  key={`${rule.id}-condition-${conditionIndex}`}
                  condition={condition}
                  availableFields={availableFields}
                  onUpdate={(updatedCondition) => {
                    const updatedConditions = [...rule.conditions];
                    updatedConditions[conditionIndex] = updatedCondition;
                    updateRule(rule.id, { conditions: updatedConditions });
                  }}
                  onDelete={() => {
                    const updatedConditions = rule.conditions.filter((_, i) => i !== conditionIndex);
                    updateRule(rule.id, { conditions: updatedConditions });
                  }}
                  onDuplicate={() => {
                    const updatedConditions = [...rule.conditions, { ...condition }];
                    updateRule(rule.id, { conditions: updatedConditions });
                  }}
                />
              ))}
              
              {rule.conditions.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No conditions defined. Add conditions to create a rule.
                </div>
              )}
            </div>
          </div>

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
              {ruleset.archetypeOptions.map((archetype) => (
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

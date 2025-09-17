import { useState } from 'react';
import { Condition, Operator, Value } from '../lib/schemas';
import { coerceValue } from '../lib/rules-engine';
import { SearchableSelect } from './SearchableSelect';

interface ConditionRowProps {
  condition: Condition;
  availableFields: string[];
  onUpdate: (condition: Condition) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function ConditionRow({ 
  condition, 
  availableFields, 
  onUpdate, 
  onDelete, 
  onDuplicate 
}: ConditionRowProps) {
  const [localValue, setLocalValue] = useState(condition.value);

  const operatorOptions = [
    { value: 'equals', label: 'equals' },
    { value: 'notEquals', label: 'not equals' },
    { value: 'contains', label: 'contains' },
    { value: 'notContains', label: 'not contains' },
    { value: 'gt', label: 'greater than' },
    { value: 'gte', label: 'greater than or equal' },
    { value: 'lt', label: 'less than' },
    { value: 'lte', label: 'less than or equal' },
    { value: 'in', label: 'in list' },
    { value: 'notIn', label: 'not in list' },
    { value: 'isEmpty', label: 'is empty' },
    { value: 'isNotEmpty', label: 'is not empty' }
  ];

  const handleFieldChange = (field: string) => {
    onUpdate({ ...condition, field });
  };

  const handleOperatorChange = (operator: Operator) => {
    onUpdate({ ...condition, operator, value: null });
    setLocalValue(null);
  };

  const handleValueChange = (value: any) => {
    setLocalValue(value);
    
    // Auto-coerce value based on operator
    let coercedValue: Value = value;
    
    if (condition.operator === 'in' || condition.operator === 'notIn') {
      // Parse comma-separated values for array operators
      if (typeof value === 'string') {
        const items = value.split(',').map(item => item.trim()).filter(item => item);
        coercedValue = items;
      } else if (Array.isArray(value)) {
        coercedValue = value;
      } else {
        coercedValue = [value];
      }
    } else if (condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty') {
      // No value needed for empty operators
      coercedValue = null;
    } else if (typeof value === 'string' && value.trim() === '') {
      coercedValue = null;
    } else {
      coercedValue = coerceValue(value);
    }
    
    onUpdate({ ...condition, value: coercedValue });
  };

  const renderValueInput = () => {
    
    if (condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty') {
      return (
        <div className="text-sm text-gray-500 italic">
          No value required
        </div>
      );
    }
    
    if (condition.operator === 'in' || condition.operator === 'notIn') {
      return (
        <input
          type="text"
          value={Array.isArray(localValue) ? localValue.join(', ') : String(localValue || '')}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder="Comma-separated values (e.g., R1, R2, R3)"
          className="form-input text-sm"
        />
      );
    }
    
    if (condition.operator === 'gt' || condition.operator === 'gte' || condition.operator === 'lt' || condition.operator === 'lte') {
      return (
        <input
          type="number"
          value={typeof localValue === 'number' ? localValue : ''}
          onChange={(e) => handleValueChange(parseFloat(e.target.value) || null)}
          placeholder="Enter number"
          className="form-input text-sm"
          step="any"
        />
      );
    }
    
    // String operators (equals, notEquals, contains, notContains)
    return (
      <input
        type="text"
        value={String(localValue || '')}
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder="Enter value"
        className="form-input text-sm"
      />
    );
  };

  return (
    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
      {/* Field Selector */}
      <div className="flex-1">
        <SearchableSelect
          options={availableFields}
          value={condition.field}
          onChange={handleFieldChange}
          placeholder="Select field..."
          className="form-select text-sm"
        />
      </div>

      {/* Operator Selector */}
      <div className="flex-1">
        <select
          value={condition.operator}
          onChange={(e) => handleOperatorChange(e.target.value as Operator)}
          className="form-select text-sm"
        >
          {operatorOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Value Input */}
      <div className="flex-2">
        {renderValueInput()}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1">
        <button
          onClick={onDuplicate}
          className="text-gray-400 hover:text-blue-600"
          title="Duplicate condition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-600"
          title="Delete condition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

import { Condition, Rule, Feature, Operator, Value } from './schemas';

// Type coercion function
export function coerceValue(value: any): string | number | boolean | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  // Try to parse as number
  if (typeof value === 'string') {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && isFinite(numValue)) {
      return numValue;
    }
    
    // Try to parse as boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Try to parse as ISO date
    const dateValue = new Date(value);
    if (!isNaN(dateValue.getTime())) {
      return dateValue.getTime();
    }
  }
  
  return String(value);
}

// Get feature value with type coercion
function getFeatureValue(feature: Feature, field: string): string | number | boolean | null {
  const rawValue = feature[field];
  return coerceValue(rawValue);
}

// Check if value is empty
function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

// Operator evaluation functions
const operators: Record<Operator, (featureValue: any, conditionValue: Value) => boolean> = {
  equals: (featureValue, conditionValue) => {
    const coercedFeature = coerceValue(featureValue);
    const coercedCondition = coerceValue(conditionValue);
    return coercedFeature === coercedCondition;
  },
  
  notEquals: (featureValue, conditionValue) => {
    const coercedFeature = coerceValue(featureValue);
    const coercedCondition = coerceValue(conditionValue);
    return coercedFeature !== coercedCondition;
  },
  
  contains: (featureValue, conditionValue) => {
    const coercedFeature = String(featureValue || '');
    const coercedCondition = String(conditionValue || '');
    
    if (Array.isArray(conditionValue)) {
      return conditionValue.some(v => String(v) === coercedFeature);
    }
    
    return coercedFeature.includes(coercedCondition);
  },
  
  notContains: (featureValue, conditionValue) => {
    const coercedFeature = String(featureValue || '');
    const coercedCondition = String(conditionValue || '');
    
    if (Array.isArray(conditionValue)) {
      return !conditionValue.some(v => String(v) === coercedFeature);
    }
    
    return !coercedFeature.includes(coercedCondition);
  },
  
  gt: (featureValue, conditionValue) => {
    const coercedFeature = coerceValue(featureValue);
    const coercedCondition = coerceValue(conditionValue);
    
    if (typeof coercedFeature === 'number' && typeof coercedCondition === 'number') {
      return coercedFeature > coercedCondition;
    }
    
    return false;
  },
  
  gte: (featureValue, conditionValue) => {
    const coercedFeature = coerceValue(featureValue);
    const coercedCondition = coerceValue(conditionValue);
    
    if (typeof coercedFeature === 'number' && typeof coercedCondition === 'number') {
      return coercedFeature >= coercedCondition;
    }
    
    return false;
  },
  
  lt: (featureValue, conditionValue) => {
    const coercedFeature = coerceValue(featureValue);
    const coercedCondition = coerceValue(conditionValue);
    
    if (typeof coercedFeature === 'number' && typeof coercedCondition === 'number') {
      return coercedFeature < coercedCondition;
    }
    
    return false;
  },
  
  lte: (featureValue, conditionValue) => {
    const coercedFeature = coerceValue(featureValue);
    const coercedCondition = coerceValue(conditionValue);
    
    if (typeof coercedFeature === 'number' && typeof coercedCondition === 'number') {
      return coercedFeature <= coercedCondition;
    }
    
    return false;
  },
  
  in: (featureValue, conditionValue) => {
    if (!Array.isArray(conditionValue)) return false;
    
    const coercedFeature = coerceValue(featureValue);
    return conditionValue.some(v => coerceValue(v) === coercedFeature);
  },
  
  notIn: (featureValue, conditionValue) => {
    if (!Array.isArray(conditionValue)) return true;
    
    const coercedFeature = coerceValue(featureValue);
    return !conditionValue.some(v => coerceValue(v) === coercedFeature);
  },
  
  isEmpty: (featureValue) => {
    return isEmpty(featureValue);
  },
  
  isNotEmpty: (featureValue) => {
    return !isEmpty(featureValue);
  }
};

// Evaluate a single condition
export function evaluateCondition(condition: Condition, feature: Feature): boolean {
  const featureValue = getFeatureValue(feature, condition.field);
  const operator = operators[condition.operator];
  
  if (!operator) {
    console.warn(`Unknown operator: ${condition.operator}`);
    return false;
  }
  
  return operator(featureValue, condition.value);
}

// Evaluate a rule's conditions based on logic
export function evaluateRuleConditions(rule: Rule, feature: Feature): boolean {
  if (rule.conditions.length === 0) {
    return true; // Empty conditions match everything
  }
  
  const results = rule.conditions.map(condition => evaluateCondition(condition, feature));
  
  switch (rule.logic) {
    case 'all':
      return results.every(result => result);
    case 'any':
      return results.some(result => result);
    case 'none':
      return !results.some(result => result);
    default:
      return false;
  }
}

// Evaluate a rule (including custom formula rules)
export function evaluateRule(rule: Rule, feature: Feature, formulaEvaluator?: (formula: string, feature: Feature) => boolean): boolean {
  if (rule.type === 'custom' && rule.formula && formulaEvaluator) {
    return formulaEvaluator(rule.formula, feature);
  }
  
  return evaluateRuleConditions(rule, feature);
}

// Find the first matching rule for a feature
export function findMatchingRule(rules: Rule[], feature: Feature, formulaEvaluator?: (formula: string, feature: Feature) => boolean): Rule | null {
  // Filter to only enabled rules and sort by priority (descending) and then by order in array
  const enabledRules = rules.filter(rule => rule.enabled !== false);
  const sortedRules = [...enabledRules].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return rules.indexOf(a) - rules.indexOf(b);
  });
  
  for (const rule of sortedRules) {
    if (evaluateRule(rule, feature, formulaEvaluator)) {
      return rule;
    }
  }
  
  return null;
}

// Evaluate all features and return assignments
export function evaluateFeatures(
  rules: Rule[], 
  features: Feature[], 
  formulaEvaluator?: (formula: string, feature: Feature) => boolean
): Map<string, string> {
  const assignments = new Map<string, string>();
  
  for (const feature of features) {
    const matchingRule = findMatchingRule(rules, feature, formulaEvaluator);
    if (matchingRule) {
      assignments.set(feature.id, matchingRule.assignArchetype);
    }
  }
  
  return assignments;
}

// Get unique field names from features
export function getFeatureFields(features: Feature[]): string[] {
  const fields = new Set<string>();
  
  for (const feature of features) {
    Object.keys(feature).forEach(key => {
      if (key !== 'id') {
        fields.add(key);
      }
    });
  }
  
  return Array.from(fields).sort();
}

// Get field type from sample values
export function getFieldType(features: Feature[], fieldName: string): 'string' | 'number' | 'boolean' | 'mixed' {
  const values = features
    .map(f => f[fieldName])
    .filter(v => v !== null && v !== undefined)
    .slice(0, 10); // Sample first 10 values
  
  if (values.length === 0) return 'string';
  
  const types = values.map(v => typeof coerceValue(v));
  const uniqueTypes = new Set(types);
  
  if (uniqueTypes.size === 1) {
    const type = Array.from(uniqueTypes)[0];
    return type as 'string' | 'number' | 'boolean';
  }
  
  return 'mixed';
}

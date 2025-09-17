import { describe, it, expect } from 'vitest';
import { 
  coerceValue, 
  evaluateCondition, 
  evaluateRuleConditions, 
  findMatchingRule,
  evaluateFeatures 
} from '../lib/rules-engine';
import { Condition, Rule, Feature } from '../lib/schemas';

describe('Rules Engine', () => {
  describe('coerceValue', () => {
    it('should handle null and undefined', () => {
      expect(coerceValue(null)).toBe(null);
      expect(coerceValue(undefined)).toBe(null);
    });

    it('should preserve booleans', () => {
      expect(coerceValue(true)).toBe(true);
      expect(coerceValue(false)).toBe(false);
    });

    it('should preserve numbers', () => {
      expect(coerceValue(42)).toBe(42);
      expect(coerceValue(3.14)).toBe(3.14);
    });

    it('should parse numeric strings', () => {
      expect(coerceValue('42')).toBe(42);
      expect(coerceValue('3.14')).toBe(3.14);
      expect(coerceValue('-10')).toBe(-10);
    });

    it('should parse boolean strings', () => {
      expect(coerceValue('true')).toBe(true);
      expect(coerceValue('false')).toBe(false);
    });

    it('should parse ISO dates', () => {
      const dateStr = '2024-01-01T00:00:00Z';
      const result = coerceValue(dateStr);
      expect(typeof result).toBe('number');
      expect(result).toBe(new Date(dateStr).getTime());
    });

    it('should fall back to strings', () => {
      expect(coerceValue('hello')).toBe('hello');
      expect(coerceValue('invalid-date')).toBe('invalid-date');
    });
  });

  describe('evaluateCondition', () => {
    const feature: Feature = {
      id: 'test',
      zone: 'R1',
      height: 20,
      material: 'steel',
      roofType: 'flat'
    };

    it('should evaluate equals operator', () => {
      const condition: Condition = {
        field: 'zone',
        operator: 'equals',
        value: 'R1'
      };
      expect(evaluateCondition(condition, feature)).toBe(true);

      const condition2: Condition = {
        field: 'zone',
        operator: 'equals',
        value: 'R2'
      };
      expect(evaluateCondition(condition2, feature)).toBe(false);
    });

    it('should evaluate numeric comparisons', () => {
      const condition: Condition = {
        field: 'height',
        operator: 'gte',
        value: 20
      };
      expect(evaluateCondition(condition, feature)).toBe(true);

      const condition2: Condition = {
        field: 'height',
        operator: 'gt',
        value: 20
      };
      expect(evaluateCondition(condition2, feature)).toBe(false);
    });

    it('should evaluate contains operator', () => {
      const condition: Condition = {
        field: 'material',
        operator: 'contains',
        value: 'ste'
      };
      expect(evaluateCondition(condition, feature)).toBe(true);

      const condition2: Condition = {
        field: 'material',
        operator: 'contains',
        value: 'wood'
      };
      expect(evaluateCondition(condition2, feature)).toBe(false);
    });

    it('should evaluate in operator', () => {
      const condition: Condition = {
        field: 'zone',
        operator: 'in',
        value: ['R1', 'R2', 'R3']
      };
      expect(evaluateCondition(condition, feature)).toBe(true);

      const condition2: Condition = {
        field: 'zone',
        operator: 'in',
        value: ['C1', 'C2']
      };
      expect(evaluateCondition(condition2, feature)).toBe(false);
    });

    it('should evaluate isEmpty operator', () => {
      const condition: Condition = {
        field: 'nonExistent',
        operator: 'isEmpty',
        value: null
      };
      expect(evaluateCondition(condition, feature)).toBe(true);

      const condition2: Condition = {
        field: 'zone',
        operator: 'isEmpty',
        value: null
      };
      expect(evaluateCondition(condition2, feature)).toBe(false);
    });
  });

  describe('evaluateRuleConditions', () => {
    const feature: Feature = {
      id: 'test',
      zone: 'R1',
      height: 20,
      material: 'steel'
    };

    it('should evaluate all logic correctly', () => {
      const rule: Rule = {
        id: 'test-rule',
        type: 'builder',
        logic: 'all',
        conditions: [
          { field: 'zone', operator: 'equals', value: 'R1' },
          { field: 'height', operator: 'gte', value: 20 }
        ],
        assignArchetype: 'RES_A1_01.json',
        priority: 99,
        enabled: true
      };
      expect(evaluateRuleConditions(rule, feature)).toBe(true);

      rule.conditions.push({ field: 'material', operator: 'equals', value: 'wood' });
      expect(evaluateRuleConditions(rule, feature)).toBe(false);
    });

    it('should evaluate any logic correctly', () => {
      const rule: Rule = {
        id: 'test-rule',
        type: 'builder',
        logic: 'any',
        conditions: [
          { field: 'zone', operator: 'equals', value: 'R2' },
          { field: 'height', operator: 'gte', value: 20 }
        ],
        assignArchetype: 'RES_A1_01.json',
        priority: 99,
        enabled: true
      };
      expect(evaluateRuleConditions(rule, feature)).toBe(true);
    });

    it('should evaluate none logic correctly', () => {
      const rule: Rule = {
        id: 'test-rule',
        type: 'builder',
        logic: 'none',
        conditions: [
          { field: 'zone', operator: 'equals', value: 'R2' },
          { field: 'material', operator: 'equals', value: 'wood' }
        ],
        assignArchetype: 'RES_A1_01.json',
        priority: 99,
        enabled: true
      };
      expect(evaluateRuleConditions(rule, feature)).toBe(true);
    });

    it('should handle empty conditions', () => {
      const rule: Rule = {
        id: 'test-rule',
        type: 'builder',
        logic: 'all',
        conditions: [],
        assignArchetype: 'RES_A1_01.json',
        priority: 99,
        enabled: true
      };
      expect(evaluateRuleConditions(rule, feature)).toBe(true);
    });
  });

  describe('findMatchingRule', () => {
    const features: Feature[] = [
      { id: 'feat1', zone: 'R1', height: 15, material: 'wood' },
      { id: 'feat2', zone: 'R2', height: 25, material: 'steel' },
      { id: 'feat3', zone: 'C1', height: 30, material: 'concrete' }
    ];

    const rules: Rule[] = [
      {
        id: 'rule1',
        type: 'builder',
        logic: 'all',
        conditions: [
          { field: 'zone', operator: 'equals', value: 'R1' }
        ],
        assignArchetype: 'RES_A1_01.json',
        priority: 50,
        enabled: true
      },
      {
        id: 'rule2',
        type: 'builder',
        logic: 'all',
        conditions: [
          { field: 'height', operator: 'gte', value: 20 }
        ],
        assignArchetype: 'RES_A2_01.json',
          priority: 100,
          enabled: true
        },
      {
        id: 'rule3',
        type: 'builder',
        logic: 'all',
        conditions: [
          { field: 'material', operator: 'equals', value: 'steel' }
        ],
        assignArchetype: 'COM_B1_01.json',
          priority: 75,
          enabled: true
        }
    ];

    it('should return highest priority matching rule', () => {
      const result = findMatchingRule(rules, features[1]); // zone: R2, height: 25, material: steel
      expect(result?.id).toBe('rule2'); // height >= 20 has priority 100
    });

    it('should use array order as tie-breaker', () => {
      const tiedRules: Rule[] = [
        {
          id: 'rule1',
          type: 'builder',
          logic: 'all',
          conditions: [
            { field: 'zone', operator: 'equals', value: 'R1' }
          ],
          assignArchetype: 'RES_A1_01.json',
          priority: 50,
          enabled: true
        },
        {
          id: 'rule2',
          type: 'builder',
          logic: 'all',
          conditions: [
            { field: 'zone', operator: 'equals', value: 'R1' }
          ],
          assignArchetype: 'RES_A2_01.json',
        priority: 50, // Same priority
        enabled: true
      }
      ];

      const result = findMatchingRule(tiedRules, features[0]);
      expect(result?.id).toBe('rule1'); // First in array wins
    });

    it('should return null when no rules match', () => {
      const result = findMatchingRule(rules, { id: 'nomatch', zone: 'X1', height: 5 });
      expect(result).toBe(null);
    });
  });

  describe('evaluateFeatures', () => {
    const features: Feature[] = [
      { id: 'feat1', zone: 'R1', height: 15 },
      { id: 'feat2', zone: 'R2', height: 25 },
      { id: 'feat3', zone: 'C1', height: 30 }
    ];

    const rules: Rule[] = [
      {
        id: 'rule1',
        type: 'builder',
        logic: 'all',
        conditions: [
          { field: 'zone', operator: 'in', value: ['R1', 'R2'] }
        ],
        assignArchetype: 'RES_A1_01.json',
          priority: 100,
          enabled: true
        },
      {
        id: 'rule2',
        type: 'builder',
        logic: 'all',
        conditions: [
          { field: 'zone', operator: 'equals', value: 'C1' }
        ],
        assignArchetype: 'COM_B1_01.json',
        priority: 50,
        enabled: true
      }
    ];

    it('should evaluate all features and return assignments', () => {
      const assignments = evaluateFeatures(rules, features);
      
      expect(assignments.size).toBe(3);
      expect(assignments.get('feat1')).toBe('RES_A1_01.json');
      expect(assignments.get('feat2')).toBe('RES_A1_01.json');
      expect(assignments.get('feat3')).toBe('COM_B1_01.json');
    });
  });
});


import { z } from 'zod';

// Operator types
export const OperatorSchema = z.enum([
  'equals',
  'notEquals',
  'contains',
  'notContains',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'notIn',
  'isEmpty',
  'isNotEmpty'
]);

// Value types
export const ValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.array(z.number()),
  z.null()
]);

// Condition schema
export const ConditionSchema = z.object({
  field: z.string(),
  operator: OperatorSchema,
  value: ValueSchema
});

// Rule logic types
export const LogicSchema = z.enum(['any', 'all', 'none']);

// Rule type
export const RuleTypeSchema = z.enum(['builder', 'custom']);

// Rule schema
export const RuleSchema = z.object({
  id: z.string(),
  type: RuleTypeSchema,
  logic: LogicSchema,
  conditions: z.array(ConditionSchema).default([]),
  assignArchetype: z.string(),
  priority: z.number().default(99),
  formula: z.string().optional(),
  name: z.string().optional(), // User-defined rule name
  enabled: z.boolean().default(true) // Rule enabled/disabled state
});

// Settings schema
export const SettingsSchema = z.object({
  featuresGroupLevel1: z.string().optional(),
  featuresGroupLevel2: z.string().optional(),
  colorMap: z.enum(['Accent', 'Set1']).default('Accent'),
  templateGrouped: z.boolean().default(false)
});

// Ruleset schema
export const RulesetSchema = z.object({
  rules: z.array(RuleSchema).default([]),
  settings: SettingsSchema,
  archetypeOptions: z.array(z.string()).default([])
});

// Feature record schema
export const FeatureSchema = z.object({
  id: z.string(),
}).and(z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])));

// Type exports
export type Operator = z.infer<typeof OperatorSchema>;
export type Value = z.infer<typeof ValueSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type Logic = z.infer<typeof LogicSchema>;
export type RuleType = z.infer<typeof RuleTypeSchema>;
export type Rule = z.infer<typeof RuleSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type Ruleset = z.infer<typeof RulesetSchema>;
export type Feature = z.infer<typeof FeatureSchema>;

// Helper function to create a new rule
export function createRule(overrides: Partial<Rule> = {}): Rule {
  return {
    id: crypto.randomUUID(),
    type: 'builder',
    logic: 'all',
    conditions: [],
    assignArchetype: '',
    priority: 99,
    name: '', // Default empty name
    enabled: true, // Default enabled
    ...overrides
  };
}

// Helper function to create a new condition
export function createCondition(overrides: Partial<Condition> = {}): Condition {
  return {
    field: '',
    operator: 'equals',
    value: null,
    ...overrides
  };
}

// Helper function to create default ruleset
export function createDefaultRuleset(): Ruleset {
  return {
    rules: [createRule({
      conditions: [
        {
          field: 'zone',
          operator: 'in',
          value: ['R1', 'R2', 'R3']
        }
      ],
      assignArchetype: 'RES_A1_01.json'
    })],
    settings: {
      colorMap: 'Accent',
      templateGrouped: false,
      featuresGroupLevel1: 'zone'
    },
    archetypeOptions: []
  };
}

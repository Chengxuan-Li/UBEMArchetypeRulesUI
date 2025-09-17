import { create } from 'zustand';
import { Ruleset, Feature, Rule, createDefaultRuleset } from './schemas';
import { SAMPLE_FEATURES, SAMPLE_ARCHETYPE_OPTIONS } from './sample-data';
import { autoSave } from './storage';

interface AppState {
  // Data
  ruleset: Ruleset;
  features: Feature[];
  
  // UI state
  selectedRuleId: string | null;
  isEditingRule: boolean;
  
  // Actions
  updateRuleset: (ruleset: Ruleset) => void;
  updateRules: (rules: Rule[]) => void;
  addRule: () => void;
  updateRule: (ruleId: string, updates: Partial<Rule>) => void;
  deleteRule: (ruleId: string) => void;
  duplicateRule: (ruleId: string) => void;
  moveRule: (fromIndex: number, toIndex: number) => void;
  
  updateSettings: (settings: Partial<Ruleset['settings']>) => void;
  updateArchetypeOptions: (options: string[]) => void;
  
  updateFeatures: (features: Feature[]) => void;
  addFeatures: (features: Feature[]) => void;
  clearFeatures: () => void;
  
  selectRule: (ruleId: string | null) => void;
  setEditingRule: (editing: boolean) => void;
  
  resetRuleset: () => void;
  loadSampleData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  ruleset: createDefaultRuleset(),
  features: [],
  selectedRuleId: null,
  isEditingRule: false,
  
  // Ruleset actions
  updateRuleset: (ruleset) => {
    set({ ruleset });
    autoSave(ruleset);
  },
  
  updateRules: (rules) => {
    const { ruleset } = get();
    const updatedRuleset = { ...ruleset, rules };
    set({ ruleset: updatedRuleset });
    autoSave(updatedRuleset);
  },
  
  addRule: () => {
    const { ruleset } = get();
    const newRule = {
      id: crypto.randomUUID(),
      type: 'builder' as const,
      logic: 'all' as const,
      conditions: [],
      assignArchetype: '',
      priority: 99,
      enabled: true
    };
    const updatedRules = [...ruleset.rules, newRule];
    const updatedRuleset = { ...ruleset, rules: updatedRules };
    set({ 
      ruleset: updatedRuleset,
      selectedRuleId: newRule.id,
      isEditingRule: true
    });
    autoSave(updatedRuleset);
  },
  
  updateRule: (ruleId, updates) => {
    const { ruleset } = get();
    const updatedRules = ruleset.rules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    const updatedRuleset = { ...ruleset, rules: updatedRules };
    set({ ruleset: updatedRuleset });
    autoSave(updatedRuleset);
  },
  
  deleteRule: (ruleId) => {
    const { ruleset } = get();
    if (ruleset.rules.length <= 1) return; // Don't delete the last rule
    
    const updatedRules = ruleset.rules.filter(rule => rule.id !== ruleId);
    const updatedRuleset = { ...ruleset, rules: updatedRules };
    set({ 
      ruleset: updatedRuleset,
      selectedRuleId: updatedRules.length > 0 ? updatedRules[0].id : null
    });
    autoSave(updatedRuleset);
  },
  
  duplicateRule: (ruleId) => {
    const { ruleset } = get();
    const ruleToDuplicate = ruleset.rules.find(rule => rule.id === ruleId);
    if (!ruleToDuplicate) return;
    
    const duplicatedRule = {
      ...ruleToDuplicate,
      id: crypto.randomUUID()
    };
    const updatedRules = [...ruleset.rules, duplicatedRule];
    const updatedRuleset = { ...ruleset, rules: updatedRules };
    set({ 
      ruleset: updatedRuleset,
      selectedRuleId: duplicatedRule.id
    });
    autoSave(updatedRuleset);
  },
  
  moveRule: (fromIndex, toIndex) => {
    const { ruleset } = get();
    const updatedRules = [...ruleset.rules];
    const [movedRule] = updatedRules.splice(fromIndex, 1);
    updatedRules.splice(toIndex, 0, movedRule);
    
    const updatedRuleset = { ...ruleset, rules: updatedRules };
    set({ ruleset: updatedRuleset });
    autoSave(updatedRuleset);
  },
  
  updateSettings: (settings) => {
    const { ruleset } = get();
    const updatedSettings = { ...ruleset.settings, ...settings };
    const updatedRuleset = { ...ruleset, settings: updatedSettings };
    set({ ruleset: updatedRuleset });
    autoSave(updatedRuleset);
  },
  
  updateArchetypeOptions: (options) => {
    const { ruleset } = get();
    const updatedRuleset = { ...ruleset, archetypeOptions: options };
    set({ ruleset: updatedRuleset });
    autoSave(updatedRuleset);
  },
  
  updateFeatures: (features) => {
    set({ features });
  },
  
  addFeatures: (newFeatures) => {
    const { features } = get();
    const combinedFeatures = [...features, ...newFeatures];
    set({ features: combinedFeatures });
  },
  
  clearFeatures: () => {
    set({ features: [] });
  },
  
  selectRule: (ruleId) => {
    set({ selectedRuleId: ruleId });
  },
  
  setEditingRule: (editing) => {
    set({ isEditingRule: editing });
  },
  
  resetRuleset: () => {
    const defaultRuleset = createDefaultRuleset();
    set({ 
      ruleset: defaultRuleset,
      selectedRuleId: defaultRuleset.rules[0]?.id || null
    });
    autoSave(defaultRuleset);
  },
  
  loadSampleData: () => {
    const { ruleset } = get();
    const updatedRuleset = {
      ...ruleset,
      archetypeOptions: SAMPLE_ARCHETYPE_OPTIONS
    };
    set({ 
      features: SAMPLE_FEATURES,
      ruleset: updatedRuleset
    });
    autoSave(updatedRuleset);
  }
}));


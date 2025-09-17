// Archetype hierarchy utilities for AAAA_BB_CC.json format

export interface ArchetypeGroup {
  groupKey: string; // AAAA
  children: string[]; // ["AAAA_BB_CC.json", "AAAA_DD_EE.json", ...]
}

export interface ArchetypeHierarchy {
  groups: Map<string, ArchetypeGroup>;
  allArchetypes: string[];
}

// Parse archetype filename to extract group key
export function extractGroupKey(archetypeName: string): string {
  // Expected format: AAAA_BB_CC.json
  const parts = archetypeName.split('_');
  if (parts.length >= 1) {
    return parts[0];
  }
  return archetypeName; // Fallback for non-standard names
}

// Build hierarchy from archetype list
export function buildArchetypeHierarchy(archetypeOptions: string[]): ArchetypeHierarchy {
  const groups = new Map<string, ArchetypeGroup>();
  const allArchetypes = [...archetypeOptions];

  for (const archetype of archetypeOptions) {
    const groupKey = extractGroupKey(archetype);
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        groupKey,
        children: []
      });
    }
    
    groups.get(groupKey)!.children.push(archetype);
  }

  // Sort children within each group
  for (const group of groups.values()) {
    group.children.sort();
  }

  return {
    groups,
    allArchetypes
  };
}

// Get group options for dropdown (with hierarchy)
export function getGroupOptions(hierarchy: ArchetypeHierarchy): Array<{
  value: string;
  label: string;
  options?: Array<{ value: string; label: string }>;
}> {
  const groupOptions: Array<{
    value: string;
    label: string;
    options?: Array<{ value: string; label: string }>;
  }> = [];

  // Sort groups by key
  const sortedGroups = Array.from(hierarchy.groups.entries()).sort(([a], [b]) => a.localeCompare(b));

  for (const [groupKey, group] of sortedGroups) {
    if (group.children.length === 1) {
      // Single child - show directly
      groupOptions.push({
        value: group.children[0],
        label: `${groupKey} - ${group.children[0].replace(/\.json$/, '')}`
      });
    } else {
      // Multiple children - group them
      const childOptions = group.children.map(child => ({
        value: child,
        label: child.replace(/\.json$/, '')
      }));

      groupOptions.push({
        value: groupKey,
        label: groupKey,
        options: childOptions
      });
    }
  }

  return groupOptions;
}

// Find archetype group by archetype name
export function findArchetypeGroup(hierarchy: ArchetypeHierarchy, archetypeName: string): string | null {
  const groupKey = extractGroupKey(archetypeName);
  return hierarchy.groups.has(groupKey) ? groupKey : null;
}

// Get all archetypes in a group
export function getArchetypesInGroup(hierarchy: ArchetypeHierarchy, groupKey: string): string[] {
  return hierarchy.groups.get(groupKey)?.children || [];
}

// Validate archetype name format
export function validateArchetypeName(name: string): { valid: boolean; error?: string } {
  if (!name.trim()) {
    return { valid: false, error: 'Archetype name cannot be empty' };
  }

  if (!name.endsWith('.json')) {
    return { valid: false, error: 'Archetype name must end with .json' };
  }

  // Check for valid characters (alphanumeric, underscore, hyphen)
  if (!/^[a-zA-Z0-9_-]+\.json$/.test(name)) {
    return { valid: false, error: 'Archetype name can only contain letters, numbers, underscores, and hyphens' };
  }

  return { valid: true };
}

// Parse archetype options from text input
export function parseArchetypeOptions(input: string): { options: string[]; errors: string[] } {
  const errors: string[] = [];
  const options: string[] = [];

  // Split by lines and clean up
  const lines = input
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  for (const line of lines) {
    const validation = validateArchetypeName(line);
    if (validation.valid) {
      options.push(line);
    } else {
      errors.push(`"${line}": ${validation.error}`);
    }
  }

  return { options, errors };
}

// Sample archetype options for testing
export const SAMPLE_ARCHETYPE_OPTIONS = [
  'RES_A1_01.json',
  'RES_A1_02.json',
  'RES_A1_03.json',
  'RES_A2_01.json',
  'RES_A2_02.json',
  'COM_B1_01.json',
  'COM_B1_02.json',
  'COM_B2_01.json',
  'COM_B2_02.json',
  'COM_B3_01.json',
  'IND_C1_01.json',
  'IND_C1_02.json',
  'IND_C2_01.json',
  'OFF_D1_01.json',
  'OFF_D1_02.json',
  'OFF_D2_01.json'
];


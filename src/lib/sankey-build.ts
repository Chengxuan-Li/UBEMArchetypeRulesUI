import { newPlot } from 'plotly.js-dist-min';
import { Feature, Settings } from './schemas';
import { evaluateFeatures } from './rules-engine';
import { evaluateFormula } from './formula-eval';
import { findArchetypeGroup } from './archetype-hierarchy';

export interface SankeyNode {
  id: string;
  label: string;
  color: string;
  group?: string;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
  color?: string;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// Color palettes
const COLOR_PALETTES = {
  Accent: [
    '#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', 
    '#f0027f', '#bf5b17', '#666666', '#1b9e77', '#d95f02'
  ],
  Set1: [
    '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00',
    '#ffff33', '#a65628', '#f781bf', '#999999', '#66c2a5'
  ]
};

// Get color for a node based on group and index
function getNodeColor(group: string, index: number, colorMap: 'Accent' | 'Set1' = 'Accent'): string {
  const palette = COLOR_PALETTES[colorMap];
  
  // For feature groups, use consistent colors within each group
  if (group === 'feature') {
    const colorIndex = index % palette.length;
    return palette[colorIndex];
  }
  
  // For archetype groups, use similar colors within each template group
  if (group === 'archetype') {
    const colorIndex = index % palette.length;
    const baseColor = palette[colorIndex];
    
    // Vary lightness slightly for different archetypes in the same group
    const rgb = hexToRgb(baseColor);
    if (rgb) {
      const lightness = 0.8 + (index % 3) * 0.1; // Subtle variation
      return rgbToHex(
        Math.round(rgb.r * lightness),
        Math.round(rgb.g * lightness),
        Math.round(rgb.b * lightness)
      );
    }
  }
  
  // Fallback
  const colorIndex = index % palette.length;
  return palette[colorIndex];
}

// Helper functions for color manipulation
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Group features by specified field(s)
function groupFeatures(
  features: Feature[], 
  level1Field?: string, 
  level2Field?: string
): Map<string, Feature[]> {
  const groups = new Map<string, Feature[]>();
  
  for (const feature of features) {
    let groupKey = 'All Features';
    
    if (level1Field && feature[level1Field]) {
      groupKey = String(feature[level1Field]);
      
      if (level2Field && feature[level2Field]) {
        groupKey += ` - ${String(feature[level2Field])}`;
      }
    }
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    
    groups.get(groupKey)!.push(feature);
  }
  
  return groups;
}

// Build Sankey diagram data
export function buildSankeyData(
  features: Feature[],
  rules: any[],
  settings: Settings,
  archetypeOptions: string[]
): SankeyData {
  console.log('buildSankeyData called with:', {
    featuresCount: features.length,
    rulesCount: rules.length,
    archetypeOptionsCount: archetypeOptions.length,
    settings
  });

  if (features.length === 0) {
    console.log('No features provided');
    return { nodes: [], links: [] };
  }

  // Evaluate features against rules
  const assignments = evaluateFeatures(rules, features, evaluateFormula);
  console.log('Feature assignments:', assignments);
  
  // Group features by settings
  const featureGroups = groupFeatures(
    features, 
    settings.featuresGroupLevel1, 
    settings.featuresGroupLevel2
  );
  
  // Build nodes
  const nodes: SankeyNode[] = [];
  const nodeIndexMap = new Map<string, number>();
  
  // Add feature group nodes (left side)
  let nodeIndex = 0;
  for (const [groupName, groupFeatures] of featureGroups) {
    const nodeId = `feature_${groupName}`;
    nodes.push({
      id: nodeId,
      label: `${groupName} (${groupFeatures.length})`,
      color: getNodeColor('feature', nodeIndex, settings.colorMap),
      group: 'feature'
    });
    nodeIndexMap.set(nodeId, nodeIndex++);
  }
  
  // Add archetype nodes (right side)
  const archetypeGroups = new Map<string, string[]>();
  
  for (const archetype of archetypeOptions) {
    const groupKey = findArchetypeGroup(
      { groups: new Map(), allArchetypes: archetypeOptions }, 
      archetype
    );
    
    if (settings.templateGrouped && groupKey) {
      if (!archetypeGroups.has(groupKey)) {
        archetypeGroups.set(groupKey, []);
      }
      archetypeGroups.get(groupKey)!.push(archetype);
    } else {
      archetypeGroups.set(archetype, [archetype]);
    }
  }
  
  // Add "Unassigned" node
  const unassignedCount = features.length - assignments.size;
  if (unassignedCount > 0) {
    const unassignedNodeId = 'archetype_unassigned';
    nodes.push({
      id: unassignedNodeId,
      label: `Unassigned (${unassignedCount})`,
      color: '#cccccc', // Gray color for unassigned
      group: 'archetype'
    });
    nodeIndexMap.set(unassignedNodeId, nodeIndex++);
  }
  
  const archetypeGroupIndex = nodeIndex;
  for (const [groupName, archetypes] of archetypeGroups) {
    const nodeId = `archetype_${groupName}`;
    const assignedCount = Array.from(assignments.values()).filter(
      archetype => settings.templateGrouped ? 
        archetypes.includes(archetype) : 
        archetype === groupName
    ).length;
    
    if (assignedCount > 0) { // Only show archetype groups that have assignments
      nodes.push({
        id: nodeId,
        label: `${groupName.replace(/\.json$/, '')} (${assignedCount})`,
        color: getNodeColor('archetype', nodeIndex - archetypeGroupIndex, settings.colorMap),
        group: 'archetype'
      });
      nodeIndexMap.set(nodeId, nodeIndex++);
    }
  }
  
  // Build links
  const links: SankeyLink[] = [];
  const linkCounts = new Map<string, number>();
  
  for (const [featureGroupName, groupFeatures] of featureGroups) {
    for (const feature of groupFeatures) {
      const assignedArchetype = assignments.get(feature.id);
      const featureNodeId = `feature_${featureGroupName}`;
      let archetypeNodeId: string;
      
      if (assignedArchetype) {
        // Feature is assigned to an archetype
        if (settings.templateGrouped) {
          const groupKey = findArchetypeGroup(
            { groups: new Map(), allArchetypes: archetypeOptions }, 
            assignedArchetype
          );
          archetypeNodeId = `archetype_${groupKey || assignedArchetype}`;
        } else {
          archetypeNodeId = `archetype_${assignedArchetype}`;
        }
      } else {
        // Feature is unassigned
        archetypeNodeId = 'archetype_unassigned';
      }
      
      const linkKey = `${featureNodeId}->${archetypeNodeId}`;
      linkCounts.set(linkKey, (linkCounts.get(linkKey) || 0) + 1);
    }
  }
  
  // Convert link counts to links
  for (const [linkKey, count] of linkCounts) {
    const [sourceId, targetId] = linkKey.split('->');
    const sourceIndex = nodeIndexMap.get(sourceId);
    const targetIndex = nodeIndexMap.get(targetId);
    
    if (sourceIndex !== undefined && targetIndex !== undefined) {
      links.push({
        source: sourceIndex,
        target: targetIndex,
        value: count,
        color: `rgba(0,0,0,0.3)`
      });
    }
  }
  
  return { nodes, links };
}

// Create Plotly Sankey trace
export function createSankeyTrace(data: SankeyData): any {
  return {
    type: 'sankey',
    orientation: 'h',
    node: {
      pad: 15,
      thickness: 20,
      line: {
        color: 'black',
        width: 0.5
      },
      label: data.nodes.map(node => node.label),
      color: data.nodes.map(node => node.color)
    },
    link: {
      source: data.links.map(link => link.source),
      target: data.links.map(link => link.target),
      value: data.links.map(link => link.value),
      color: data.links.map(link => link.color || 'rgba(0,0,0,0.3)')
    }
  };
}

// Get Sankey layout configuration
export function getSankeyLayout(title: string = 'Feature to Archetype Assignment'): any {
  return {
    title: {
      text: title,
      font: { size: 16 }
    },
    font: { size: 12 },
    width: undefined,
    height: 600,
    margin: {
      l: 50,
      r: 50,
      t: 50,
      b: 50
    }
  };
}

// Render Sankey diagram
export function renderSankey(
  containerId: string,
  features: Feature[],
  rules: any[],
  settings: Settings,
  archetypeOptions: string[]
): void {
  try {
    const data = buildSankeyData(features, rules, settings, archetypeOptions);
    
    if (data.nodes.length === 0 || data.links.length === 0) {
      console.warn('No data to display in Sankey diagram');
      return;
    }
    
    const trace = createSankeyTrace(data);
    const layout = getSankeyLayout();
    
    // Use Plotly.newPlot for better compatibility
    newPlot(containerId, [trace], layout, { 
      responsive: true,
      displayModeBar: true,
      displaylogo: false
    });
    
    console.log('Sankey diagram rendered successfully', { 
      nodes: data.nodes.length, 
      links: data.links.length 
    });
  } catch (error) {
    console.error('Error rendering Sankey diagram:', error);
  }
}

// Get statistics about the Sankey data
export function getSankeyStats(
  features: Feature[],
  rules: any[],
  _settings: Settings,
  _archetypeOptions: string[]
): {
  totalFeatures: number;
  assignedFeatures: number;
  unassignedFeatures: number;
  assignmentRate: number;
  archetypeDistribution: Record<string, number>;
} {
  const assignments = evaluateFeatures(rules, features, evaluateFormula);
  
  const totalFeatures = features.length;
  const assignedFeatures = assignments.size;
  const unassignedFeatures = totalFeatures - assignedFeatures;
  const assignmentRate = totalFeatures > 0 ? assignedFeatures / totalFeatures : 0;
  
  const archetypeDistribution: Record<string, number> = {};
  for (const archetype of assignments.values()) {
    archetypeDistribution[archetype] = (archetypeDistribution[archetype] || 0) + 1;
  }
  
  return {
    totalFeatures,
    assignedFeatures,
    unassignedFeatures,
    assignmentRate,
    archetypeDistribution
  };
}

import { Feature } from './schemas';

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

// Sample feature data for testing and demonstration
export const SAMPLE_FEATURES: Feature[] = [
  // Residential buildings
  { id: 'feat_001', zone: 'R1', type: 'single_family', height: 8, floors: 2, material: 'wood', roofType: 'gable' },
  { id: 'feat_002', zone: 'R1', type: 'single_family', height: 10, floors: 2, material: 'wood', roofType: 'hip' },
  { id: 'feat_003', zone: 'R1', type: 'multi_family', height: 15, floors: 3, material: 'concrete', roofType: 'flat' },
  { id: 'feat_004', zone: 'R1', type: 'multi_family', height: 18, floors: 4, material: 'concrete', roofType: 'flat' },
  { id: 'feat_005', zone: 'R2', type: 'single_family', height: 12, floors: 2, material: 'wood', roofType: 'gable' },
  { id: 'feat_006', zone: 'R2', type: 'multi_family', height: 20, floors: 4, material: 'steel', roofType: 'flat' },
  { id: 'feat_007', zone: 'R2', type: 'multi_family', height: 25, floors: 5, material: 'concrete', roofType: 'flat' },
  { id: 'feat_008', zone: 'R3', type: 'multi_family', height: 30, floors: 6, material: 'steel', roofType: 'flat' },
  { id: 'feat_009', zone: 'R3', type: 'multi_family', height: 35, floors: 7, material: 'concrete', roofType: 'flat' },
  { id: 'feat_010', zone: 'R3', type: 'multi_family', height: 40, floors: 8, material: 'concrete', roofType: 'flat' },

  // Commercial buildings
  { id: 'feat_011', zone: 'C1', type: 'retail', height: 15, floors: 2, material: 'steel', roofType: 'flat' },
  { id: 'feat_012', zone: 'C1', type: 'retail', height: 18, floors: 2, material: 'steel', roofType: 'shed' },
  { id: 'feat_013', zone: 'C1', type: 'restaurant', height: 12, floors: 1, material: 'steel', roofType: 'flat' },
  { id: 'feat_014', zone: 'C1', type: 'restaurant', height: 15, floors: 2, material: 'steel', roofType: 'flat' },
  { id: 'feat_015', zone: 'C2', type: 'retail', height: 25, floors: 3, material: 'concrete', roofType: 'flat' },
  { id: 'feat_016', zone: 'C2', type: 'retail', height: 30, floors: 4, material: 'concrete', roofType: 'flat' },
  { id: 'feat_017', zone: 'C2', type: 'office', height: 45, floors: 8, material: 'steel', roofType: 'flat' },
  { id: 'feat_018', zone: 'C2', type: 'office', height: 50, floors: 10, material: 'steel', roofType: 'flat' },
  { id: 'feat_019', zone: 'C3', type: 'office', height: 60, floors: 12, material: 'steel', roofType: 'flat' },
  { id: 'feat_020', zone: 'C3', type: 'office', height: 70, floors: 14, material: 'steel', roofType: 'flat' },

  // Industrial buildings
  { id: 'feat_021', zone: 'M1', type: 'warehouse', height: 20, floors: 1, material: 'steel', roofType: 'shed' },
  { id: 'feat_022', zone: 'M1', type: 'warehouse', height: 25, floors: 1, material: 'steel', roofType: 'flat' },
  { id: 'feat_023', zone: 'M1', type: 'manufacturing', height: 30, floors: 2, material: 'steel', roofType: 'shed' },
  { id: 'feat_024', zone: 'M1', type: 'manufacturing', height: 35, floors: 2, material: 'concrete', roofType: 'flat' },
  { id: 'feat_025', zone: 'M2', type: 'warehouse', height: 40, floors: 2, material: 'steel', roofType: 'flat' },
  { id: 'feat_026', zone: 'M2', type: 'manufacturing', height: 45, floors: 3, material: 'steel', roofType: 'flat' },
  { id: 'feat_027', zone: 'M2', type: 'manufacturing', height: 50, floors: 4, material: 'concrete', roofType: 'flat' },
  { id: 'feat_028', zone: 'M3', type: 'manufacturing', height: 60, floors: 5, material: 'steel', roofType: 'flat' },
  { id: 'feat_029', zone: 'M3', type: 'manufacturing', height: 65, floors: 6, material: 'steel', roofType: 'flat' },
  { id: 'feat_030', zone: 'M3', type: 'warehouse', height: 35, floors: 3, material: 'concrete', roofType: 'flat' },

  // Mixed-use buildings
  { id: 'feat_031', zone: 'MX1', type: 'mixed', height: 40, floors: 8, material: 'steel', roofType: 'flat' },
  { id: 'feat_032', zone: 'MX1', type: 'mixed', height: 45, floors: 9, material: 'steel', roofType: 'flat' },
  { id: 'feat_033', zone: 'MX2', type: 'mixed', height: 50, floors: 10, material: 'concrete', roofType: 'flat' },
  { id: 'feat_034', zone: 'MX2', type: 'mixed', height: 55, floors: 11, material: 'concrete', roofType: 'flat' },
  { id: 'feat_035', zone: 'MX3', type: 'mixed', height: 60, floors: 12, material: 'steel', roofType: 'flat' },

  // Special cases
  { id: 'feat_036', zone: 'R1', type: 'single_family', height: 6, floors: 1, material: 'wood', roofType: 'gable' },
  { id: 'feat_037', zone: 'C1', type: 'retail', height: 8, floors: 1, material: 'wood', roofType: 'hip' },
  { id: 'feat_038', zone: 'M1', type: 'warehouse', height: 15, floors: 1, material: 'wood', roofType: 'shed' },
  { id: 'feat_039', zone: 'R2', type: 'multi_family', height: 50, floors: 10, material: 'steel', roofType: 'flat' },
  { id: 'feat_040', zone: 'C3', type: 'office', height: 80, floors: 16, material: 'steel', roofType: 'flat' }
];

// Field metadata for UI
export const FIELD_METADATA = {
  zone: {
    label: 'Zone',
    type: 'categorical' as const,
    options: ['R1', 'R2', 'R3', 'C1', 'C2', 'C3', 'M1', 'M2', 'M3', 'MX1', 'MX2', 'MX3']
  },
  type: {
    label: 'Building Type',
    type: 'categorical' as const,
    options: ['single_family', 'multi_family', 'retail', 'restaurant', 'office', 'warehouse', 'manufacturing', 'mixed']
  },
  height: {
    label: 'Height (m)',
    type: 'numeric' as const,
    min: 0,
    max: 100
  },
  floors: {
    label: 'Number of Floors',
    type: 'numeric' as const,
    min: 1,
    max: 20
  },
  material: {
    label: 'Material',
    type: 'categorical' as const,
    options: ['wood', 'steel', 'concrete']
  },
  roofType: {
    label: 'Roof Type',
    type: 'categorical' as const,
    options: ['flat', 'gable', 'hip', 'shed']
  }
};

// Helper function to get field type
export function getFieldType(fieldName: string): 'string' | 'number' | 'boolean' | 'mixed' {
  const metadata = FIELD_METADATA[fieldName as keyof typeof FIELD_METADATA];
  if (metadata) {
    return metadata.type === 'categorical' ? 'string' : 'number';
  }
  return 'mixed';
}

// Helper function to get field options
export function getFieldOptions(fieldName: string): string[] | undefined {
  const metadata = FIELD_METADATA[fieldName as keyof typeof FIELD_METADATA];
  return metadata?.type === 'categorical' ? metadata.options : undefined;
}

// Helper function to generate random features for testing
export function generateRandomFeatures(count: number): Feature[] {
  const features: Feature[] = [];
  const zones = ['R1', 'R2', 'R3', 'C1', 'C2', 'C3', 'M1', 'M2', 'M3'];
  const types = ['residential', 'commercial', 'industrial', 'mixed'];
  const materials = ['wood', 'steel', 'concrete'];
  const roofTypes = ['flat', 'gable', 'hip', 'shed'];

  for (let i = 0; i < count; i++) {
    const height = Math.floor(Math.random() * 80) + 5;
    const floors = Math.floor(height / 4) + 1;
    
    features.push({
      id: `random_${i + 1}`,
      zone: zones[Math.floor(Math.random() * zones.length)],
      type: types[Math.floor(Math.random() * types.length)],
      height,
      floors,
      material: materials[Math.floor(Math.random() * materials.length)],
      roofType: roofTypes[Math.floor(Math.random() * roofTypes.length)]
    });
  }

  return features;
}

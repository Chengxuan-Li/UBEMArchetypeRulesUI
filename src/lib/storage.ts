import { Ruleset } from './schemas';

const STORAGE_KEYS = {
  RULESET: 'ubem_ruleset',
  FEATURES: 'ubem_features',
  SETTINGS: 'ubem_settings'
};

// Generic storage functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Failed to parse stored data for key ${key}:`, error);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to store data for key ${key}:`, error);
  }
}

function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove data for key ${key}:`, error);
  }
}

// Ruleset storage
export function saveRuleset(ruleset: Ruleset): void {
  setToStorage(STORAGE_KEYS.RULESET, ruleset);
}

export function loadRuleset(): Ruleset | null {
  return getFromStorage<Ruleset | null>(STORAGE_KEYS.RULESET, null);
}

export function clearRuleset(): void {
  removeFromStorage(STORAGE_KEYS.RULESET);
}

// Features storage
export function saveFeatures(features: any[]): void {
  setToStorage(STORAGE_KEYS.FEATURES, features);
}

export function loadFeatures(): any[] {
  return getFromStorage<any[]>(STORAGE_KEYS.FEATURES, []);
}

export function clearFeatures(): void {
  removeFromStorage(STORAGE_KEYS.FEATURES);
}

// Settings storage (legacy support)
export function saveSettings(settings: any): void {
  setToStorage(STORAGE_KEYS.SETTINGS, settings);
}

export function loadSettings(): any {
  return getFromStorage(STORAGE_KEYS.SETTINGS, null);
}

export function clearSettings(): void {
  removeFromStorage(STORAGE_KEYS.SETTINGS);
}

// Clear all data
export function clearAllData(): void {
  clearRuleset();
  clearFeatures();
  clearSettings();
}

// Import/Export functions
export function exportRulesetToFile(ruleset: Ruleset, filename?: string): void {
  const dataStr = JSON.stringify(ruleset, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = filename || `ubem-ruleset-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(link.href);
}

export function importRulesetFromFile(file: File): Promise<Ruleset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const ruleset = JSON.parse(content);
        
        // Validate the imported data structure
        if (!ruleset.rules || !Array.isArray(ruleset.rules)) {
          throw new Error('Invalid ruleset format: missing or invalid rules array');
        }
        
        if (!ruleset.settings || typeof ruleset.settings !== 'object') {
          throw new Error('Invalid ruleset format: missing or invalid settings object');
        }
        
        resolve(ruleset as Ruleset);
      } catch (error) {
        reject(new Error(`Failed to parse ruleset file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

export function importFeaturesFromFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const features = JSON.parse(content);
        
        // Validate the imported data structure
        if (!Array.isArray(features)) {
          throw new Error('Features file must contain an array of feature objects');
        }
        
        // Validate each feature has an id
        for (const feature of features) {
          if (!feature.id || typeof feature.id !== 'string') {
            throw new Error('Each feature must have a valid id field');
          }
        }
        
        resolve(features);
      } catch (error) {
        reject(new Error(`Failed to parse features file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

// Auto-save functionality
let autoSaveTimeout: NodeJS.Timeout | null = null;

export function autoSave(ruleset: Ruleset, delay: number = 1000): void {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  autoSaveTimeout = setTimeout(() => {
    saveRuleset(ruleset);
  }, delay);
}

// Get storage usage info
export function getStorageInfo(): {
  used: number;
  available: number;
  percentage: number;
} {
  try {
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // Estimate available space (most browsers limit to ~5-10MB)
    const available = 5 * 1024 * 1024; // 5MB estimate
    const percentage = (used / available) * 100;
    
    return { used, available, percentage };
  } catch (error) {
    return { used: 0, available: 0, percentage: 0 };
  }
}

// Check if storage is available
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}


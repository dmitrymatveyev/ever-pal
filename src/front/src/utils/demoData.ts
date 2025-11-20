import type { Pet } from '../services/petService';
import type { HealthLog } from '../services/healthLogService';

const DEMO_MODE_KEY = 'demo_mode_active';

/**
 * Demo pet data
 */
export const DEMO_PET: Pet = {
  id: 'demo-pet-id',
  ownerId: 'demo-user',
  name: 'Luna',
  breed: 'Norwegian Forest Cat',
  age: 4,
  weight: 5.5,
  photoBase64: undefined,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  updatedAt: new Date().toISOString()
};

/**
 * Demo health log entries - realistic examples showcasing different features
 */
export const DEMO_HEALTH_LOGS: HealthLog[] = [
  {
    id: 'log-1',
    petId: 'demo-pet-id',
    entryText: 'Ate all her breakfast and played with toys for 20 minutes',
    tags: [
      { id: 'tag-good-appetite', label: 'Good appetite', icon: '🍽️', category: 'appetite' },
      { id: 'tag-active', label: 'Active', icon: '🐾', category: 'energy' }
    ],
    loggedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-2',
    petId: 'demo-pet-id',
    entryText: 'Only ate half of dinner. Might be the new food brand?',
    tags: [
      { id: 'tag-tired', label: 'Tired', icon: '😴', category: 'energy' },
      { id: 'tag-picky-eater', label: 'Picky eater', icon: '🥘', category: 'appetite' }
    ],
    loggedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // Yesterday evening
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-3',
    petId: 'demo-pet-id',
    entryText: 'Vomited after eating. Switching back to old food. Vet appointment scheduled for Friday.',
    tags: [],
    loggedAt: new Date(Date.now() - 42 * 60 * 60 * 1000).toISOString(), // 2 days ago morning
    createdAt: new Date(Date.now() - 42 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 42 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-4',
    petId: 'demo-pet-id',
    entryText: 'Back to normal! Old food works better.',
    tags: [
      { id: 'tag-playful', label: 'Playful', icon: '😊', category: 'mood' },
      { id: 'tag-energetic', label: 'Energetic', icon: '⚡', category: 'energy' },
      { id: 'tag-good-appetite', label: 'Good appetite', icon: '🍽️', category: 'appetite' }
    ],
    loggedAt: new Date(Date.now() - 66 * 60 * 60 * 1000).toISOString(), // 3 days ago
    createdAt: new Date(Date.now() - 66 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 66 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-5',
    petId: 'demo-pet-id',
    entryText: 'Thunder storm tonight - she hid under the bed',
    tags: [
      { id: 'tag-restless', label: 'Restless', icon: '😕', category: 'mood' },
      { id: 'tag-anxious', label: 'Anxious', icon: '😰', category: 'mood' }
    ],
    loggedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-6',
    petId: 'demo-pet-id',
    entryText: 'Much better after the storm passed',
    tags: [
      { id: 'tag-sleeping-well', label: 'Sleeping well', icon: '💤', category: 'sleep' },
      { id: 'tag-calm', label: 'Calm', icon: '😌', category: 'mood' }
    ],
    loggedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

/**
 * Check if demo mode is active
 */
export function isDemoMode(): boolean {
  return sessionStorage.getItem(DEMO_MODE_KEY) === 'true';
}

/**
 * Enable demo mode
 */
export function enableDemoMode(): void {
  sessionStorage.setItem(DEMO_MODE_KEY, 'true');
}

/**
 * Disable demo mode
 */
export function disableDemoMode(): void {
  sessionStorage.removeItem(DEMO_MODE_KEY);
}

/**
 * Get demo pet data
 */
export function getDemoPet(): Pet {
  return DEMO_PET;
}

/**
 * Get demo health logs
 */
export function getDemoHealthLogs(): HealthLog[] {
  return DEMO_HEALTH_LOGS;
}

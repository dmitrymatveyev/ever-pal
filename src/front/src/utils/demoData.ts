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
 * Demo health log entries - realistic scenario: Luna's Mystery Diarrhea Week
 * Story: Dietary indiscretion (table scraps) -> Acute gastroenteritis -> Vet intervention -> Recovery
 * Demonstrates: Authentic pet owner behavior, medically accurate progression, appropriate vet involvement
 * Timeline: 8 days total (Wed baseline -> Thu-Sat crisis -> Sun-Tue recovery)
 */
export const DEMO_HEALTH_LOGS: HealthLog[] = [
  // DAY 1 - WEDNESDAY (8 days ago): Normal baseline
  {
    id: 'log-01',
    petId: 'demo-pet-id',
    logType: 'food',
    entryText: 'Morning breakfast - regular kibble. She ate everything like usual.',
    tags: [
      { id: 'tag-normal-meal', label: 'Normal meal', icon: '🍽️', category: 'meal type' },
      { id: 'tag-good-appetite', label: 'Good appetite', icon: '🍽️', category: 'appetite' }
    ],
    loggedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000).toISOString(), // 7am
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-02',
    petId: 'demo-pet-id',
    logType: 'food',
    entryText: 'Had some leftover rotisserie chicken from dinner. Maybe 2-3 tablespoons? She loved it.',
    tags: [
      { id: 'tag-table-scraps', label: 'Table scraps', icon: '🍕', category: 'meal type' }
    ],
    loggedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000).toISOString(), // 7pm
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-03',
    petId: 'demo-pet-id',
    logType: 'general',
    entryText: 'Playing with her favorite mouse toy. Very energetic tonight!',
    tags: [
      { id: 'tag-playful', label: 'Playful', icon: '😊', category: 'mood' },
      { id: 'tag-energetic', label: 'Energetic', icon: '⚡', category: 'energy' }
    ],
    loggedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000).toISOString(), // 8pm
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000).toISOString()
  },

  // DAY 2 - THURSDAY (7 days ago): Early symptoms
  {
    id: 'log-04',
    petId: 'demo-pet-id',
    logType: 'stool',
    entryText: 'A bit mushier than usual. More than normal amount too.',
    tags: [
      { id: 'tag-soft-stool', label: 'Soft', icon: '🟡', category: 'consistency' }
    ],
    loggedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(), // 8am
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-05',
    petId: 'demo-pet-id',
    logType: 'food',
    entryText: 'Morning kibble. She only ate about half. Sniffed it and walked away.',
    tags: [
      { id: 'tag-normal-meal', label: 'Normal meal', icon: '🍽️', category: 'meal type' },
      { id: 'tag-picky-eater', label: 'Picky eater', icon: '🥘', category: 'appetite' }
    ],
    loggedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(), // 9am
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-06',
    petId: 'demo-pet-id',
    logType: 'food',
    entryText: "Only ate half her dinner. That's weird, she's normally a pig.",
    tags: [
      { id: 'tag-normal-meal', label: 'Normal meal', icon: '🍽️', category: 'meal type' },
      { id: 'tag-no-appetite', label: 'No appetite', icon: '🚫', category: 'appetite' }
    ],
    loggedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString(), // 6pm
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-07',
    petId: 'demo-pet-id',
    logType: 'general',
    entryText: 'Sleeping in the closet instead of her usual window spot. She seems a bit off.',
    tags: [
      { id: 'tag-tired', label: 'Tired', icon: '😴', category: 'energy' }
    ],
    loggedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000).toISOString(), // 8pm
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000).toISOString()
  },

  // DAY 3 - FRIDAY (6 days ago): Escalation
  {
    id: 'log-08',
    petId: 'demo-pet-id',
    logType: 'stool',
    entryText: 'Very watery. She went 3 times overnight. No blood that I can see.',
    tags: [
      { id: 'tag-loose-stool', label: 'Loose', icon: '🟠', category: 'consistency' }
    ],
    loggedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 6.5 * 60 * 60 * 1000).toISOString(), // 6:30am
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 6.5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 6.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-09',
    petId: 'demo-pet-id',
    logType: 'vomit',
    entryText: 'Threw up her breakfast. Undigested kibble.',
    tags: [
      { id: 'tag-vomit-food', label: 'Food', icon: '🍖', category: 'content' }
    ],
    loggedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 8.5 * 60 * 60 * 1000).toISOString(), // 8:30am
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 8.5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 8.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-10',
    petId: 'demo-pet-id',
    logType: 'general',
    entryText: "Still hiding. Called vet, they said monitor through the weekend unless she gets worse. I'm worried.",
    tags: [
      { id: 'tag-anxious', label: 'Anxious', icon: '😰', category: 'mood' }
    ],
    loggedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(), // 2pm
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-11',
    petId: 'demo-pet-id',
    logType: 'food',
    entryText: "Tried to give her dinner. She just looked at it and walked away. I've never seen her refuse food like this.",
    tags: [
      { id: 'tag-refused-food', label: 'Refused food', icon: '🚫', category: 'behavior' }
    ],
    loggedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 18.5 * 60 * 60 * 1000).toISOString(), // 6:30pm
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 18.5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 18.5 * 60 * 60 * 1000).toISOString()
  },

  // DAY 4 - SATURDAY (5 days ago): Crisis + Vet intervention
  {
    id: 'log-12',
    petId: 'demo-pet-id',
    logType: 'stool',
    entryText: 'OH GOD completely liquid diarrhea. She had an accident outside the litter box. This is so bad.',
    tags: [
      { id: 'tag-liquid-stool', label: 'Liquid', icon: '🔴', category: 'consistency' },
      { id: 'tag-accidents', label: 'Accidents', icon: '🚽', category: 'behavior' }
    ],
    loggedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 7.5 * 60 * 60 * 1000).toISOString(), // 7:30am
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 7.5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 7.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-13',
    petId: 'demo-pet-id',
    logType: 'stool',
    entryText: "She's trying to go but barely anything coming out. She looks so uncomfortable.",
    tags: [
      { id: 'tag-straining', label: 'Straining', icon: '😣', category: 'behavior' }
    ],
    loggedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(), // 9am
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-14',
    petId: 'demo-pet-id',
    logType: 'general',
    entryText: "Called vet emergency line. They're squeezing me in this afternoon. Thank god.",
    tags: [
      { id: 'tag-anxious', label: 'Anxious', icon: '😰', category: 'mood' }
    ],
    loggedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(), // 10am
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-15',
    petId: 'demo-pet-id',
    logType: 'medication',
    entryText: 'Vet prescribed FortiFlora probiotic. Give 1 packet daily mixed with food. Started bland diet - plain boiled chicken and rice.',
    tags: [
      { id: 'tag-supplement', label: 'Supplement', icon: '💚', category: 'admin type' }
    ],
    loggedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000).toISOString(), // 3pm
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-16',
    petId: 'demo-pet-id',
    logType: 'food',
    entryText: 'Ate about 1 tablespoon of boiled chicken. Better than nothing I guess.',
    tags: [
      { id: 'tag-new-food', label: 'New food', icon: '🆕', category: 'meal type' },
      { id: 'tag-picky-eater', label: 'Picky eater', icon: '🥘', category: 'appetite' }
    ],
    loggedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString(), // 6pm
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString()
  },

  // DAY 5 - SUNDAY (4 days ago): Improvement begins
  {
    id: 'log-17',
    petId: 'demo-pet-id',
    logType: 'stool',
    entryText: "Still loose but NOT liquid! It's actually more formed. She's not straining anymore either.",
    tags: [
      { id: 'tag-soft-stool', label: 'Soft', icon: '🟡', category: 'consistency' }
    ],
    loggedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(), // 8am
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-18',
    petId: 'demo-pet-id',
    logType: 'medication',
    entryText: '2nd dose of FortiFlora. Mixed it with chicken this morning.',
    tags: [
      { id: 'tag-supplement', label: 'Supplement', icon: '💚', category: 'admin type' }
    ],
    loggedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 8.5 * 60 * 60 * 1000).toISOString(), // 8:30am
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 8.5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 8.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-19',
    petId: 'demo-pet-id',
    logType: 'food',
    entryText: 'She ate all her chicken breakfast AND begged for more! This is huge!',
    tags: [
      { id: 'tag-new-food', label: 'New food', icon: '🆕', category: 'meal type' },
      { id: 'tag-good-appetite', label: 'Good appetite', icon: '🍽️', category: 'appetite' }
    ],
    loggedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(), // 1pm
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-20',
    petId: 'demo-pet-id',
    logType: 'general',
    entryText: "She's playing with her toy! First time in DAYS. I almost cried.",
    tags: [
      { id: 'tag-playful', label: 'Playful', icon: '😊', category: 'mood' }
    ],
    loggedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000).toISOString(), // 5pm
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000).toISOString()
  },

  // DAY 6 - MONDAY (3 days ago): Recovery
  {
    id: 'log-21',
    petId: 'demo-pet-id',
    logType: 'stool',
    entryText: 'NORMAL POOP! Well-formed and solid. Took a photo for my records haha.',
    tags: [
      { id: 'tag-normal-stool', label: 'Normal', icon: '🟢', category: 'consistency' }
    ],
    loggedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 7.5 * 60 * 60 * 1000).toISOString(), // 7:30am
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 7.5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 7.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-22',
    petId: 'demo-pet-id',
    logType: 'food',
    entryText: 'Transitioning back to regular food. Doing 75% chicken/rice, 25% kibble.',
    tags: [
      { id: 'tag-new-food', label: 'New food', icon: '🆕', category: 'meal type' },
      { id: 'tag-good-appetite', label: 'Good appetite', icon: '🍽️', category: 'appetite' }
    ],
    loggedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(), // 12pm
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'log-23',
    petId: 'demo-pet-id',
    logType: 'general',
    entryText: "Running around the apartment like nothing happened! She's completely back to her normal self!",
    tags: [
      { id: 'tag-energetic', label: 'Energetic', icon: '⚡', category: 'energy' },
      { id: 'tag-playful', label: 'Playful', icon: '😊', category: 'mood' }
    ],
    loggedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000).toISOString(), // 7pm
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000).toISOString()
  },

  // DAY 7 - TUESDAY (2 days ago): Back to normal
  {
    id: 'log-24',
    petId: 'demo-pet-id',
    logType: 'food',
    entryText: 'Back on regular kibble 100%. She ate it all. No issues.',
    tags: [
      { id: 'tag-normal-meal', label: 'Normal meal', icon: '🍽️', category: 'meal type' },
      { id: 'tag-good-appetite', label: 'Good appetite', icon: '🍽️', category: 'appetite' }
    ],
    loggedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString(), // 6pm
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString()
  },

  // DAY 8 - WEDNESDAY (1 day ago): Completely recovered
  {
    id: 'log-25',
    petId: 'demo-pet-id',
    logType: 'general',
    entryText: 'Everything normal. She slept through the night in her window spot. Lesson learned: NO MORE TABLE SCRAPS!',
    tags: [
      { id: 'tag-playful', label: 'Playful', icon: '😊', category: 'mood' },
      { id: 'tag-sleeping-well', label: 'Sleeping well', icon: '💤', category: 'sleep' }
    ],
    loggedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(), // 9am
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString()
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
 * Returns logs in reverse chronological order (newest first) to match backend API behavior
 */
export function getDemoHealthLogs(): HealthLog[] {
  // Sort by loggedAt DESC (newest first) to match backend behavior
  return [...DEMO_HEALTH_LOGS].sort((a, b) =>
    new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  );
}

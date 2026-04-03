import type { Category, CategoryStats, IoniconName } from '../types';

export interface CategoryConfig {
  label: string;
  /** Number of questions drawn from this category in a 50-question mock test. */
  mockWeight: number;
  colour: string;
  icon: IoniconName;
}

export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  alertness: { label: 'Alertness', mockWeight: 4, colour: '#1A56A0', icon: 'eye' },
  attitude: { label: 'Attitude', mockWeight: 4, colour: '#7C3AED', icon: 'heart' },
  'safety-margins': { label: 'Safety Margins', mockWeight: 4, colour: '#0891B2', icon: 'shield-checkmark' },
  'hazard-awareness': { label: 'Hazard Awareness', mockWeight: 5, colour: '#D97706', icon: 'warning' },
  'vulnerable-road-users': { label: 'Vulnerable Road Users', mockWeight: 5, colour: '#DC2626', icon: 'people' },
  'vehicle-safety': { label: 'Vehicle Safety', mockWeight: 4, colour: '#059669', icon: 'car' },
  'motorway-rules': { label: 'Motorway Rules', mockWeight: 4, colour: '#2563EB', icon: 'speedometer' },
  'rules-of-the-road': { label: 'Rules of the Road', mockWeight: 6, colour: '#0D9488', icon: 'book' },
  'road-traffic-signs': { label: 'Road & Traffic Signs', mockWeight: 7, colour: '#EA580C', icon: 'stop-circle' },
  documents: { label: 'Documents', mockWeight: 3, colour: '#64748B', icon: 'document-text' },
  accidents: { label: 'Incidents & Emergencies', mockWeight: 3, colour: '#BE185D', icon: 'medkit' },
  'vehicle-loading': { label: 'Vehicle Loading', mockWeight: 1, colour: '#78716C', icon: 'cube' },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as Category[];

/** Returns a fresh `{ correct: 0, total: 0 }` map for every category. */
export function buildEmptyCategoryStats(): CategoryStats {
  return Object.fromEntries(
    ALL_CATEGORIES.map((c) => [c, { correct: 0, total: 0 }]),
  ) as CategoryStats;
}

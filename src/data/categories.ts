import { Category } from '../types';

export interface CategoryConfig {
  label: string;
  mockWeight: number;
  colour: string;
  icon: string;
}

export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  alertness: { label: 'Alertness', mockWeight: 5, colour: '#1A56A0', icon: 'eye' },
  attitude: { label: 'Attitude', mockWeight: 4, colour: '#7C3AED', icon: 'heart' },
  'safety-margins': { label: 'Safety Margins', mockWeight: 5, colour: '#0891B2', icon: 'shield-checkmark' },
  'hazard-awareness': { label: 'Hazard Awareness', mockWeight: 5, colour: '#D97706', icon: 'warning' },
  'vulnerable-road-users': { label: 'Vulnerable Road Users', mockWeight: 6, colour: '#DC2626', icon: 'people' },
  'vehicle-safety': { label: 'Vehicle Safety', mockWeight: 5, colour: '#059669', icon: 'car' },
  'motorway-rules': { label: 'Motorway Rules', mockWeight: 4, colour: '#2563EB', icon: 'speedometer' },
  'rules-of-the-road': { label: 'Rules of the Road', mockWeight: 7, colour: '#0D9488', icon: 'book' },
  'road-traffic-signs': { label: 'Road & Traffic Signs', mockWeight: 8, colour: '#EA580C', icon: 'stop-circle' },
  documents: { label: 'Documents', mockWeight: 3, colour: '#64748B', icon: 'document-text' },
  accidents: { label: 'Accidents', mockWeight: 4, colour: '#BE185D', icon: 'medkit' },
  'vehicle-loading': { label: 'Vehicle Loading', mockWeight: 3, colour: '#78716C', icon: 'cube' },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as Category[];

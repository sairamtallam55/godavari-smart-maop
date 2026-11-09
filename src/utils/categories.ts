import { FacilityCategory, OperationalStatus, VerificationStatus } from '../types';

export interface CategoryMeta {
  key: FacilityCategory;
  nameEn: string;
  color: string; // Tailwind bg
  textColor: string;
  borderColor: string;
  pinColor: string; // Hex for Leaflet custom marker SVG
  iconName: string;
}

export const CATEGORIES_META: Record<FacilityCategory, CategoryMeta> = {
  hospital: {
    key: 'hospital',
    nameEn: 'Hospitals & Medical',
    color: 'bg-rose-50 dark:bg-rose-950/40',
    textColor: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-200 dark:border-rose-800',
    pinColor: '#e11d48',
    iconName: 'HeartPulse',
  },
  first_aid: {
    key: 'first_aid',
    nameEn: 'First-Aid Centers',
    color: 'bg-red-50 dark:bg-red-950/40',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800',
    pinColor: '#dc2626',
    iconName: 'PlusCircle',
  },
  toilet: {
    key: 'toilet',
    nameEn: 'Public Bio-Toilets',
    color: 'bg-teal-50 dark:bg-teal-950/40',
    textColor: 'text-teal-700 dark:text-teal-300',
    borderColor: 'border-teal-200 dark:border-teal-800',
    pinColor: '#0d9488',
    iconName: 'Sparkles',
  },
  drinking_water: {
    key: 'drinking_water',
    nameEn: 'Drinking Water Hubs',
    color: 'bg-sky-50 dark:bg-sky-950/40',
    textColor: 'text-sky-700 dark:text-sky-300',
    borderColor: 'border-sky-200 dark:border-sky-800',
    pinColor: '#0284c7',
    iconName: 'Droplet',
  },
  parking: {
    key: 'parking',
    nameEn: 'Vehicle Parking',
    color: 'bg-amber-50 dark:bg-amber-950/40',
    textColor: 'text-amber-800 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-800',
    pinColor: '#d97706',
    iconName: 'Car',
  },
  bus_stop: {
    key: 'bus_stop',
    nameEn: 'Bus Stops & Shuttles',
    color: 'bg-blue-50 dark:bg-blue-950/40',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    pinColor: '#2563eb',
    iconName: 'Bus',
  },
  railway_station: {
    key: 'railway_station',
    nameEn: 'Railway Stations',
    color: 'bg-indigo-50 dark:bg-indigo-950/40',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    pinColor: '#4f46e5',
    iconName: 'TrainTrack',
  },
  police: {
    key: 'police',
    nameEn: 'Police Help Desks',
    color: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-800 dark:text-slate-200',
    borderColor: 'border-slate-300 dark:border-slate-700',
    pinColor: '#1e293b',
    iconName: 'ShieldAlert',
  },
  lost_and_found: {
    key: 'lost_and_found',
    nameEn: 'Lost & Found Centers',
    color: 'bg-orange-50 dark:bg-orange-950/40',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-200 dark:border-orange-800',
    pinColor: '#ea580c',
    iconName: 'Users',
  },
  information_center: {
    key: 'information_center',
    nameEn: 'Pilgrim Info Centers',
    color: 'bg-emerald-50 dark:bg-emerald-950/40',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    pinColor: '#059669',
    iconName: 'Info',
  },
  food_center: {
    key: 'food_center',
    nameEn: 'Annadanam & Food',
    color: 'bg-yellow-50 dark:bg-yellow-950/40',
    textColor: 'text-yellow-800 dark:text-yellow-300',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    pinColor: '#ca8a04',
    iconName: 'Utensils',
  },
  accessibility_help: {
    key: 'accessibility_help',
    nameEn: 'Elderly & Divyangjan Aid',
    color: 'bg-purple-50 dark:bg-purple-950/40',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-800',
    pinColor: '#7c3aed',
    iconName: 'Accessibility',
  },
  bathing_ghat: {
    key: 'bathing_ghat',
    nameEn: 'Holy Bathing Ghats',
    color: 'bg-cyan-50 dark:bg-cyan-950/40',
    textColor: 'text-cyan-800 dark:text-cyan-300',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    pinColor: '#0891b2',
    iconName: 'Waves',
  },
};

export function getStatusBadge(status: OperationalStatus): {
  label: string;
  bg: string;
  text: string;
  dotColor: string;
} {
  switch (status) {
    case 'operational':
      return {
        label: 'Operational',
        bg: 'bg-emerald-50 dark:bg-emerald-950/50',
        text: 'text-emerald-700 dark:text-emerald-300',
        dotColor: 'bg-emerald-500',
      };
    case 'maintenance':
      return {
        label: 'Under Maintenance',
        bg: 'bg-amber-50 dark:bg-amber-950/50',
        text: 'text-amber-700 dark:text-amber-300',
        dotColor: 'bg-amber-500',
      };
    case 'temporarily_closed':
      return {
        label: 'Temporarily Closed',
        bg: 'bg-rose-50 dark:bg-rose-950/50',
        text: 'text-rose-700 dark:text-rose-300',
        dotColor: 'bg-rose-500',
      };
    default:
      return {
        label: 'Status Unknown',
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        dotColor: 'bg-slate-400',
      };
  }
}

export function getVerificationBadge(status: VerificationStatus): {
  label: string;
  bg: string;
  text: string;
} {
  switch (status) {
    case 'verified':
      return {
        label: 'Verified Official',
        bg: 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-300',
      };
    case 'pending_verification':
      return {
        label: 'Pending Verification',
        bg: 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800',
        text: 'text-amber-800 dark:text-amber-300',
      };
    case 'demo_data':
    default:
      return {
        label: 'Synthetic Demo Record',
        bg: 'bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700',
        text: 'text-slate-700 dark:text-slate-300',
      };
  }
}

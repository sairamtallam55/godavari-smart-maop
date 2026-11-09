/**
 * Geographic and Data Calculation Utilities for Godavari SmartMap
 */

export interface FacilityLocation {
  latitude: number;
  longitude: number;
}

/**
 * Calculates Great Circle distance between two points in kilometers using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Human-readable distance format (e.g., "450 m" or "2.4 km")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export interface MinimalFacility {
  id: string;
  name: string;
  category: string;
  operationalStatus: string;
  verificationStatus: string;
  latitude: number;
  longitude: number;
  services?: string[];
  description?: string;
  address?: string;
}

/**
 * Filters facilities by category, status, verification and query text
 */
export function filterFacilities<T extends MinimalFacility>(
  facilities: T[],
  filters: {
    category?: string;
    operationalStatus?: string;
    verificationStatus?: string;
    query?: string;
    onlyAccessible?: boolean;
  }
): T[] {
  return facilities.filter((facility) => {
    if (filters.category && filters.category !== 'all' && facility.category !== filters.category) {
      return false;
    }

    if (
      filters.operationalStatus &&
      filters.operationalStatus !== 'all' &&
      facility.operationalStatus !== filters.operationalStatus
    ) {
      return false;
    }

    if (
      filters.verificationStatus &&
      filters.verificationStatus !== 'all' &&
      facility.verificationStatus !== filters.verificationStatus
    ) {
      return false;
    }

    if (filters.query && filters.query.trim().length > 0) {
      const q = filters.query.toLowerCase().trim();
      const matchName = facility.name.toLowerCase().includes(q);
      const matchCat = facility.category.toLowerCase().includes(q);
      const matchDesc = facility.description?.toLowerCase().includes(q) ?? false;
      const matchAddr = facility.address?.toLowerCase().includes(q) ?? false;
      const matchServices = facility.services?.some((s) => s.toLowerCase().includes(q)) ?? false;

      if (!matchName && !matchCat && !matchDesc && !matchAddr && !matchServices) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Finds and sorts facilities within a radius in kilometers
 */
export function findNearbyFacilities<T extends MinimalFacility>(
  facilities: T[],
  userLat: number,
  userLon: number,
  radiusKm: number = 5
): Array<T & { distanceKm: number; formattedDistance: string }> {
  return facilities
    .map((facility) => {
      const distanceKm = calculateDistanceKm(
        userLat,
        userLon,
        facility.latitude,
        facility.longitude
      );
      return {
        ...facility,
        distanceKm,
        formattedDistance: formatDistance(distanceKm),
      };
    })
    .filter((facility) => facility.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Natural language intent classifier for fallback facility search
 */
export function classifySearchIntent(query: string): {
  detectedCategory: string | null;
  wantsNearest: boolean;
  isEmergency: boolean;
  keywords: string[];
} {
  const normalized = query.toLowerCase();

  let detectedCategory: string | null = null;
  const wantsNearest =
    normalized.includes('near') ||
    normalized.includes('closest') ||
    normalized.includes('around') ||
    normalized.includes('daggara') ||
    normalized.includes('paas');

  const isEmergency =
    normalized.includes('emergency') ||
    normalized.includes('ambulance') ||
    normalized.includes('police') ||
    normalized.includes('accident') ||
    normalized.includes('urgent');

  if (
    normalized.includes('hospital') ||
    normalized.includes('clinic') ||
    normalized.includes('doctor') ||
    normalized.includes('medical') ||
    normalized.includes('vaidyashala') ||
    normalized.includes('aspati')
  ) {
    detectedCategory = 'hospital';
  } else if (
    normalized.includes('first-aid') ||
    normalized.includes('first aid') ||
    normalized.includes('prathamika chikitsa')
  ) {
    detectedCategory = 'first_aid';
  } else if (
    normalized.includes('toilet') ||
    normalized.includes('washroom') ||
    normalized.includes('restroom') ||
    normalized.includes('lavatory') ||
    normalized.includes('shouchalayam')
  ) {
    detectedCategory = 'toilet';
  } else if (
    normalized.includes('water') ||
    normalized.includes('drinking') ||
    normalized.includes('neellu') ||
    normalized.includes('pani') ||
    normalized.includes('jal')
  ) {
    detectedCategory = 'drinking_water';
  } else if (
    normalized.includes('parking') ||
    normalized.includes('vehicle') ||
    normalized.includes('car') ||
    normalized.includes('bike')
  ) {
    detectedCategory = 'parking';
  } else if (
    normalized.includes('bus') ||
    normalized.includes('transport') ||
    normalized.includes('shuttle') ||
    normalized.includes('auto')
  ) {
    detectedCategory = 'bus_stop';
  } else if (
    normalized.includes('train') ||
    normalized.includes('railway') ||
    normalized.includes('station')
  ) {
    detectedCategory = 'railway_station';
  } else if (
    normalized.includes('police') ||
    normalized.includes('cop') ||
    normalized.includes('rakshaka') ||
    normalized.includes('thana')
  ) {
    detectedCategory = 'police';
  } else if (
    normalized.includes('ghat') ||
    normalized.includes('bath') ||
    normalized.includes('snanam') ||
    normalized.includes('river') ||
    normalized.includes('pushkar')
  ) {
    detectedCategory = 'bathing_ghat';
  } else if (
    normalized.includes('food') ||
    normalized.includes('prasadam') ||
    normalized.includes('annadanam') ||
    normalized.includes('bhojanam')
  ) {
    detectedCategory = 'food_center';
  } else if (
    normalized.includes('lost') ||
    normalized.includes('found') ||
    normalized.includes('missing')
  ) {
    detectedCategory = 'lost_and_found';
  } else if (
    normalized.includes('help') ||
    normalized.includes('info') ||
    normalized.includes('desk') ||
    normalized.includes('samacharam')
  ) {
    detectedCategory = 'information_center';
  }

  const words = normalized
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  return {
    detectedCategory,
    wantsNearest,
    isEmergency,
    keywords: words,
  };
}

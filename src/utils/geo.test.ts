import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistanceKm,
  formatDistance,
  filterFacilities,
  findNearbyFacilities,
  classifySearchIntent,
  type MinimalFacility,
} from './geo';

const mockFacilities: MinimalFacility[] = [
  {
    id: 'f1',
    name: 'Pushkar Ghat Medical Camp',
    category: 'hospital',
    operationalStatus: 'operational',
    verificationStatus: 'verified',
    latitude: 17.0005,
    longitude: 81.7774,
    services: ['Emergency Care', 'First Aid', 'Ambulance'],
    description: 'Main medical camp on Pushkar Ghat',
    address: 'Near Pushkar Ghat, Rajahmundry',
  },
  {
    id: 'f2',
    name: 'Saraswati Ghat Water Station',
    category: 'drinking_water',
    operationalStatus: 'operational',
    verificationStatus: 'verified',
    latitude: 17.003,
    longitude: 81.779,
    services: ['RO Water', 'Cool Drinking Water'],
    description: 'Cold RO drinking water dispenser',
    address: 'Saraswati Ghat, Rajahmundry',
  },
  {
    id: 'f3',
    name: 'Kotilingala Ghat Public Restroom',
    category: 'toilet',
    operationalStatus: 'maintenance',
    verificationStatus: 'pending_verification',
    latitude: 17.012,
    longitude: 81.785,
    services: ['Separate Men/Women', 'Disabled Accessible'],
    description: 'Sanitary restroom block with 20 cubicles',
    address: 'Kotilingala Ghat Entry, Rajahmundry',
  },
];

test('calculateDistanceKm calculates zero for identical points', () => {
  const dist = calculateDistanceKm(17.0005, 81.7774, 17.0005, 81.7774);
  assert.equal(dist, 0);
});

test('calculateDistanceKm calculates approximate distance for Rajahmundry coordinates', () => {
  // Distance between Pushkar Ghat and Kotilingala Ghat is approx 1.5 km
  const dist = calculateDistanceKm(17.0005, 81.7774, 17.012, 81.785);
  assert.ok(dist > 1.0 && dist < 2.0, `Expected ~1.5km, got ${dist}`);
});

test('formatDistance handles meters and kilometers properly', () => {
  assert.equal(formatDistance(0.35), '350 m');
  assert.equal(formatDistance(1.234), '1.2 km');
  assert.equal(formatDistance(12.0), '12.0 km');
});

test('filterFacilities filters by category accurately', () => {
  const results = filterFacilities(mockFacilities, { category: 'drinking_water' });
  assert.equal(results.length, 1);
  assert.equal(results[0].id, 'f2');
});

test('filterFacilities filters by operational status', () => {
  const operational = filterFacilities(mockFacilities, { operationalStatus: 'operational' });
  assert.equal(operational.length, 2);
  const maintenance = filterFacilities(mockFacilities, { operationalStatus: 'maintenance' });
  assert.equal(maintenance.length, 1);
});

test('filterFacilities handles text search', () => {
  const matches = filterFacilities(mockFacilities, { query: 'Medical' });
  assert.equal(matches.length, 1);
  assert.equal(matches[0].name, 'Pushkar Ghat Medical Camp');
});

test('findNearbyFacilities finds facilities sorted by distance', () => {
  // Pushkar Ghat user location: 17.0000, 81.7770
  const nearby = findNearbyFacilities(mockFacilities, 17.0000, 81.7770, 5);
  assert.equal(nearby.length, 3);
  assert.equal(nearby[0].id, 'f1'); // closest
  assert.ok(nearby[0].distanceKm <= nearby[1].distanceKm);
});

test('classifySearchIntent detects category and nearest intent correctly', () => {
  const intent1 = classifySearchIntent('Where can I get drinking water near me?');
  assert.equal(intent1.detectedCategory, 'drinking_water');
  assert.equal(intent1.wantsNearest, true);

  const intent2 = classifySearchIntent('Emergency hospital needed immediately');
  assert.equal(intent2.detectedCategory, 'hospital');
  assert.equal(intent2.isEmergency, true);

  const intent3 = classifySearchIntent('Toilets near bathing ghat');
  assert.equal(intent3.detectedCategory, 'toilet');
});

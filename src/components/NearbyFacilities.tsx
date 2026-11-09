import React, { useState, useMemo } from 'react';
import {
  Compass,
  MapPin,
  Navigation,
  Sliders,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Info,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Facility, FacilityCategory, Language } from '../types';
import { calculateDistanceKm, formatDistance } from '../utils/geo';
import { CATEGORIES_META, getStatusBadge, getVerificationBadge } from '../utils/categories';
import { TRANSLATIONS } from '../i18n/translations';

interface NearbyFacilitiesProps {
  facilities: Facility[];
  userCoords: { latitude: number; longitude: number } | null;
  onRequestUserLocation: () => void;
  onSetManualLocation: (lat: number, lon: number, name: string) => void;
  currentLocationName: string;
  onSelectFacility: (facility: Facility) => void;
  language: Language;
}

const PRESET_LOCATIONS = [
  { name: 'Pushkar Ghat Promenade (Central)', lat: 17.0008, lon: 81.7765 },
  { name: 'Rajahmundry Railway Station (RJY)', lat: 16.9855, lon: 81.7802 },
  { name: 'Kotipalli Bus Stand Concourse', lat: 16.9920, lon: 81.7890 },
  { name: 'Kotilingala Ghat North Gate', lat: 17.0135, lon: 81.7865 },
  { name: 'Kovvur Goshpada Kshetram Ghat', lat: 17.0105, lon: 81.7330 },
  { name: 'Arts College Parking Grounds (P1)', lat: 17.0090, lon: 81.7920 },
];

export const NearbyFacilities: React.FC<NearbyFacilitiesProps> = ({
  facilities,
  userCoords,
  onRequestUserLocation,
  onSetManualLocation,
  currentLocationName,
  onSelectFacility,
  language,
}) => {
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(2.0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLocationDialog, setShowLocationDialog] = useState<boolean>(false);
  const [customLat, setCustomLat] = useState<string>('');
  const [customLon, setCustomLon] = useState<string>('');

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Active anchor coordinates (either GPS or selected preset)
  const activeLat = userCoords?.latitude ?? 17.0008;
  const activeLon = userCoords?.longitude ?? 81.7765;

  // Calculate nearby facilities
  const nearbyList = useMemo(() => {
    return facilities
      .map((facility) => {
        const distKm = calculateDistanceKm(
          activeLat,
          activeLon,
          facility.latitude,
          facility.longitude
        );
        return {
          ...facility,
          distKm,
          formattedDist: formatDistance(distKm),
        };
      })
      .filter((f) => {
        if (f.distKm > selectedRadiusKm) return false;
        if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
        return true;
      })
      .sort((a, b) => a.distKm - b.distKm);
  }, [facilities, activeLat, activeLon, selectedRadiusKm, selectedCategory]);

  const handleApplyCustomCoords = () => {
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      onSetManualLocation(lat, lon, `Custom Coords (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
      setShowLocationDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Location Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600">
                <Navigation className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Nearby Facility Finder
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Locate verified emergency posts, drinking water, restrooms, and parking relative to your position.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRequestUserLocation}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Use Real GPS</span>
            </button>
            <button
              onClick={() => setShowLocationDialog(!showLocationDialog)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Select Landmark</span>
            </button>
          </div>
        </div>

        {/* Current Origin Notice */}
        <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Current Reference Point:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-medium">
              {currentLocationName || 'Pushkar Ghat Promenade (Central)'}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              ({activeLat.toFixed(4)}, {activeLon.toFixed(4)})
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            {userCoords ? 'Active Live GPS Coordinates' : 'Simulated Pushkaralu Center'}
          </div>
        </div>

        {/* Location Selection Drawer / Modal */}
        {showLocationDialog && (
          <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Select a Pushkaralu Pilgrimage Landmark:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {PRESET_LOCATIONS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    onSetManualLocation(preset.lat, preset.lon, preset.name);
                    setShowLocationDialog(false);
                  }}
                  className="p-2 text-left text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-500 hover:text-teal-700 transition-colors"
                >
                  <div className="font-semibold">{preset.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {preset.lat.toFixed(4)}, {preset.lon.toFixed(4)}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Or custom lat/lon:</span>
              <input
                type="number"
                step="0.0001"
                placeholder="Lat (e.g. 17.001)"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                className="w-28 px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
              />
              <input
                type="number"
                step="0.0001"
                placeholder="Lon (e.g. 81.776)"
                value={customLon}
                onChange={(e) => setCustomLon(e.target.value)}
                className="w-28 px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
              />
              <button
                onClick={handleApplyCustomCoords}
                className="px-3 py-1 text-xs font-semibold bg-slate-800 text-white rounded hover:bg-slate-700"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Radius Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        {/* Radius Segmented Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 shrink-0 mr-1">Search Radius:</span>
          {[0.5, 1.0, 2.0, 5.0, 10.0].map((radius) => (
            <button
              key={radius}
              onClick={() => setSelectedRadiusKm(radius)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                selectedRadiusKm === radius
                  ? 'bg-slate-900 dark:bg-teal-600 text-white border-transparent shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {radius < 1 ? `${radius * 1000} m` : `${radius} km`}
            </button>
          ))}
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORIES_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <span className="font-bold text-slate-900 dark:text-slate-100">{nearbyList.length}</span> facilities within {selectedRadiusKm >= 1 ? `${selectedRadiusKm} km` : `${selectedRadiusKm * 1000} m`} sorted by proximity
        </div>
        <div className="text-[11px] text-slate-400">
          Distances computed via Haversine Geodesic Model
        </div>
      </div>

      {/* Facilities Cards Grid */}
      {nearbyList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            No facilities found within {selectedRadiusKm >= 1 ? `${selectedRadiusKm} km` : `${selectedRadiusKm * 1000} m`}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try expanding your search radius to 5 km or 10 km, or switch the category filter to 'All Categories'.
          </p>
          <button
            onClick={() => {
              setSelectedRadiusKm(5.0);
              setSelectedCategory('all');
            }}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700"
          >
            Expand to 5 km (All Categories)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nearbyList.map((facility) => {
            const catMeta = CATEGORIES_META[facility.category] || CATEGORIES_META.bathing_ghat;
            const statusMeta = getStatusBadge(facility.operationalStatus);
            const verMeta = getVerificationBadge(facility.verificationStatus);

            return (
              <div
                key={facility.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Top Bar: Distance Pill and Category */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                      <Navigation className="w-3 h-3" />
                      {facility.formattedDist}
                    </span>

                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${statusMeta.bg} ${statusMeta.text}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 leading-snug">
                    {facility.name}
                  </h3>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{catMeta.nameEn}</span>
                    <span>·</span>
                    <span>{facility.zone}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                    {facility.description}
                  </p>

                  {/* Services Tags */}
                  {facility.services && facility.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {facility.services.slice(0, 3).map((service, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded"
                        >
                          {service}
                        </span>
                      ))}
                      {facility.services.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{facility.services.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-1.5 px-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-1"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => onSelectFacility(facility)}
                    className="flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

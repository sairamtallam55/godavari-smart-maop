import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  Compass,
  Filter,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Facility, FacilityCategory, OperationalStatus, VerificationStatus, Language } from '../types';
import { CATEGORIES_META, getStatusBadge, getVerificationBadge } from '../utils/categories';
import { TRANSLATIONS } from '../i18n/translations';

interface InteractiveMapProps {
  facilities: Facility[];
  selectedFacility: Facility | null;
  onSelectFacility: (facility: Facility) => void;
  language: Language;
  userCoords: { latitude: number; longitude: number } | null;
  onRequestUserLocation: () => void;
  initialCategory?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  facilities,
  selectedFacility,
  onSelectFacility,
  language,
  userCoords,
  onRequestUserLocation,
  initialCategory,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedVerification, setSelectedVerification] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'map' | 'split'>('map');
  const [mapTileStyle, setMapTileStyle] = useState<'standard' | 'humanitarian'>('standard');

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Filtered facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && f.operationalStatus !== selectedStatus) return false;
      if (selectedVerification !== 'all' && f.verificationStatus !== selectedVerification) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          f.name.toLowerCase().includes(q) ||
          f.address.toLowerCase().includes(q) ||
          f.services.some((s) => s.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [facilities, selectedCategory, selectedStatus, selectedVerification, searchQuery]);

  // Create custom marker icon
  const createMarkerIcon = (facility: Facility, isSelected: boolean) => {
    const meta = CATEGORIES_META[facility.category] || CATEGORIES_META.bathing_ghat;
    const pinColor = meta.pinColor;
    const isClosed = facility.operationalStatus === 'temporarily_closed';
    const isMaintenance = facility.operationalStatus === 'maintenance';

    const statusBorder = isClosed
      ? 'border: 2px solid #ef4444;'
      : isMaintenance
      ? 'border: 2px solid #f59e0b;'
      : 'border: 2px solid #ffffff;';

    const html = `
      <div style="position: relative; width: 34px; height: 34px; transform: translate(-50%, -50%); cursor: pointer; transition: transform 0.2s;">
        <div style="
          width: 34px;
          height: 34px;
          background: ${pinColor};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          ${statusBorder}
          ${isSelected ? 'transform: rotate(-45deg) scale(1.25); box-shadow: 0 0 0 4px #0284c7;' : ''}
        ">
          <div style="
            transform: rotate(45deg);
            color: #ffffff;
            font-weight: 700;
            font-size: 11px;
            font-family: system-ui, sans-serif;
            text-align: center;
          ">
            ${facility.name.charAt(0)}
          </div>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-facility-pin',
      html,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -32],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Godavari River at Rajahmundry Pushkar Ghat
      const map = L.map(mapContainerRef.current, {
        center: [17.0008, 81.7765],
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap standard tile layer
      const tileUrl =
        mapTileStyle === 'humanitarian'
          ? 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Godavari Pushkaralu GIS',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when facilities or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredFacilities.forEach((facility) => {
      const isSelected = selectedFacility?.id === facility.id;
      const marker = L.marker([facility.latitude, facility.longitude], {
        icon: createMarkerIcon(facility, isSelected),
        title: facility.name,
      });

      const statusMeta = getStatusBadge(facility.operationalStatus);
      const verMeta = getVerificationBadge(facility.verificationStatus);
      const catMeta = CATEGORIES_META[facility.category];

      // Interactive popup
      const popupHtml = `
        <div style="min-width: 220px; font-family: 'DM Sans', system-ui, sans-serif;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; background: #f1f5f9; color: #334155;">
              ${catMeta?.nameEn || facility.category}
            </span>
            <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; background: ${facility.operationalStatus === 'operational' ? '#ecfdf5' : '#fef2f2'}; color: ${facility.operationalStatus === 'operational' ? '#047857' : '#b91c1c'};">
              ${statusMeta.label}
            </span>
          </div>
          <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 4px 0 6px 0; line-height: 1.3;">
            ${facility.name}
          </h4>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0; line-height: 1.4;">
            ${facility.address}
          </p>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 10px;">
            ${verMeta.label}
          </div>
          <div style="display: flex; gap: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}" 
              target="_blank" 
              rel="noopener noreferrer" 
              style="flex: 1; text-align: center; background: #0284c7; color: white; padding: 6px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none;"
            >
              Get Directions
            </a>
            <button 
              id="btn-inspect-${facility.id}" 
              style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; color: #1e293b; padding: 6px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;"
            >
              Full Details
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${facility.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectFacility(facility);
          };
        }
      });

      marker.on('click', () => {
        onSelectFacility(facility);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredFacilities, selectedFacility]);

  // Handle User Location Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userCoords) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userCoords.latitude, userCoords.longitude]);
      } else {
        const userHtml = `
          <div style="position: relative; width: 20px; height: 20px;">
            <div style="position: absolute; width: 20px; height: 20px; background: rgba(2, 132, 199, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; background: #0284c7; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>
        `;
        const icon = L.divIcon({
          html: userHtml,
          className: 'user-location-pulse',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        userMarkerRef.current = L.marker([userCoords.latitude, userCoords.longitude], {
          icon,
          title: 'Your Current Location',
        })
          .bindPopup('<b>Your Current Location</b><br/>GPS accurately localized.')
          .addTo(mapInstanceRef.current);
      }
    }
  }, [userCoords]);

  // Center on selected facility
  useEffect(() => {
    if (selectedFacility && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedFacility.latitude, selectedFacility.longitude], 16, {
        duration: 1.2,
      });
    }
  }, [selectedFacility]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedVerification('all');
    setSearchQuery('');
  };

  const centerOnGhats = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([17.0008, 81.7765], 14);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[500px] flex flex-col bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Top Map Control Bar */}
      <div className="z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Buttons & Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showFiltersPanel || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {(selectedCategory !== 'all' || selectedStatus !== 'all' || selectedVerification !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            )}
          </button>

          <button
            onClick={onRequestUserLocation}
            title="Locate my position via GPS"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              userCoords
                ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-200'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">My Location</span>
          </button>

          <button
            onClick={centerOnGhats}
            title="Reset to Central Pushkar Ghats"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50"
          >
            <Compass className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden md:inline">Central Ghats</span>
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'map' ? 'split' : 'map')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{viewMode === 'map' ? 'Split List' : 'Full Map'}</span>
          </button>

          {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery) && (
            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="p-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Filters Panel */}
      {showFiltersPanel && (
        <div className="z-20 bg-slate-50/95 dark:bg-slate-850/95 border-b border-slate-200 dark:border-slate-800 p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Facility Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-1.5 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Categories ({facilities.length})</option>
              {Object.entries(CATEGORIES_META).map(([key, meta]) => {
                const count = facilities.filter((f) => f.category === key).length;
                return (
                  <option key={key} value={key}>
                    {meta.nameEn} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Operational Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-1.5 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Statuses</option>
              <option value="operational">Operational</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="temporarily_closed">Temporarily Closed</option>
              <option value="status_unknown">Status Unknown</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Verification Level</label>
            <select
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-1.5 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Records</option>
              <option value="verified">Verified Official</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="demo_data">Demo Synthetic Records</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Map & Split View Container */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Leaflet Map Surface */}
        <div ref={mapContainerRef} className="flex-1 h-full w-full z-10" />

        {/* Split List Panel */}
        {viewMode === 'split' && (
          <div className="w-80 md:w-96 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto p-3 z-10 flex flex-col gap-2 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Visible Facilities ({filteredFacilities.length})
              </span>
              <button
                onClick={() => setViewMode('map')}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredFacilities.map((facility) => {
                const statusMeta = getStatusBadge(facility.operationalStatus);
                const isSelected = selectedFacility?.id === facility.id;

                return (
                  <div
                    key={facility.id}
                    onClick={() => onSelectFacility(facility)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-400 dark:border-teal-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h5 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {facility.name}
                      </h5>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${statusMeta.bg} ${statusMeta.text}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-1 mb-2">
                      {facility.address}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{facility.zone}</span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-0.5"
                      >
                        Directions <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating Quick Legend / Status Indicator */}
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none sm:pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-[11px] shadow-sm max-w-xs">
          <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between gap-2">
            <span>Map Status Legend</span>
            <span className="text-[10px] text-slate-400 font-normal">Pushkaralu 2027</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Operational</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Maintenance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Closed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>Your GPS</span>
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400">
            Click any pin to inspect details or launch navigation
          </div>
        </div>
      </div>
    </div>
  );
};

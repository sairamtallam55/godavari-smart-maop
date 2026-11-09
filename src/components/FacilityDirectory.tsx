import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  Phone,
  Clock,
  MapPin,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  ArrowUpDown,
  Accessibility,
} from 'lucide-react';
import { Facility, FacilityCategory, OperationalStatus, VerificationStatus, Language } from '../types';
import { CATEGORIES_META, getStatusBadge, getVerificationBadge } from '../utils/categories';
import { TRANSLATIONS } from '../i18n/translations';

interface FacilityDirectoryProps {
  facilities: Facility[];
  onSelectFacility: (facility: Facility) => void;
  language: Language;
}

export const FacilityDirectory: React.FC<FacilityDirectoryProps> = ({
  facilities,
  onSelectFacility,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedVerification, setSelectedVerification] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [accessibleOnly, setAccessibleOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortField, setSortField] = useState<'name' | 'lastUpdatedAt' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const filteredFacilities = useMemo(() => {
    return facilities
      .filter((f) => {
        if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
        if (selectedStatus !== 'all' && f.operationalStatus !== selectedStatus) return false;
        if (selectedVerification !== 'all' && f.verificationStatus !== selectedVerification) return false;
        if (selectedZone !== 'all' && f.zone !== selectedZone) return false;
        if (accessibleOnly && !f.accessibilityDetails.wheelchairAccessible) return false;
        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            f.name.toLowerCase().includes(q) ||
            f.address.toLowerCase().includes(q) ||
            f.description.toLowerCase().includes(q) ||
            f.services.some((s) => s.toLowerCase().includes(q));
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return 0;
      });
  }, [
    facilities,
    selectedCategory,
    selectedStatus,
    selectedVerification,
    selectedZone,
    accessibleOnly,
    searchQuery,
    sortField,
    sortOrder,
  ]);

  const toggleSort = (field: 'name' | 'lastUpdatedAt' | 'category') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Civic Infrastructure & Facilities Directory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Search and filter all registered facilities for Godavari Pushkaralu 2027 in Rajahmundry & Kovvur.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Data Grid</span>
            </button>
          </div>
        </div>

        {/* Search Input and Multi-Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by facility name, address, services..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORIES_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Statuses</option>
              <option value="operational">Operational</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="temporarily_closed">Temporarily Closed</option>
              <option value="status_unknown">Status Unknown</option>
            </select>
          </div>

          <div>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Zones</option>
              <option value="Central Ghats">Central Ghats</option>
              <option value="North Ghats">North Ghats</option>
              <option value="South Ghats">South Ghats</option>
              <option value="Kovvur Bank">Kovvur Bank</option>
              <option value="Transit Hubs">Transit Hubs</option>
            </select>
          </div>
        </div>

        {/* Auxiliary Toggles and Record Counts */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accessibleOnly}
                onChange={(e) => setAccessibleOnly(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
              />
              <span className="flex items-center gap-1 font-medium">
                <Accessibility className="w-3.5 h-3.5 text-teal-600" />
                Wheelchair Accessible Only
              </span>
            </label>

            <select
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              className="bg-transparent border-0 font-medium text-xs text-slate-500 hover:text-slate-800 focus:ring-0 cursor-pointer"
            >
              <option value="all">Verification: All</option>
              <option value="verified">Verified Official Only</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="demo_data">Demo Records Only</option>
            </select>
          </div>

          <div>
            Showing <span className="font-bold text-slate-900 dark:text-slate-100">{filteredFacilities.length}</span> of {facilities.length} records
          </div>
        </div>
      </div>

      {/* Card Grid View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map((facility) => {
            const catMeta = CATEGORIES_META[facility.category] || CATEGORIES_META.bathing_ghat;
            const statusMeta = getStatusBadge(facility.operationalStatus);
            const verMeta = getVerificationBadge(facility.verificationStatus);

            return (
              <div
                key={facility.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {catMeta.nameEn}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusMeta.bg} ${statusMeta.text}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 leading-snug">
                    {facility.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="line-clamp-1">{facility.address}</span>
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                    {facility.description}
                  </p>

                  {/* Badges strip */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      {facility.zone}
                    </span>
                    {facility.accessibilityDetails.wheelchairAccessible && (
                      <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium flex items-center gap-1">
                        <Accessibility className="w-3 h-3" /> Accessible
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${verMeta.bg} ${verMeta.text}`}>
                      {verMeta.label}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-3 text-center font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-1"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => onSelectFacility(facility)}
                    className="flex-1 py-1.5 px-3 text-center font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* High-Density Data Grid View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  <th
                    onClick={() => toggleSort('name')}
                    className="py-3 px-4 font-semibold cursor-pointer select-none hover:text-slate-900"
                  >
                    <div className="flex items-center gap-1">
                      <span>Facility Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('category')}
                    className="py-3 px-4 font-semibold cursor-pointer select-none hover:text-slate-900"
                  >
                    <div className="flex items-center gap-1">
                      <span>Category</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold">Zone</th>
                  <th className="py-3 px-4 font-semibold">Operational Status</th>
                  <th className="py-3 px-4 font-semibold">Verification</th>
                  <th className="py-3 px-4 font-semibold">Coordinates</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFacilities.map((facility) => {
                  const statusMeta = getStatusBadge(facility.operationalStatus);
                  const verMeta = getVerificationBadge(facility.verificationStatus);
                  const catMeta = CATEGORIES_META[facility.category];

                  return (
                    <tr
                      key={facility.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => onSelectFacility(facility)}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {facility.name}
                        <div className="text-[11px] font-normal text-slate-400 line-clamp-1">
                          {facility.address}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {catMeta?.nameEn || facility.category}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {facility.zone}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${statusMeta.bg} ${statusMeta.text}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${verMeta.bg} ${verMeta.text}`}>
                          {facility.verificationStatus === 'verified' ? 'Verified' : 'Demo Data'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-[11px] text-slate-500 whitespace-nowrap">
                        {facility.latitude.toFixed(4)}, {facility.longitude.toFixed(4)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 mr-2"
                        >
                          Directions
                        </a>
                        <button
                          onClick={() => onSelectFacility(facility)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

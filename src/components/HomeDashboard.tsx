import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Bot,
  HeartPulse,
  Droplet,
  Car,
  Bus,
  ShieldAlert,
  AlertTriangle,
  Megaphone,
  ArrowRight,
  ExternalLink,
  Accessibility,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Facility, Announcement, Language } from '../types';
import { CATEGORIES_META, getStatusBadge } from '../utils/categories';
import { TRANSLATIONS } from '../i18n/translations';

interface HomeDashboardProps {
  facilities: Facility[];
  announcements: Announcement[];
  onNavigate: (tab: string, categoryFilter?: string) => void;
  onSelectFacility: (facility: Facility) => void;
  onRequestUserLocation: () => void;
  language: Language;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  facilities,
  announcements,
  onNavigate,
  onSelectFacility,
  onRequestUserLocation,
  language,
}) => {
  const [quickSearch, setQuickSearch] = useState('');
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const quickCategories = [
    { key: 'bathing_ghat', name: t.cat_bathing_ghat, icon: 'Waves', color: 'from-cyan-600 to-teal-700' },
    { key: 'drinking_water', name: t.cat_drinking_water, icon: 'Droplet', color: 'from-sky-600 to-blue-700' },
    { key: 'toilet', name: t.cat_toilet, icon: 'Sparkles', color: 'from-teal-600 to-emerald-700' },
    { key: 'hospital', name: t.cat_hospital, icon: 'HeartPulse', color: 'from-rose-600 to-red-700' },
    { key: 'parking', name: t.cat_parking, icon: 'Car', color: 'from-amber-600 to-orange-700' },
    { key: 'bus_stop', name: t.cat_bus_stop, icon: 'Bus', color: 'from-blue-600 to-indigo-700' },
    { key: 'police', name: t.cat_police, icon: 'ShieldAlert', color: 'from-slate-700 to-slate-900' },
    { key: 'accessibility_help', name: t.cat_accessibility_help, icon: 'Accessibility', color: 'from-purple-600 to-indigo-800' },
  ];

  const recentUpdates = [...facilities]
    .sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime())
    .slice(0, 4);

  const activeAdvisories = announcements.filter((a) => a.active).slice(0, 2);

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 text-white p-6 md:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>Godavari Pushkaralu 2027 • Rajamahendravaram & Kovvur</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Find Every Facility. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-sky-300 to-teal-100">
              Navigate with Confidence.
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
            GIS-based civic facility discovery and live status monitoring for millions of pilgrims visiting sacred Godavari bathing ghats, emergency centers, clean toilets, and free shuttles.
          </p>

          {/* Quick Search & Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('map')}
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-teal-500/20"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Interactive GIS Map</span>
            </button>

            <button
              onClick={() => {
                onRequestUserLocation();
                onNavigate('nearby');
              }}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 backdrop-blur-md transition-all"
            >
              <Navigation className="w-4 h-4 text-sky-400" />
              <span>Find Nearby Facilities</span>
            </button>

            <button
              onClick={() => onNavigate('assistant')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 backdrop-blur-md transition-all"
            >
              <Bot className="w-4 h-4 text-teal-300" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>

        {/* River Watermark Background Subtle Curve */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none w-96 h-96 transform translate-x-1/4 translate-y-1/4">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-teal-400">
            <path d="M47.7,-57.2C59.9,-47.3,66.8,-31.4,69.5,-15.1C72.2,1.2,70.7,17.9,62.9,31.2C55.1,44.5,41,54.4,25.8,61.1C10.6,67.8,-5.7,71.3,-21.8,67.5C-37.9,63.7,-53.8,52.6,-63.3,37.6C-72.8,22.6,-75.9,3.7,-71.4,-12.8C-66.9,-29.3,-54.8,-43.4,-40.8,-52.8C-26.8,-62.2,-10.9,-66.9,4.3,-72C19.5,-77.1,35.5,-67.1,47.7,-57.2Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>

      {/* Emergency Helpline Banner */}
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-600 text-white font-bold shrink-0">
            SOS
          </div>
          <div>
            <span className="font-bold text-rose-900 dark:text-rose-200 block">
              24x7 Pushkaralu Emergency Control Command:
            </span>
            <span className="text-rose-700 dark:text-rose-300">
              Medical Triage: <span className="font-bold underline">108</span> · Police Control Room: <span className="font-bold underline">100 / 112</span> · River Rescue: <span className="font-bold underline">+91 883 2470100</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('map', 'hospital')}
          className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold self-start sm:self-auto shrink-0 shadow-xs"
        >
          View Hospitals & First Aid
        </button>
      </div>

      {/* Quick Category Shortcuts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.quickCategories}
          </h3>
          <button
            onClick={() => onNavigate('directory')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onNavigate('map', cat.key)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all text-left flex flex-col justify-between group"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center shadow-xs mb-3 group-hover:scale-105 transition-transform`}>
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                  {cat.name}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  {facilities.filter((f) => f.category === cat.key).length} facilities
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Public Advisories & Recently Updated Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Public Advisories */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Official Crowd & Transport Advisories
              </h3>
            </div>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs text-teal-600 font-semibold hover:underline"
            >
              All Notices
            </button>
          </div>

          <div className="space-y-3">
            {activeAdvisories.map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                    {ann.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-400">
                    {new Date(ann.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">
                  {language === 'te' && ann.titleTe ? ann.titleTe : ann.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                  {language === 'te' && ann.messageTe ? ann.messageTe : ann.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Updated Facilities */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Live Status Updates by Operators
              </h3>
            </div>
            <button
              onClick={() => onNavigate('directory')}
              className="text-xs text-teal-600 font-semibold hover:underline"
            >
              View Directory
            </button>
          </div>

          <div className="space-y-2.5">
            {recentUpdates.map((fac) => {
              const statusMeta = getStatusBadge(fac.operationalStatus);
              return (
                <div
                  key={fac.id}
                  onClick={() => onSelectFacility(fac)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 max-w-[70%]">
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {fac.name}
                    </h5>
                    <p className="text-[11px] text-slate-500 truncate">
                      {fac.zone} · {fac.address}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${statusMeta.bg} ${statusMeta.text}`}>
                      {statusMeta.label}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {new Date(fac.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  BarChart3,
  PieChart,
  ShieldAlert,
  Activity,
  Layers,
  CheckCircle,
  AlertTriangle,
  MapPin,
  TrendingUp,
  FileCheck2,
  Accessibility,
} from 'lucide-react';
import { Facility, Language } from '../types';
import { CATEGORIES_META } from '../utils/categories';

interface AnalyticsDashboardProps {
  facilities: Facility[];
  openFeedbackCount: number;
  maintenanceCount: number;
  language: Language;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  facilities,
  openFeedbackCount,
  maintenanceCount,
  language,
}) => {
  const total = facilities.length;
  const operational = facilities.filter((f) => f.operationalStatus === 'operational').length;
  const maintenance = facilities.filter((f) => f.operationalStatus === 'maintenance').length;
  const closed = facilities.filter((f) => f.operationalStatus === 'temporarily_closed').length;
  const unknown = facilities.filter((f) => f.operationalStatus === 'status_unknown').length;

  const verified = facilities.filter((f) => f.verificationStatus === 'verified').length;
  const pending = facilities.filter((f) => f.verificationStatus === 'pending_verification').length;
  const demo = facilities.filter((f) => f.verificationStatus === 'demo_data').length;

  const accessible = facilities.filter((f) => f.accessibilityDetails.wheelchairAccessible).length;
  const rampCount = facilities.filter((f) => f.accessibilityDetails.rampAvailable).length;

  // Category counts
  const categoryCounts = Object.keys(CATEGORIES_META).map((catKey) => {
    const count = facilities.filter((f) => f.category === catKey).length;
    const meta = CATEGORIES_META[catKey as keyof typeof CATEGORIES_META];
    return {
      key: catKey,
      name: meta?.nameEn || catKey,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
      pinColor: meta?.pinColor || '#0284c7',
    };
  }).sort((a, b) => b.count - a.count);

  // Zone counts
  const zones = ['Central Ghats', 'North Ghats', 'South Ghats', 'Kovvur Bank', 'Transit Hubs'] as const;
  const zoneStats = zones.map((zone) => {
    const list = facilities.filter((f) => f.zone === zone);
    const opCount = list.filter((f) => f.operationalStatus === 'operational').length;
    return {
      zone,
      total: list.length,
      operational: opCount,
      rate: list.length > 0 ? Math.round((opCount / list.length) * 100) : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Infrastructure Coverage & Capacity Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Geospatial distribution, operational readiness metrics, and accessibility coverage for Godavari Pushkaralu 2027.
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
              DEMO MODE ACTIVE · SYNTHETIC ANALYTICS
            </span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium block mb-1">Total Facilities</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {total}
            </div>
            <div className="text-[11px] text-teal-600 mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>{operational} Currently Operational</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium block mb-1">Operational Readiness</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {total > 0 ? Math.round((operational / total) * 100) : 0}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {maintenance} maintenance · {closed} closed
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium block mb-1">Official Verification</span>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
              {total > 0 ? Math.round((verified / total) * 100) : 0}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {verified} verified · {demo} demo records
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium block mb-1">Active Incident Reports</span>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
              {openFeedbackCount + maintenanceCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {openFeedbackCount} user reports · {maintenanceCount} tickets
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Category Breakdown & Zone Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-teal-600" />
              <span>Facility Category Distribution</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">13 categories</span>
          </div>

          <div className="space-y-2.5">
            {categoryCounts.map((cat) => (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {cat.name}
                  </span>
                  <span className="font-mono text-slate-500">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{cat.count}</span> ({cat.pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.pct}%`,
                      backgroundColor: cat.pinColor,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Zones & Readiness */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Geographic Sector Infrastructure</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">5 sectors</span>
            </div>

            <div className="space-y-3">
              {zoneStats.map((z) => (
                <div
                  key={z.zone}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">{z.zone}</h5>
                    <p className="text-[11px] text-slate-500">
                      {z.total} registered facilities ({z.operational} operational)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-600 text-sm">
                      {z.rate}%
                    </div>
                    <span className="text-[10px] text-slate-400">Readiness</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Gap Insights */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Coverage & Accessibility Analysis</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 flex items-start gap-2">
                <Accessibility className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    Wheelchair Accessibility: {accessible} of {total} facilities ({Math.round((accessible / total) * 100)}%)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Main Pushkar Ghat, GGH Hospital, and Arts College parking provide full barrier-free ramps.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    Coverage Notice for Kovvur Bank:
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Kovvur Western riverbank has 2 facilities (Ghat + Parking). Additional mobile first-aid units recommended for peak pilgrimage dates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

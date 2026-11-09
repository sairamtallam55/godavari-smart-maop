import React, { useState } from 'react';
import {
  Megaphone,
  AlertTriangle,
  Info,
  Clock,
  ShieldAlert,
  Bus,
  Droplet,
  HeartPulse,
  Filter,
} from 'lucide-react';
import { Announcement, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  language: Language;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  language,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const filtered = announcements.filter((ann) => {
    if (selectedCategory !== 'all' && ann.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'transport':
        return <Bus className="w-4 h-4 text-blue-500" />;
      case 'medical':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'water_sanitation':
        return <Droplet className="w-4 h-4 text-sky-500" />;
      case 'ghat_flow':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-teal-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Megaphone className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Public Announcements & Crowd Advisories
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official real-time updates on ghat congestion, transport schedules, and safety protocols.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Filter:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Announcements ({announcements.length})</option>
            <option value="safety">Safety & Security</option>
            <option value="transport">Transit & Shuttles</option>
            <option value="ghat_flow">Ghat Flow & Density</option>
            <option value="water_sanitation">Water & Sanitation</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map((ann) => {
          // Select localized text if available
          let title = ann.title;
          let message = ann.message;
          if (language === 'te' && ann.titleTe) {
            title = ann.titleTe;
            message = ann.messageTe || ann.message;
          } else if (language === 'hi' && ann.titleHi) {
            title = ann.titleHi;
            message = ann.messageHi || ann.message;
          }

          const isAlert = ann.severity === 'alert' || ann.severity === 'emergency';

          return (
            <div
              key={ann.id}
              className={`p-5 rounded-2xl border transition-all ${
                isAlert
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              } shadow-sm space-y-3`}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                    {getCategoryIcon(ann.category)}
                  </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                    {ann.category.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(ann.publishedAt).toLocaleDateString()} at {new Date(ann.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                  {title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Multilingual preview if not in primary language */}
              {language !== 'te' && ann.titleTe && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-teal-800 dark:text-teal-300 font-medium">
                  తెలుగు: {ann.titleTe}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

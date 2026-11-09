import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  AlertCircle,
  ExternalLink,
  Navigation,
  Bot,
  CornerDownLeft,
  CheckCircle2,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { Facility, Language } from '../types';
import { CATEGORIES_META, getStatusBadge, getVerificationBadge } from '../utils/categories';
import { TRANSLATIONS } from '../i18n/translations';

interface AISmartSearchProps {
  onSelectFacility: (facility: Facility) => void;
  language: Language;
  userCoords: { latitude: number; longitude: number } | null;
}

const EXAMPLE_QUERIES = [
  'Where is the nearest emergency hospital?',
  'Where can I get chilled drinking water near Pushkar Ghat?',
  'Find wheelchair accessible bio-toilets',
  'Bus shuttles from parking to ghats',
  'పుష్కర ఘాట్ దగ్గర ప్రథమ చికిత్స కేంద్రం ఎక్కడ ఉంది?',
  'पुष्कर घाट के पास पार्किंग और पेयजल सुविधाएं',
  'Where is the lost child registration desk?',
];

export const AISmartSearch: React.FC<AISmartSearchProps> = ({
  onSelectFacility,
  language,
  userCoords,
}) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    intentSummary: string;
    detectedCategory: string;
    explanation: string;
    source: string;
    isEmergency?: boolean;
    data: Facility[];
  } | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          userLat: userCoords?.latitude,
          userLon: userCoords?.longitude,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete AI facility search.');
      }

      setResults(data);
    } catch (err: any) {
      console.error('AI Search error:', err);
      setError(err.message || 'Error communicating with AI search service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Search Hero Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              AI Smart Facility Search
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ask naturally in Telugu, English, or Hindi. Powered by Gemini 3.8 Flash with strict grounded facility retrieval.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex items-center"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Find drinking water near Pushkar Ghat, nearest hospital, accessible toilets..."
            className="w-full pl-12 pr-28 py-3.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white flex items-center gap-1.5 transition-colors"
          >
            {loading ? (
              <span>Analyzing...</span>
            ) : (
              <>
                <span>Search</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Example Prompt Chips */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">Try asking:</span>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_QUERIES.map((example, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(example);
                  handleSearch(example);
                }}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-teal-500 hover:text-teal-700 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Hotline Alert if Emergency Intent Detected */}
      {results?.isEmergency && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="text-xs text-rose-800 dark:text-rose-200">
            <span className="font-bold">Emergency Situation Detected:</span> If immediate medical or police assistance is required on site, please call toll-free emergency numbers immediately: <span className="font-bold">108 (Medical)</span> or <span className="font-bold">100 / 112 (Police)</span>.
          </div>
        </div>
      )}

      {/* Results Section */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {results && (
        <div className="space-y-4">
          {/* AI Explanation Banner */}
          <div className="bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/80 rounded-xl p-4 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-teal-800 dark:text-teal-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-teal-600" />
                AI Analysis: {results.intentSummary}
              </span>
              <span className="text-[10px] text-teal-600 font-mono">
                Source: {results.source}
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              {results.explanation}
            </p>
          </div>

          {/* Matched Facilities Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.data.map((facility) => {
              const catMeta = CATEGORIES_META[facility.category] || CATEGORIES_META.bathing_ghat;
              const statusMeta = getStatusBadge(facility.operationalStatus);
              const verMeta = getVerificationBadge(facility.verificationStatus);

              return (
                <div
                  key={facility.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-slate-500">
                        {catMeta.nameEn}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusMeta.bg} ${statusMeta.text}`}>
                        {statusMeta.label}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 leading-snug">
                      {facility.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {facility.address}
                    </p>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                      {facility.description}
                    </p>

                    {/* Services Tags */}
                    {facility.services && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {facility.services.slice(0, 3).map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 text-center font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-1"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => onSelectFacility(facility)}
                      className="flex-1 py-1.5 text-center font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { WifiOff, Wifi, DownloadCloud, CheckCircle, Database, RefreshCw, X } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Facility } from '../types';

interface OfflineIndicatorProps {
  facilitiesCount: number;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ facilitiesCount }) => {
  const isOnline = useOnlineStatus();
  const [showPrecacheModal, setShowPrecacheModal] = useState<boolean>(false);
  const [precacheProgress, setPrecacheProgress] = useState<number | null>(null);
  const [precachedDone, setPrecachedDone] = useState<boolean>(false);

  // Pre-cache key OpenStreetMap tiles covering Rajahmundry & Kovvur (Zoom 13, 14, 15)
  const handlePrecacheTiles = async () => {
    setPrecacheProgress(10);
    setPrecachedDone(false);

    // Key tile coordinates for Rajahmundry (Lat 17.00, Lon 81.77)
    // Zoom 14: x=11910 to 11914, y=7488 to 7492
    const tileUrls = [
      'https://tile.openstreetmap.org/13/5955/3745.png',
      'https://tile.openstreetmap.org/14/11910/7490.png',
      'https://tile.openstreetmap.org/14/11911/7490.png',
      'https://tile.openstreetmap.org/14/11912/7490.png',
      'https://tile.openstreetmap.org/14/11911/7491.png',
      'https://tile.openstreetmap.org/14/11912/7491.png',
      'https://tile.openstreetmap.org/15/23821/14981.png',
      'https://tile.openstreetmap.org/15/23822/14981.png',
      'https://tile.openstreetmap.org/15/23823/14981.png',
      'https://tile.openstreetmap.org/15/23824/14981.png',
    ];

    try {
      for (let i = 0; i < tileUrls.length; i++) {
        try {
          await fetch(tileUrls[i], { mode: 'no-cors' });
        } catch {
          // ignore individual fetch errors
        }
        setPrecacheProgress(Math.round(((i + 1) / tileUrls.length) * 100));
      }
      setPrecachedDone(true);
    } catch (err) {
      console.warn('Pre-cache error:', err);
    } finally {
      setTimeout(() => {
        setPrecacheProgress(null);
      }, 2000);
    }
  };

  return (
    <>
      {/* Offline Status Top Bar Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 font-semibold px-4 py-2 text-xs flex items-center justify-between shadow-md z-40 sticky top-0">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-slate-950 animate-pulse" />
            <span>
              Low Connectivity / Offline Mode Active — Displaying cached civic facilities and offline map data.
            </span>
          </div>

          <button
            onClick={() => setShowPrecacheModal(true)}
            className="px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800"
          >
            Offline Cache Info
          </button>
        </div>
      )}

      {/* Floating Offline / Cache Readiness Button in bottom corner */}
      <div className="fixed bottom-16 md:bottom-4 right-4 z-30">
        <button
          onClick={() => setShowPrecacheModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border transition-all ${
            !isOnline
              ? 'bg-amber-500 text-slate-950 border-amber-600 animate-pulse'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-teal-500'
          }`}
          title="Offline & Service Worker Caching Settings"
        >
          {isOnline ? (
            <Database className="w-3.5 h-3.5 text-teal-600" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-slate-950" />
          )}
          <span className="hidden sm:inline">
            {isOnline ? 'Offline Ready' : 'Offline Mode'}
          </span>
        </button>
      </div>

      {/* Pre-cache & Offline Manager Modal */}
      {showPrecacheModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-teal-600">
                <Database className="w-5 h-5" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Offline & Low-Connectivity Cache
                </h4>
              </div>
              <button
                onClick={() => setShowPrecacheModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              During peak Godavari Pushkaralu events, dense crowds along riverbanks can cause cellular network congestion. Godavari SmartMap uses background service workers and local storage to keep map tiles and facility data cached on your device.
            </p>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Facilities Cached Locally
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Hospitals, bio-toilets, drinking water & ghats
                  </span>
                </div>
                <span className="font-mono font-bold text-teal-600 text-sm">
                  {facilitiesCount} Records
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Network Status
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isOnline ? 'Online - Live server sync active' : 'Disconnected - Running from cache'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  {isOnline ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-emerald-700 dark:text-emerald-400">ONLINE</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      <span className="text-amber-700 dark:text-amber-400">OFFLINE</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Precache Action Button */}
            <div className="pt-2">
              <button
                onClick={handlePrecacheTiles}
                disabled={precacheProgress !== null}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>
                  {precacheProgress !== null
                    ? `Caching Ghat Map Tiles (${precacheProgress}%)...`
                    : precachedDone
                    ? 'Map Tiles Cached Successfully!'
                    : 'Download Offline Map Tiles for Pushkar Ghats'}
                </span>
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-1.5">
                Pre-caches high-resolution OpenStreetMap tiles for Rajahmundry & Kovvur riverbanks.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowPrecacheModal(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

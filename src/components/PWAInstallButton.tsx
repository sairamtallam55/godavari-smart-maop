import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors"
        title="Install Godavari SmartMap app to your device"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-600" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xs w-full p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Install on iPhone / iPad
                </h4>
                <button onClick={() => setShowIOSGuide(false)} className="text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <p>1. Tap the <strong>Share</strong> button in your Safari toolbar.</p>
                <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                <p>3. Godavari SmartMap will launch with full offline facility access.</p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

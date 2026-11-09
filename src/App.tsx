import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Bot,
  Grid,
  BarChart3,
  Megaphone,
  Flag,
  Wrench,
  ShieldCheck,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import {
  Facility,
  FacilityOperator,
  FacilityFeedback,
  MaintenanceReport,
  Announcement,
  AuditLog,
  UserRole,
  Language,
  OperationalStatus,
  FeedbackType,
} from './types';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { InteractiveMap } from './components/InteractiveMap';
import { NearbyFacilities } from './components/NearbyFacilities';
import { FacilityDirectory } from './components/FacilityDirectory';
import { AISmartSearch } from './components/AISmartSearch';
import { PilgrimAssistant } from './components/PilgrimAssistant';
import { FacilityDetailModal } from './components/FacilityDetailModal';
import { AdminDashboard } from './components/AdminDashboard';
import { OperatorDashboard } from './components/OperatorDashboard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AnnouncementsView } from './components/AnnouncementsView';
import { FeedbackModal } from './components/FeedbackModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { TRANSLATIONS } from './i18n/translations';

import {
  INITIAL_FACILITIES,
  INITIAL_OPERATORS,
  INITIAL_FEEDBACK,
  INITIAL_MAINTENANCE,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
} from './data/seedData';

export default function App() {
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [operators, setOperators] = useState<FacilityOperator[]>(INITIAL_OPERATORS);
  const [feedbackList, setFeedbackList] = useState<FacilityFeedback[]>(INITIAL_FEEDBACK);
  const [maintenanceReports, setMaintenanceReports] = useState<MaintenanceReport[]>(INITIAL_MAINTENANCE);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const [activeTab, setActiveTab] = useState<string>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [role, setRole] = useState<UserRole>('pilgrim');
  const [loading, setLoading] = useState<boolean>(true);

  // Modal / Selected Item States
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [reportingFacility, setReportingFacility] = useState<Facility | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [mapInitialCategory, setMapInitialCategory] = useState<string>('all');

  // GPS Location State
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState<string>('Pushkar Ghat Promenade (Central)');
  const [showGpsExplainer, setShowGpsExplainer] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Load initial data from server APIs
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [facRes, annRes, fbRes, opRes, maintRes, auditRes] = await Promise.all([
        fetch('/api/facilities'),
        fetch('/api/announcements'),
        fetch('/api/feedback'),
        fetch('/api/operators'),
        fetch('/api/maintenance'),
        fetch('/api/audit-logs'),
      ]);

      const [facData, annData, fbData, opData, maintData, auditData] = await Promise.all([
        facRes.json(),
        annRes.json(),
        fbRes.json(),
        opRes.json(),
        maintRes.json(),
        auditRes.json(),
      ]);

      if (facData.success) {
        setFacilities(facData.data);
        try {
          localStorage.setItem('godavari_cached_facilities', JSON.stringify(facData.data));
        } catch {}
      }
      if (annData.success) {
        setAnnouncements(annData.data);
        try {
          localStorage.setItem('godavari_cached_announcements', JSON.stringify(annData.data));
        } catch {}
      }
      if (fbData.success) setFeedbackList(fbData.data);
      if (opData.success) setOperators(opData.data);
      if (maintData.success) setMaintenanceReports(maintData.data);
      if (auditData.success) setAuditLogs(auditData.data);
    } catch (err) {
      console.warn('Network offline or degraded. Restoring from local offline cache:', err);
      try {
        const cached = localStorage.getItem('godavari_cached_facilities');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFacilities(parsed);
          }
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const cached = localStorage.getItem('godavari_cached_facilities');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFacilities(parsed);
        }
      }
    } catch {}
    loadInitialData();
  }, []);

  // Geolocation Handler
  const requestGeolocation = () => {
    setShowGpsExplainer(true);
  };

  const confirmAndAcquireGps = () => {
    setShowGpsExplainer(false);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setCurrentLocationName('Live GPS Location');
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setGpsError('GPS permission was denied or unavailable. Falling back to Central Pushkar Ghats landmark.');
        // Fallback default: Pushkar Ghat Central
        setUserCoords({ latitude: 17.0008, longitude: 81.7765 });
        setCurrentLocationName('Pushkar Ghat Promenade (Fallback)');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSetManualLocation = (lat: number, lon: number, name: string) => {
    setUserCoords({ latitude: lat, longitude: lon });
    setCurrentLocationName(name);
  };

  // Facility Actions
  const handleAddFacility = async (facilityData: Partial<Facility>) => {
    const res = await fetch('/api/facilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facilityData),
    });
    const data = await res.json();
    if (data.success) {
      setFacilities((prev) => [data.data, ...prev]);
      loadInitialData();
    }
  };

  const handleEditFacility = async (id: string, facilityData: Partial<Facility>) => {
    const res = await fetch(`/api/facilities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facilityData),
    });
    const data = await res.json();
    if (data.success) {
      setFacilities((prev) => prev.map((f) => (f.id === id ? data.data : f)));
      loadInitialData();
    }
  };

  const handleDeleteFacility = async (id: string) => {
    const res = await fetch(`/api/facilities/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setFacilities((prev) => prev.filter((f) => f.id !== id));
      loadInitialData();
    }
  };

  const handleUpdateStatus = async (
    facilityId: string,
    status: OperationalStatus,
    notes: string,
    operatorName: string
  ) => {
    const res = await fetch(`/api/facilities/${facilityId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes, updatedBy: operatorName, role }),
    });
    const data = await res.json();
    if (data.success) {
      setFacilities((prev) => prev.map((f) => (f.id === facilityId ? data.data : f)));
      loadInitialData();
    }
  };

  const handleSubmitFeedback = async (feedbackData: {
    facilityId: string;
    facilityName: string;
    feedbackType: FeedbackType;
    description: string;
    reporterName?: string;
    reporterContact?: string;
  }) => {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
    const data = await res.json();
    if (data.success) {
      setFeedbackList((prev) => [data.data, ...prev]);
      return { referenceId: data.referenceId };
    }
    throw new Error(data.error || 'Failed to submit report');
  };

  const handleUpdateFeedbackStatus = async (id: string, status: string, notes?: string) => {
    const res = await fetch(`/api/feedback/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes: notes }),
    });
    const data = await res.json();
    if (data.success) {
      setFeedbackList((prev) => prev.map((fb) => (fb.id === id ? data.data : fb)));
      loadInitialData();
    }
  };

  const handleCreateAnnouncement = async (annData: Partial<Announcement>) => {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(annData),
    });
    const data = await res.json();
    if (data.success) {
      setAnnouncements((prev) => [data.data, ...prev]);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleCreateMaintenance = async (reportData: Partial<MaintenanceReport>) => {
    const res = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    const data = await res.json();
    if (data.success) {
      setMaintenanceReports((prev) => [data.data, ...prev]);
    }
  };

  const handleResetDemo = async () => {
    await fetch('/api/reset-demo', { method: 'POST' });
    await loadInitialData();
  };

  const navigateToMapWithCategory = (cat: string) => {
    setMapInitialCategory(cat);
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        onLanguageChange={setLanguage}
        role={role}
        onRoleChange={setRole}
        unreadAnnouncementsCount={announcements.filter((a) => a.active).length}
      />

      {/* Offline Status & Pre-cache Manager */}
      <OfflineIndicator facilitiesCount={facilities.length} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-12">
        {gpsError && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{gpsError}</span>
            </div>
            <button onClick={() => setGpsError(null)} className="text-amber-600 font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Home Dashboard */}
        {activeTab === 'home' && (
          <HomeDashboard
            facilities={facilities}
            announcements={announcements}
            onNavigate={(tab, cat) => {
              if (cat) {
                navigateToMapWithCategory(cat);
              } else {
                setActiveTab(tab);
              }
            }}
            onSelectFacility={(fac) => setSelectedFacility(fac)}
            onRequestUserLocation={requestGeolocation}
            language={language}
          />
        )}

        {/* Tab 2: Interactive GIS Map */}
        {activeTab === 'map' && (
          <InteractiveMap
            facilities={facilities}
            selectedFacility={selectedFacility}
            onSelectFacility={(fac) => setSelectedFacility(fac)}
            language={language}
            userCoords={userCoords}
            onRequestUserLocation={requestGeolocation}
            initialCategory={mapInitialCategory}
          />
        )}

        {/* Tab 3: Nearby Facilities */}
        {activeTab === 'nearby' && (
          <NearbyFacilities
            facilities={facilities}
            userCoords={userCoords}
            onRequestUserLocation={requestGeolocation}
            onSetManualLocation={handleSetManualLocation}
            currentLocationName={currentLocationName}
            onSelectFacility={(fac) => setSelectedFacility(fac)}
            language={language}
          />
        )}

        {/* Tab 4: Facility Directory */}
        {activeTab === 'directory' && (
          <FacilityDirectory
            facilities={facilities}
            onSelectFacility={(fac) => setSelectedFacility(fac)}
            language={language}
          />
        )}

        {/* Tab 5: AI Smart Search */}
        {activeTab === 'ai-search' && (
          <AISmartSearch
            onSelectFacility={(fac) => setSelectedFacility(fac)}
            language={language}
            userCoords={userCoords}
          />
        )}

        {/* Tab 6: Pilgrim Assistant */}
        {activeTab === 'assistant' && (
          <PilgrimAssistant
            language={language}
            onLanguageChange={setLanguage}
            userCoords={userCoords}
          />
        )}

        {/* Tab 7: Admin Dashboard */}
        {activeTab === 'admin' && (
          <AdminDashboard
            facilities={facilities}
            feedbackList={feedbackList}
            auditLogs={auditLogs}
            announcements={announcements}
            onAddFacility={handleAddFacility}
            onEditFacility={handleEditFacility}
            onDeleteFacility={handleDeleteFacility}
            onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
            onCreateAnnouncement={handleCreateAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            onResetDemo={handleResetDemo}
            language={language}
          />
        )}

        {/* Tab 8: Operator Console */}
        {activeTab === 'operator' && (
          <OperatorDashboard
            facilities={facilities}
            operators={operators}
            feedbackList={feedbackList}
            maintenanceReports={maintenanceReports}
            onUpdateStatus={handleUpdateStatus}
            onCreateMaintenanceReport={handleCreateMaintenance}
            language={language}
          />
        )}

        {/* Tab 9: Analytics */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            facilities={facilities}
            openFeedbackCount={feedbackList.filter((fb) => fb.status === 'pending').length}
            maintenanceCount={maintenanceReports.filter((m) => m.status !== 'resolved').length}
            language={language}
          />
        )}

        {/* Tab 10: Announcements */}
        {activeTab === 'announcements' && (
          <AnnouncementsView
            announcements={announcements}
            language={language}
          />
        )}

        {/* Tab 11: Feedback Page */}
        {activeTab === 'feedback' && (
          <div className="max-w-xl mx-auto py-6">
            <FeedbackModal
              facility={null}
              onClose={() => setActiveTab('home')}
              onSubmitFeedback={handleSubmitFeedback}
              language={language}
            />
          </div>
        )}
      </main>

      {/* Facility Detail Modal */}
      {selectedFacility && (
        <FacilityDetailModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
          onOpenMap={(fac) => {
            setSelectedFacility(fac);
            setActiveTab('map');
          }}
          onReportIssue={(fac) => {
            setReportingFacility(fac);
            setShowFeedbackModal(true);
          }}
          userCoords={userCoords}
          language={language}
        />
      )}

      {/* User Issue Reporting Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          facility={reportingFacility}
          onClose={() => {
            setShowFeedbackModal(false);
            setReportingFacility(null);
          }}
          onSubmitFeedback={handleSubmitFeedback}
          language={language}
        />
      )}

      {/* GPS Explainer Dialog (Mandatory Privacy Rule) */}
      {showGpsExplainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Why We Request Your Location
            </h4>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Godavari SmartMap uses your GPS coordinates exclusively on your device to calculate accurate distances to emergency medical posts, clean drinking water points, bio-toilets, and shuttle stops in Rajahmundry & Kovvur.
            </p>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
              Your location is never stored permanently on our servers or shared with third parties.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowGpsExplainer(false);
                  setUserCoords({ latitude: 17.0008, longitude: 81.7765 });
                  setCurrentLocationName('Pushkar Ghat (Manual Fallback)');
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600"
              >
                Use Landmark Instead
              </button>
              <button
                onClick={confirmAndAcquireGps}
                className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs"
              >
                Allow GPS Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Friendly Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around text-[10px] font-semibold text-slate-600 dark:text-slate-300">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 p-1 ${activeTab === 'home' ? 'text-teal-600 font-bold' : ''}`}
        >
          <MapPin className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-0.5 p-1 ${activeTab === 'map' ? 'text-teal-600 font-bold' : ''}`}
        >
          <Compass className="w-4 h-4" />
          <span>GIS Map</span>
        </button>

        <button
          onClick={() => {
            requestGeolocation();
            setActiveTab('nearby');
          }}
          className={`flex flex-col items-center gap-0.5 p-1 ${activeTab === 'nearby' ? 'text-teal-600 font-bold' : ''}`}
        >
          <Navigation className="w-4 h-4" />
          <span>Nearby</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-search')}
          className={`flex flex-col items-center gap-0.5 p-1 ${activeTab === 'ai-search' ? 'text-teal-600 font-bold' : ''}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Search</span>
        </button>

        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex flex-col items-center gap-0.5 p-1 ${activeTab === 'assistant' ? 'text-teal-600 font-bold' : ''}`}
        >
          <Bot className="w-4 h-4" />
          <span>Assistant</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-600 dark:text-slate-400 font-medium">
            <span>Godavari SmartMap GIS</span>
            <span>·</span>
            <span>Pushkaralu 2027 Infrastructure Platform</span>
            <span>·</span>
            <button onClick={() => setActiveTab('feedback')} className="hover:text-teal-600">
              Report Feedback
            </button>
            <span>·</span>
            <button onClick={() => setActiveTab('announcements')} className="hover:text-teal-600">
              Public Alerts
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            DEMO DATA — NOT OFFICIAL — NOT LIVE. Designed for simulation and facility discovery planning during Godavari Pushkaralu in Andhra Pradesh.
          </p>
        </div>
      </footer>
    </div>
  );
}

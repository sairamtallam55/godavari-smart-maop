import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  FileSpreadsheet,
  Download,
  RotateCcw,
  Search,
  Sliders,
  Check,
  X,
  Megaphone,
  MessageSquare,
  Building,
} from 'lucide-react';
import {
  Facility,
  FacilityCategory,
  OperationalStatus,
  VerificationStatus,
  FacilityFeedback,
  AuditLog,
  Announcement,
  Language,
} from '../types';
import { CATEGORIES_META, getStatusBadge, getVerificationBadge } from '../utils/categories';
import { TRANSLATIONS } from '../i18n/translations';

interface AdminDashboardProps {
  facilities: Facility[];
  feedbackList: FacilityFeedback[];
  auditLogs: AuditLog[];
  announcements: Announcement[];
  onAddFacility: (facilityData: Partial<Facility>) => Promise<void>;
  onEditFacility: (id: string, facilityData: Partial<Facility>) => Promise<void>;
  onDeleteFacility: (id: string) => Promise<void>;
  onUpdateFeedbackStatus: (id: string, status: string, notes?: string) => Promise<void>;
  onCreateAnnouncement: (data: Partial<Announcement>) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
  onResetDemo: () => Promise<void>;
  language: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  facilities,
  feedbackList,
  auditLogs,
  announcements,
  onAddFacility,
  onEditFacility,
  onDeleteFacility,
  onUpdateFeedbackStatus,
  onCreateAnnouncement,
  onDeleteAnnouncement,
  onResetDemo,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'facilities' | 'feedback' | 'announcements' | 'audit'>('facilities');
  const [facilitySearch, setFacilitySearch] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [deletingFacilityId, setDeletingFacilityId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Form State for Add / Edit Facility
  const [formData, setFormData] = useState({
    name: '',
    category: 'hospital' as FacilityCategory,
    zone: 'Central Ghats' as any,
    address: '',
    latitude: '17.0008',
    longitude: '81.7765',
    description: '',
    contactNumber: '',
    operationalStatus: 'operational' as OperationalStatus,
    verificationStatus: 'verified' as VerificationStatus,
    services: 'Emergency Care, First Aid, Ambulance Standby',
    wheelchairAccessible: true,
    rampAvailable: true,
    elderlyAssistance: true,
    capacity: '',
    notes: '',
  });

  // Announcement Form State
  const [showAnnounceModal, setShowAnnounceModal] = useState<boolean>(false);
  const [annFormData, setAnnFormData] = useState({
    title: '',
    message: '',
    titleTe: '',
    messageTe: '',
    category: 'safety' as any,
    severity: 'info' as any,
  });

  const openAddModal = () => {
    setEditingFacility(null);
    setFormData({
      name: '',
      category: 'hospital',
      zone: 'Central Ghats',
      address: '',
      latitude: '17.0008',
      longitude: '81.7765',
      description: '',
      contactNumber: '+91 883 2470108',
      operationalStatus: 'operational',
      verificationStatus: 'verified',
      services: 'Emergency Care, First Aid, Ambulance Standby',
      wheelchairAccessible: true,
      rampAvailable: true,
      elderlyAssistance: true,
      capacity: '50 Beds',
      notes: '',
    });
    setShowAddModal(true);
  };

  const openEditModal = (fac: Facility) => {
    setEditingFacility(fac);
    setFormData({
      name: fac.name,
      category: fac.category,
      zone: fac.zone,
      address: fac.address,
      latitude: fac.latitude.toString(),
      longitude: fac.longitude.toString(),
      description: fac.description,
      contactNumber: fac.contactNumber || '',
      operationalStatus: fac.operationalStatus,
      verificationStatus: fac.verificationStatus,
      services: fac.services.join(', '),
      wheelchairAccessible: fac.accessibilityDetails.wheelchairAccessible,
      rampAvailable: fac.accessibilityDetails.rampAvailable,
      elderlyAssistance: fac.accessibilityDetails.elderlyAssistance,
      capacity: fac.capacity || '',
      notes: fac.notes || '',
    });
    setShowAddModal(true);
  };

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Facility> = {
      name: formData.name,
      category: formData.category,
      zone: formData.zone,
      address: formData.address,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      description: formData.description,
      contactNumber: formData.contactNumber || undefined,
      operationalStatus: formData.operationalStatus,
      verificationStatus: formData.verificationStatus,
      services: formData.services.split(',').map((s) => s.trim()).filter(Boolean),
      accessibilityDetails: {
        wheelchairAccessible: formData.wheelchairAccessible,
        rampAvailable: formData.rampAvailable,
        elderlyAssistance: formData.elderlyAssistance,
      },
      capacity: formData.capacity || undefined,
      notes: formData.notes || undefined,
    };

    if (editingFacility) {
      await onEditFacility(editingFacility.id, payload);
    } else {
      await onAddFacility(payload);
    }
    setShowAddModal(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Zone', 'Status', 'Verification', 'Latitude', 'Longitude', 'Address', 'Services'];
    const rows = facilities.map((f) => [
      f.id,
      `"${f.name.replace(/"/g, '""')}"`,
      f.category,
      f.zone,
      f.operationalStatus,
      f.verificationStatus,
      f.latitude,
      f.longitude,
      `"${f.address.replace(/"/g, '""')}"`,
      `"${f.services.join(', ').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `godavari_smartmap_facilities_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateAnnouncement(annFormData);
    setShowAnnounceModal(false);
    setAnnFormData({
      title: '',
      message: '',
      titleTe: '',
      messageTe: '',
      category: 'safety',
      severity: 'info',
    });
  };

  return (
    <div className="space-y-6">
      {/* Admin Title & Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white text-xs font-bold font-mono">
                ADMIN CONSOLE
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Civic Infrastructure Command & Governance
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Authorized event administrator workspace for Godavari Pushkaralu 2027 facility management.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Facility</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Seed</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('facilities')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'facilities'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Facilities Registry ({facilities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'feedback'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Feedback Queue ({feedbackList.filter((f) => f.status === 'pending').length} Pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'announcements'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Public Advisories ({announcements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Facilities Registry */}
      {activeTab === 'facilities' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search facility name, ID, or zone..."
                value={facilitySearch}
                onChange={(e) => setFacilitySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="text-xs text-slate-500">
              Total {facilities.length} records registered
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  <th className="py-3 px-4 font-semibold">ID</th>
                  <th className="py-3 px-4 font-semibold">Facility Name</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Zone</th>
                  <th className="py-3 px-4 font-semibold">Operational Status</th>
                  <th className="py-3 px-4 font-semibold">Verification</th>
                  <th className="py-3 px-4 font-semibold">Last Modified</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {facilities
                  .filter((f) =>
                    facilitySearch
                      ? f.name.toLowerCase().includes(facilitySearch.toLowerCase()) ||
                        f.id.toLowerCase().includes(facilitySearch.toLowerCase()) ||
                        f.zone.toLowerCase().includes(facilitySearch.toLowerCase())
                      : true
                  )
                  .map((fac) => {
                    const statusMeta = getStatusBadge(fac.operationalStatus);
                    const verMeta = getVerificationBadge(fac.verificationStatus);
                    const catMeta = CATEGORIES_META[fac.category];

                    return (
                      <tr key={fac.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {fac.id}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {fac.name}
                          <div className="text-[11px] font-normal text-slate-400 line-clamp-1">
                            {fac.address}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {catMeta?.nameEn || fac.category}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {fac.zone}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${statusMeta.bg} ${statusMeta.text}`}>
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${verMeta.bg} ${verMeta.text}`}>
                            {fac.verificationStatus === 'verified' ? 'Verified' : 'Demo Record'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-400">
                          {new Date(fac.lastUpdatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => openEditModal(fac)}
                            className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded-md mr-1"
                            title="Edit facility details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingFacilityId(fac.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                            title="Delete facility record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Tab 2: User Feedback Queue */}
      {activeTab === 'feedback' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Pilgrim Issue Reports & Verification Queue
            </h3>
            <span className="text-xs text-slate-500">
              {feedbackList.length} total reports received
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {feedbackList.map((item) => (
              <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 text-xs">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-700 dark:text-teal-300">
                      {item.referenceId}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {item.feedbackType.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'under_review'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {item.facilityName}
                  </h4>

                  <p className="text-slate-600 dark:text-slate-300">
                    "{item.description}"
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>Reporter: {item.reporterName}</span>
                    <span>·</span>
                    <span>Received: {new Date(item.createdAt).toLocaleString()}</span>
                  </div>

                  {item.adminNotes && (
                    <div className="mt-2 p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">Reviewer Notes: </span>
                      {item.adminNotes}
                    </div>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => onUpdateFeedbackStatus(item.id, 'resolved', 'Verified and rectified by admin control room.')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                  {item.status === 'pending' && (
                    <button
                      onClick={() => onUpdateFeedbackStatus(item.id, 'under_review', 'Forwarded to sector supervisor for inspection.')}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                    >
                      <span>Investigate</span>
                    </button>
                  )}
                  {item.status !== 'dismissed' && (
                    <button
                      onClick={() => onUpdateFeedbackStatus(item.id, 'dismissed', 'Information already verified accurate.')}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Announcements Publisher */}
      {activeTab === 'announcements' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Official Public Announcements & Advisories
              </h3>
              <p className="text-xs text-slate-500">
                Broadcast vital notices across Telugu, English, and Hindi interfaces.
              </p>
            </div>
            <button
              onClick={() => setShowAnnounceModal(true)}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Announcement</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      {ann.severity.toUpperCase()}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(ann.publishedAt).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {ann.title}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    {ann.message}
                  </p>
                  {ann.titleTe && (
                    <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                      తెలుగు: {ann.titleTe}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onDeleteAnnouncement(ann.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                  title="Remove Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Governance Audit Trail & Modification Log
            </h3>
            <p className="text-xs text-slate-500">
              Immutable chronological record of administrative and operator changes.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 text-xs flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {log.action}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-teal-600 font-medium">{log.entityName}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{log.details}</p>
                </div>
                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  <div>{log.userName} ({log.userRole})</div>
                  <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Facility Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingFacility ? 'Edit Facility Record' : 'Register New Facility'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Facility Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    {Object.entries(CATEGORIES_META).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Zone *</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Central Ghats">Central Ghats</option>
                    <option value="North Ghats">North Ghats</option>
                    <option value="South Ghats">South Ghats</option>
                    <option value="Kovvur Bank">Kovvur Bank</option>
                    <option value="Transit Hubs">Transit Hubs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Latitude (Decimal) *</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Longitude (Decimal) *</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Address / Landmark *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Operational Status</label>
                  <select
                    value={formData.operationalStatus}
                    onChange={(e) => setFormData({ ...formData, operationalStatus: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="operational">Operational</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="temporarily_closed">Temporarily Closed</option>
                    <option value="status_unknown">Status Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Verification Status</label>
                  <select
                    value={formData.verificationStatus}
                    onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="verified">Verified Official</option>
                    <option value="pending_verification">Pending Verification</option>
                    <option value="demo_data">Demo Data</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Services (comma separated)</label>
                <input
                  type="text"
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-semibold block text-slate-800 dark:text-slate-200">Accessibility Provisions</span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.wheelchairAccessible}
                      onChange={(e) => setFormData({ ...formData, wheelchairAccessible: e.target.checked })}
                    />
                    <span>Wheelchair Accessible</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rampAvailable}
                      onChange={(e) => setFormData({ ...formData, rampAvailable: e.target.checked })}
                    />
                    <span>Ramp Entrance Available</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.elderlyAssistance}
                      onChange={(e) => setFormData({ ...formData, elderlyAssistance: e.target.checked })}
                    />
                    <span>Elderly Assistance Staff</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm"
                >
                  {editingFacility ? 'Update Facility' : 'Save Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingFacilityId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">
              Confirm Facility Deletion
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete this facility record from the database and public map?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingFacilityId(null)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onDeleteFacility(deletingFacilityId);
                  setDeletingFacilityId(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Facility
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Demo Data Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h4 className="font-bold text-rose-600 flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5" />
              Reset Demo Records
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              This will restore all facility records, feedback, and announcements back to their pristine seed demo state.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onResetDemo();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Publish Public Advisory
              </h4>
              <button onClick={() => setShowAnnounceModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Title (English) *</label>
                <input
                  type="text"
                  required
                  value={annFormData.title}
                  onChange={(e) => setAnnFormData({ ...annFormData, title: e.target.value })}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Message (English) *</label>
                <textarea
                  rows={2}
                  required
                  value={annFormData.message}
                  onChange={(e) => setAnnFormData({ ...annFormData, message: e.target.value })}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Title (Telugu)</label>
                <input
                  type="text"
                  value={annFormData.titleTe}
                  onChange={(e) => setAnnFormData({ ...annFormData, titleTe: e.target.value })}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={annFormData.category}
                    onChange={(e) => setAnnFormData({ ...annFormData, category: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="safety">Safety</option>
                    <option value="transport">Transport</option>
                    <option value="ghat_flow">Ghat Flow</option>
                    <option value="water_sanitation">Water / Sanitation</option>
                    <option value="medical">Medical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Severity Level</label>
                  <select
                    value={annFormData.severity}
                    onChange={(e) => setAnnFormData({ ...annFormData, severity: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="info">Info</option>
                    <option value="advisory">Advisory</option>
                    <option value="alert">Alert</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Wrench,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Send,
  MessageSquare,
  Shield,
  UserCheck,
  FileText,
  Building,
} from 'lucide-react';
import {
  Facility,
  FacilityOperator,
  OperationalStatus,
  FacilityFeedback,
  MaintenanceReport,
  Language,
} from '../types';
import { CATEGORIES_META, getStatusBadge } from '../utils/categories';
import { TRANSLATIONS } from '../i18n/translations';

interface OperatorDashboardProps {
  facilities: Facility[];
  operators: FacilityOperator[];
  feedbackList: FacilityFeedback[];
  maintenanceReports: MaintenanceReport[];
  onUpdateStatus: (facilityId: string, status: OperationalStatus, notes: string, operatorName: string) => Promise<void>;
  onCreateMaintenanceReport: (report: Partial<MaintenanceReport>) => Promise<void>;
  language: Language;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  facilities,
  operators,
  feedbackList,
  maintenanceReports,
  onUpdateStatus,
  onCreateMaintenanceReport,
  language,
}) => {
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(operators[0]?.id || 'op-001');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [newStatus, setNewStatus] = useState<OperationalStatus>('operational');
  const [statusNotes, setStatusNotes] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Maintenance report form
  const [showMaintModal, setShowMaintModal] = useState<boolean>(false);
  const [maintData, setMaintData] = useState({
    issueType: 'water_leakage' as any,
    description: '',
    priority: 'medium' as any,
  });

  const currentOperator = operators.find((op) => op.id === selectedOperatorId) || operators[0];
  const assignedFacilities = facilities.filter((f) =>
    currentOperator?.assignedFacilityIds.includes(f.id)
  );

  const activeFacility =
    assignedFacilities.find((f) => f.id === selectedFacilityId) || assignedFacilities[0];

  // Feedback relevant to assigned facilities
  const assignedFeedback = feedbackList.filter((fb) =>
    assignedFacilities.some((f) => f.id === fb.facilityId)
  );

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFacility) return;

    setUpdating(true);
    try {
      await onUpdateStatus(activeFacility.id, newStatus, statusNotes, currentOperator.name);
      setSuccessMessage(`Updated status of "${activeFacility.name}" to ${newStatus.toUpperCase()}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setStatusNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFacility) return;

    await onCreateMaintenanceReport({
      facilityId: activeFacility.id,
      facilityName: activeFacility.name,
      issueType: maintData.issueType,
      description: maintData.description,
      priority: maintData.priority,
      reportedBy: currentOperator.name,
    });

    setShowMaintModal(false);
    setMaintData({ issueType: 'water_leakage', description: '', priority: 'medium' });
    setSuccessMessage(`Maintenance ticket submitted for "${activeFacility.name}"`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Operator Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-teal-600 text-white text-xs font-bold font-mono">
                OPERATOR CONSOLE
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Facility Operational Duty Center
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Field operational status management, sanitation tracking, and incident escalation.
            </p>
          </div>

          {/* Operator Profile Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Active Operator:</span>
            <select
              value={selectedOperatorId}
              onChange={(e) => {
                setSelectedOperatorId(e.target.value);
                setSelectedFacilityId('');
              }}
              className="py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
            >
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name} ({op.roleTitle})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Operator Badge Bar */}
        {currentOperator && (
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal-600" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{currentOperator.name}</span>
                <span className="text-slate-400">({currentOperator.roleTitle})</span>
              </div>
              <div>Duty Phone: <span className="font-mono font-semibold">{currentOperator.contactNumber}</span></div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400">ON ACTIVE DUTY</span>
            </div>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Facility Selector & Live Updater */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Facilities */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>Assigned Facilities</span>
            <span className="text-xs font-normal text-slate-400 font-mono">
              {assignedFacilities.length} assigned
            </span>
          </h3>

          <div className="space-y-2.5">
            {assignedFacilities.map((fac) => {
              const statusMeta = getStatusBadge(fac.operationalStatus);
              const isSelected = (activeFacility?.id || assignedFacilities[0]?.id) === fac.id;

              return (
                <div
                  key={fac.id}
                  onClick={() => {
                    setSelectedFacilityId(fac.id);
                    setNewStatus(fac.operationalStatus);
                    setStatusNotes(fac.notes || '');
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {fac.name}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusMeta.bg} ${statusMeta.text}`}>
                      {statusMeta.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    {fac.address}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 font-mono">
                    Last updated: {new Date(fac.lastUpdatedAt).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Status Controller & Maintenance Reporting */}
        {activeFacility && (
          <div className="lg:col-span-2 space-y-6">
            {/* Status Update Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-mono text-teal-600 font-bold block mb-0.5">
                    FACILITY STATUS CONTROL
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {activeFacility.name}
                  </h3>
                </div>

                <button
                  onClick={() => setShowMaintModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Report Maintenance</span>
                </button>
              </div>

              <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                    Select Current Operational Status:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'operational', label: 'Operational', color: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
                      { key: 'maintenance', label: 'Under Maintenance', color: 'border-amber-500 text-amber-700 bg-amber-50' },
                      { key: 'temporarily_closed', label: 'Temporarily Closed', color: 'border-rose-500 text-rose-700 bg-rose-50' },
                      { key: 'status_unknown', label: 'Status Unknown', color: 'border-slate-500 text-slate-700 bg-slate-100' },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => setNewStatus(opt.key as any)}
                        className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                          newStatus === opt.key
                            ? `${opt.color} shadow-xs ring-2 ring-teal-500`
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Operational Status Notes (Publicly Visible):
                  </label>
                  <textarea
                    rows={2}
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="e.g. Filter cartridge replacement in progress, expected open by 11:00 AM..."
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">
                    Timestamp & operator ID ({currentOperator.name}) will be recorded in audit log.
                  </span>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm disabled:opacity-50"
                  >
                    {updating ? 'Publishing...' : 'Commit Status Update'}
                  </button>
                </div>
              </form>
            </div>

            {/* Related Feedback for this facility */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>Pilgrim Feedback for Your Facilities ({assignedFeedback.length})</span>
                <span className="text-[11px] text-slate-400">Live pilgrim submissions</span>
              </h4>

              {assignedFeedback.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No pilgrim feedback recorded for your assigned facilities yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedFeedback.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {fb.facilityName}
                        </span>
                        <span className="font-mono text-[10px] text-teal-600 font-bold">
                          {fb.referenceId}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mb-1">"{fb.description}"</p>
                      <div className="text-[10px] text-slate-400">
                        {new Date(fb.createdAt).toLocaleString()} · Reporter: {fb.reporterName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Log Maintenance Modal */}
      {showMaintModal && activeFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-500" />
              <span>Log Maintenance Ticket: {activeFacility.name}</span>
            </h4>

            <form onSubmit={handleMaintenanceSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Issue Category</label>
                <select
                  value={maintData.issueType}
                  onChange={(e) => setMaintData({ ...maintData, issueType: e.target.value as any })}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <option value="water_leakage">Water Leakage / Pipe Damage</option>
                  <option value="power_outage">Power / Electrical Outage</option>
                  <option value="sanitation">Sanitation / Deep Cleaning Required</option>
                  <option value="equipment_damage">Equipment Damage / Broken Door</option>
                  <option value="crowd_blockage">Crowd Flow Blockage / Barricade</option>
                  <option value="other">Other Incident</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Priority</label>
                <select
                  value={maintData.priority}
                  onChange={(e) => setMaintData({ ...maintData, priority: e.target.value as any })}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <option value="low">Low - Routine</option>
                  <option value="medium">Medium - Action Needed</option>
                  <option value="high">High - Urgent</option>
                  <option value="critical">Critical - Safety Hazard</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Problem Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe location of defect, spare parts needed, or immediate danger..."
                  value={maintData.description}
                  onChange={(e) => setMaintData({ ...maintData, description: e.target.value })}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMaintModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

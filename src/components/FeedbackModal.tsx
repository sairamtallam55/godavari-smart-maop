import React, { useState } from 'react';
import {
  X,
  Flag,
  CheckCircle,
  AlertCircle,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { Facility, FeedbackType, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface FeedbackModalProps {
  facility: Facility | null;
  onClose: () => void;
  onSubmitFeedback: (data: {
    facilityId: string;
    facilityName: string;
    feedbackType: FeedbackType;
    description: string;
    reporterName?: string;
    reporterContact?: string;
  }) => Promise<{ referenceId: string }>;
  language: Language;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  facility,
  onClose,
  onSubmitFeedback,
  language,
}) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('incorrect_details');
  const [description, setDescription] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterContact, setReporterContact] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successReferenceId, setSuccessReferenceId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      const res = await onSubmitFeedback({
        facilityId: facility?.id || 'general',
        facilityName: facility?.name || 'General Civic Inquiry',
        feedbackType,
        description,
        reporterName,
        reporterContact,
      });

      setSuccessReferenceId(res.referenceId);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const copyRefId = () => {
    if (successReferenceId) {
      navigator.clipboard.writeText(successReferenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-rose-600">
            <Flag className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Report Facility Issue or Inaccuracy
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {successReferenceId ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Report Submitted Successfully
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Your report has been logged in the administration verification queue.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 inline-flex items-center gap-2">
              <span className="text-xs text-slate-500">Reference ID:</span>
              <span className="font-mono font-bold text-sm text-teal-600">
                {successReferenceId}
              </span>
              <button
                onClick={copyRefId}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"
                title="Copy reference ID"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {facility && (
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Target Facility:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{facility.name}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Issue Category *
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="incorrect_details">Incorrect Facility Details</option>
                <option value="closed_facility">Facility is Closed / Non-operational</option>
                <option value="inaccurate_coordinates">Inaccurate Map Coordinates / Pin Location</option>
                <option value="cleanliness_water_issue">Cleanliness or Drinking Water Issue</option>
                <option value="accessibility_issue">Accessibility Barrier / Ramp Missing</option>
                <option value="missing_facility">Facility Does Not Exist at Location</option>
                <option value="other">Other Public Observation</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Description of the Issue *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain clearly what is incorrect or what assistance is needed..."
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Ramesh K."
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  placeholder="+91..."
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              Every report generates an official reference ID and alerts sector operators.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !description.trim()}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

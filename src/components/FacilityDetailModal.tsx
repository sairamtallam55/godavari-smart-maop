import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Navigation,
  Accessibility,
  Copy,
  Check,
  Share2,
  Flag,
  FileText,
} from 'lucide-react';
import { Facility, Language } from '../types';
import { CATEGORIES_META, getStatusBadge, getVerificationBadge } from '../utils/categories';
import { calculateDistanceKm, formatDistance } from '../utils/geo';
import { TRANSLATIONS } from '../i18n/translations';

interface FacilityDetailModalProps {
  facility: Facility | null;
  onClose: () => void;
  onOpenMap: (facility: Facility) => void;
  onReportIssue: (facility: Facility) => void;
  userCoords: { latitude: number; longitude: number } | null;
  language: Language;
}

export const FacilityDetailModal: React.FC<FacilityDetailModalProps> = ({
  facility,
  onClose,
  onOpenMap,
  onReportIssue,
  userCoords,
  language,
}) => {
  if (!facility) return null;

  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const catMeta = CATEGORIES_META[facility.category] || CATEGORIES_META.bathing_ghat;
  const statusMeta = getStatusBadge(facility.operationalStatus);
  const verMeta = getVerificationBadge(facility.verificationStatus);

  const distanceKm = userCoords
    ? calculateDistanceKm(
        userCoords.latitude,
        userCoords.longitude,
        facility.latitude,
        facility.longitude
      )
    : null;

  const handleCopyCoords = () => {
    const text = `${facility.latitude.toFixed(6)}, ${facility.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleShare = () => {
    const shareText = `${facility.name} — ${catMeta.nameEn} at Godavari Pushkaralu 2027 (${facility.address}). Map Location: https://www.google.com/maps/search/?api=1&query=${facility.latitude},${facility.longitude}`;
    if (navigator.share) {
      navigator.share({
        title: facility.name,
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {catMeta.nameEn}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusMeta.bg} ${statusMeta.text}`}>
                {statusMeta.label}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {facility.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 text-xs text-slate-600 dark:text-slate-300 flex-1">
          {/* Verification Badge Bar */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {verMeta.label}
                </span>
                <p className="text-[11px] text-slate-400">
                  {facility.verificationStatus === 'verified'
                    ? 'Verified by District Administration'
                    : 'Synthetic demonstration record'}
                </p>
              </div>
            </div>

            {distanceKm !== null && (
              <div className="flex items-center gap-1 font-mono font-bold text-teal-700 dark:text-teal-300 text-xs px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50">
                <Navigation className="w-3.5 h-3.5" />
                <span>{formatDistance(distanceKm)} away</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              About Facility
            </h4>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              {facility.description}
            </p>
          </div>

          {/* Location & Address */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
              Location & Zone
            </h4>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-slate-800 dark:text-slate-200">{facility.address}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[11px] text-slate-400">
                    {facility.latitude.toFixed(6)}, {facility.longitude.toFixed(6)}
                  </span>
                  <button
                    onClick={handleCopyCoords}
                    className="inline-flex items-center gap-1 text-[11px] text-teal-600 hover:text-teal-700 font-medium"
                  >
                    {copiedCoords ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCoords ? 'Copied' : 'Copy Coords'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          {facility.contactNumber && (
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Official Helpline / Contact
              </h4>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-600" />
                <a
                  href={`tel:${facility.contactNumber}`}
                  className="font-mono font-bold text-teal-700 dark:text-teal-300 hover:underline"
                >
                  {facility.contactNumber}
                </a>
              </div>
            </div>
          )}

          {/* Available Services */}
          {facility.services && facility.services.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Services & Amenities Available
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {facility.services.map((service, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Accessibility Details */}
          <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 space-y-2">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-semibold">
              <Accessibility className="w-4 h-4 text-purple-600" />
              <span>Accessibility & Senior Citizen Support</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${facility.accessibilityDetails.wheelchairAccessible ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                <span>Wheelchair Accessible: {facility.accessibilityDetails.wheelchairAccessible ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${facility.accessibilityDetails.rampAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                <span>Ramps: {facility.accessibilityDetails.rampAvailable ? 'Present' : 'Not Present'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${facility.accessibilityDetails.elderlyAssistance ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                <span>Elderly Assistance: {facility.accessibilityDetails.elderlyAssistance ? 'Available' : 'Standard'}</span>
              </div>
              {facility.capacity && (
                <div className="col-span-2 text-slate-500">
                  Rated Capacity: <span className="font-semibold text-slate-800 dark:text-slate-200">{facility.capacity}</span>
                </div>
              )}
            </div>
            {facility.accessibilityDetails.notes && (
              <p className="text-[11px] text-slate-500 italic pt-1 border-t border-purple-100 dark:border-purple-900">
                Note: {facility.accessibilityDetails.notes}
              </p>
            )}
          </div>

          {/* Operational Notes if any */}
          {facility.notes && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200">
              <span className="font-semibold block mb-0.5">Operator Status Note:</span>
              <span>{facility.notes}</span>
            </div>
          )}

          {/* Audit & Update Metadata */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Last updated: {new Date(facility.lastUpdatedAt).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Updated by: {facility.updatedBy}
            </span>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReportIssue(facility)}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenMap(facility);
                onClose();
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>View on Map</span>
            </button>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-sm"
            >
              <span>Get Real Directions</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

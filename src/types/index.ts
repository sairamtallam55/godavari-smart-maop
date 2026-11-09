export type UserRole = 'pilgrim' | 'operator' | 'admin';

export type Language = 'en' | 'te' | 'hi';

export type FacilityCategory =
  | 'hospital'
  | 'first_aid'
  | 'toilet'
  | 'drinking_water'
  | 'parking'
  | 'bus_stop'
  | 'railway_station'
  | 'police'
  | 'lost_and_found'
  | 'information_center'
  | 'food_center'
  | 'accessibility_help'
  | 'bathing_ghat';

export type OperationalStatus =
  | 'operational'
  | 'temporarily_closed'
  | 'maintenance'
  | 'status_unknown';

export type VerificationStatus =
  | 'verified'
  | 'pending_verification'
  | 'demo_data';

export interface Facility {
  id: string;
  name: string;
  category: FacilityCategory;
  description: string;
  address: string;
  zone: 'Central Ghats' | 'North Ghats' | 'South Ghats' | 'Kovvur Bank' | 'Transit Hubs';
  latitude: number;
  longitude: number;
  contactNumber?: string;
  operationalStatus: OperationalStatus;
  verificationStatus: VerificationStatus;
  services: string[];
  accessibilityDetails: {
    wheelchairAccessible: boolean;
    rampAvailable: boolean;
    brailleSignage?: boolean;
    elderlyAssistance: boolean;
    notes?: string;
  };
  capacity?: string;
  lastUpdatedAt: string;
  updatedBy: string;
  notes?: string;
}

export interface FacilityOperator {
  id: string;
  name: string;
  roleTitle: string;
  contactNumber: string;
  assignedFacilityIds: string[];
  availability: 'on_duty' | 'off_duty' | 'on_break';
  lastActive: string;
}

export type FeedbackType =
  | 'incorrect_details'
  | 'closed_facility'
  | 'missing_facility'
  | 'inaccurate_coordinates'
  | 'accessibility_issue'
  | 'cleanliness_water_issue'
  | 'other';

export interface FacilityFeedback {
  id: string;
  referenceId: string;
  facilityId: string;
  facilityName: string;
  feedbackType: FeedbackType;
  description: string;
  reporterName?: string;
  reporterContact?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
  reviewedBy?: string;
}

export interface MaintenanceReport {
  id: string;
  facilityId: string;
  facilityName: string;
  issueType: 'water_leakage' | 'power_outage' | 'sanitation' | 'equipment_damage' | 'crowd_blockage' | 'other';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'in_progress' | 'resolved';
  reportedBy: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  titleTe?: string;
  messageTe?: string;
  titleHi?: string;
  messageHi?: string;
  category: 'safety' | 'transport' | 'ghat_flow' | 'water_sanitation' | 'medical';
  severity: 'info' | 'advisory' | 'alert' | 'emergency';
  publishedAt: string;
  expiresAt: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'facility' | 'announcement' | 'feedback' | 'maintenance';
  entityId: string;
  entityName: string;
  timestamp: string;
  details: string;
}

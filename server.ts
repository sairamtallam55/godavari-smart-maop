import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_FACILITIES,
  INITIAL_OPERATORS,
  INITIAL_FEEDBACK,
  INITIAL_MAINTENANCE,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
} from './src/data/seedData';
import {
  Facility,
  FacilityOperator,
  FacilityFeedback,
  MaintenanceReport,
  Announcement,
  AuditLog,
} from './src/types';
import {
  calculateDistanceKm,
  classifySearchIntent,
  findNearbyFacilities,
  filterFacilities,
} from './src/utils/geo';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-Memory Database store with deep clones of initial seeds
let facilities: Facility[] = JSON.parse(JSON.stringify(INITIAL_FACILITIES));
let operators: FacilityOperator[] = JSON.parse(JSON.stringify(INITIAL_OPERATORS));
let feedbackItems: FacilityFeedback[] = JSON.parse(JSON.stringify(INITIAL_FEEDBACK));
let maintenanceReports: MaintenanceReport[] = JSON.parse(JSON.stringify(INITIAL_MAINTENANCE));
let announcements: Announcement[] = JSON.parse(JSON.stringify(INITIAL_ANNOUNCEMENTS));
let auditLogs: AuditLog[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));

// Gemini AI Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

function addAuditLog(
  userId: string,
  userName: string,
  userRole: 'admin' | 'operator' | 'pilgrim',
  action: string,
  entityType: 'facility' | 'announcement' | 'feedback' | 'maintenance',
  entityId: string,
  entityName: string,
  details: string
) {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userName,
    userRole,
    action,
    entityType,
    entityId,
    entityName,
    timestamp: new Date().toISOString(),
    details,
  };
  auditLogs.unshift(newLog);
  if (auditLogs.length > 200) auditLogs.pop();
}

// ----------------------------------------------------
// REST APIs
// ----------------------------------------------------

// 1. Facilities
app.get('/api/facilities', (req: Request, res: Response) => {
  const { category, status, verification, query, zone, accessible, sort } = req.query;

  let results = [...facilities];

  if (category && category !== 'all') {
    results = results.filter((f) => f.category === category);
  }
  if (status && status !== 'all') {
    results = results.filter((f) => f.operationalStatus === status);
  }
  if (verification && verification !== 'all') {
    results = results.filter((f) => f.verificationStatus === verification);
  }
  if (zone && zone !== 'all') {
    results = results.filter((f) => f.zone === zone);
  }
  if (accessible === 'true') {
    results = results.filter((f) => f.accessibilityDetails.wheelchairAccessible);
  }
  if (query && typeof query === 'string' && query.trim().length > 0) {
    const q = query.toLowerCase().trim();
    results = results.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.services.some((s) => s.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
});

app.get('/api/facilities/:id', (req: Request, res: Response) => {
  const facility = facilities.find((f) => f.id === req.params.id);
  if (!facility) {
    res.status(404).json({ success: false, error: 'Facility not found' });
    return;
  }
  res.json({ success: true, data: facility });
});

// Admin Add Facility
app.post('/api/facilities', (req: Request, res: Response) => {
  const {
    name,
    category,
    description,
    address,
    zone,
    latitude,
    longitude,
    contactNumber,
    operationalStatus,
    verificationStatus,
    services,
    accessibilityDetails,
    capacity,
    notes,
    adminName = 'System Admin',
  } = req.body;

  if (!name || !category || !latitude || !longitude || !address) {
    res.status(400).json({
      success: false,
      error: 'Name, category, address, latitude, and longitude are required.',
    });
    return;
  }

  const newFacility: Facility = {
    id: `fac-${Date.now().toString().slice(-6)}`,
    name: name.trim(),
    category,
    description: description || 'Civic infrastructure facility for Godavari Pushkaralu 2027.',
    address: address.trim(),
    zone: zone || 'Central Ghats',
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    contactNumber: contactNumber || undefined,
    operationalStatus: operationalStatus || 'operational',
    verificationStatus: verificationStatus || 'verified',
    services: Array.isArray(services) ? services : (services || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    accessibilityDetails: accessibilityDetails || {
      wheelchairAccessible: false,
      rampAvailable: false,
      elderlyAssistance: false,
    },
    capacity: capacity || undefined,
    lastUpdatedAt: new Date().toISOString(),
    updatedBy: adminName,
    notes: notes || undefined,
  };

  facilities.unshift(newFacility);

  addAuditLog(
    'admin-user',
    adminName,
    'admin',
    'CREATE_FACILITY',
    'facility',
    newFacility.id,
    newFacility.name,
    `Added facility under category "${category}" in ${newFacility.zone}`
  );

  res.status(201).json({ success: true, data: newFacility });
});

// Admin Edit Facility
app.put('/api/facilities/:id', (req: Request, res: Response) => {
  const index = facilities.findIndex((f) => f.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ success: false, error: 'Facility not found' });
    return;
  }

  const current = facilities[index];
  const adminName = req.body.adminName || 'System Admin';

  const updated: Facility = {
    ...current,
    ...req.body,
    id: current.id,
    lastUpdatedAt: new Date().toISOString(),
    updatedBy: adminName,
  };

  facilities[index] = updated;

  addAuditLog(
    'admin-user',
    adminName,
    'admin',
    'UPDATE_FACILITY',
    'facility',
    updated.id,
    updated.name,
    `Updated facility details and status: ${updated.operationalStatus}`
  );

  res.json({ success: true, data: updated });
});

// Admin Delete Facility
app.delete('/api/facilities/:id', (req: Request, res: Response) => {
  const index = facilities.findIndex((f) => f.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ success: false, error: 'Facility not found' });
    return;
  }

  const deleted = facilities[index];
  facilities.splice(index, 1);

  addAuditLog(
    'admin-user',
    req.body.adminName || 'System Admin',
    'admin',
    'DELETE_FACILITY',
    'facility',
    deleted.id,
    deleted.name,
    `Removed facility record from database.`
  );

  res.json({ success: true, message: 'Facility deleted successfully', data: deleted });
});

// Operator / Admin update operational status
app.patch('/api/facilities/:id/status', (req: Request, res: Response) => {
  const { status, notes, updatedBy = 'Operator', role = 'operator' } = req.body;
  const facility = facilities.find((f) => f.id === req.params.id);

  if (!facility) {
    res.status(404).json({ success: false, error: 'Facility not found' });
    return;
  }

  const previousStatus = facility.operationalStatus;
  facility.operationalStatus = status;
  if (notes) facility.notes = notes;
  facility.lastUpdatedAt = new Date().toISOString();
  facility.updatedBy = updatedBy;

  addAuditLog(
    'operator-user',
    updatedBy,
    role === 'admin' ? 'admin' : 'operator',
    'STATUS_UPDATE',
    'facility',
    facility.id,
    facility.name,
    `Operational status modified from "${previousStatus}" to "${status}". Notes: ${notes || 'None'}`
  );

  res.json({ success: true, data: facility });
});

// 2. Feedback & Issues
app.get('/api/feedback', (_req: Request, res: Response) => {
  res.json({ success: true, count: feedbackItems.length, data: feedbackItems });
});

app.post('/api/feedback', (req: Request, res: Response) => {
  const {
    facilityId,
    facilityName,
    feedbackType,
    description,
    reporterName,
    reporterContact,
  } = req.body;

  if (!feedbackType || !description) {
    res.status(400).json({
      success: false,
      error: 'Feedback type and description are required.',
    });
    return;
  }

  const count = feedbackItems.length + 1045;
  const newFeedback: FacilityFeedback = {
    id: `fb-${Date.now()}`,
    referenceId: `REP-2027-${count}`,
    facilityId: facilityId || 'general',
    facilityName: facilityName || 'General Infrastructure Inquiry',
    feedbackType,
    description: description.trim(),
    reporterName: reporterName?.trim() || 'Anonymous Pilgrim',
    reporterContact: reporterContact?.trim() || undefined,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  feedbackItems.unshift(newFeedback);

  addAuditLog(
    'pilgrim-user',
    newFeedback.reporterName || 'Pilgrim',
    'pilgrim',
    'SUBMIT_FEEDBACK',
    'feedback',
    newFeedback.id,
    newFeedback.referenceId,
    `Reported "${feedbackType}" for ${newFeedback.facilityName}`
  );

  res.status(201).json({
    success: true,
    referenceId: newFeedback.referenceId,
    message: 'Report submitted successfully. Reference ID recorded.',
    data: newFeedback,
  });
});

app.patch('/api/feedback/:id/status', (req: Request, res: Response) => {
  const { status, adminNotes, reviewedBy = 'Admin Reviewer' } = req.body;
  const item = feedbackItems.find((fb) => fb.id === req.params.id);

  if (!item) {
    res.status(404).json({ success: false, error: 'Feedback report not found' });
    return;
  }

  item.status = status;
  if (adminNotes) item.adminNotes = adminNotes;
  item.reviewedBy = reviewedBy;

  addAuditLog(
    'admin-user',
    reviewedBy,
    'admin',
    'REVIEW_FEEDBACK',
    'feedback',
    item.id,
    item.referenceId,
    `Marked report as ${status}. Notes: ${adminNotes || 'None'}`
  );

  res.json({ success: true, data: item });
});

// 3. Maintenance Reports
app.get('/api/maintenance', (_req: Request, res: Response) => {
  res.json({ success: true, count: maintenanceReports.length, data: maintenanceReports });
});

app.post('/api/maintenance', (req: Request, res: Response) => {
  const {
    facilityId,
    facilityName,
    issueType,
    description,
    priority = 'medium',
    reportedBy = 'Field Operator',
  } = req.body;

  if (!facilityId || !issueType || !description) {
    res.status(400).json({
      success: false,
      error: 'Facility ID, issue type, and description are required.',
    });
    return;
  }

  const report: MaintenanceReport = {
    id: `maint-${Date.now()}`,
    facilityId,
    facilityName: facilityName || 'Assigned Facility',
    issueType,
    description: description.trim(),
    priority,
    status: 'reported',
    reportedBy,
    createdAt: new Date().toISOString(),
  };

  maintenanceReports.unshift(report);

  addAuditLog(
    'operator-user',
    reportedBy,
    'operator',
    'CREATE_MAINTENANCE',
    'maintenance',
    report.id,
    report.facilityName,
    `Logged maintenance issue "${issueType}" with ${priority} priority.`
  );

  res.status(201).json({ success: true, data: report });
});

app.patch('/api/maintenance/:id/status', (req: Request, res: Response) => {
  const { status, resolutionNotes, resolvedBy = 'Operator' } = req.body;
  const report = maintenanceReports.find((m) => m.id === req.params.id);

  if (!report) {
    res.status(404).json({ success: false, error: 'Report not found' });
    return;
  }

  report.status = status;
  if (resolutionNotes) report.resolutionNotes = resolutionNotes;
  if (status === 'resolved') report.resolvedAt = new Date().toISOString();

  addAuditLog(
    'operator-user',
    resolvedBy,
    'operator',
    'UPDATE_MAINTENANCE',
    'maintenance',
    report.id,
    report.facilityName,
    `Maintenance report status updated to ${status}.`
  );

  res.json({ success: true, data: report });
});

// 4. Announcements
app.get('/api/announcements', (_req: Request, res: Response) => {
  const activeOnly = announcements.filter((a) => a.active);
  res.json({ success: true, count: activeOnly.length, data: activeOnly });
});

app.post('/api/announcements', (req: Request, res: Response) => {
  const {
    title,
    message,
    titleTe,
    messageTe,
    titleHi,
    messageHi,
    category = 'safety',
    severity = 'info',
    expiresAt,
    adminName = 'Control Room Admin',
  } = req.body;

  if (!title || !message) {
    res.status(400).json({ success: false, error: 'Title and message are required.' });
    return;
  }

  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    title: title.trim(),
    message: message.trim(),
    titleTe,
    messageTe,
    titleHi,
    messageHi,
    category,
    severity,
    publishedAt: new Date().toISOString(),
    expiresAt: expiresAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    active: true,
  };

  announcements.unshift(newAnn);

  addAuditLog(
    'admin-user',
    adminName,
    'admin',
    'CREATE_ANNOUNCEMENT',
    'announcement',
    newAnn.id,
    newAnn.title,
    `Published public announcement with ${severity} severity.`
  );

  res.status(201).json({ success: true, data: newAnn });
});

app.delete('/api/announcements/:id', (req: Request, res: Response) => {
  const index = announcements.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ success: false, error: 'Announcement not found' });
    return;
  }
  const deleted = announcements[index];
  announcements.splice(index, 1);

  res.json({ success: true, message: 'Announcement deleted', data: deleted });
});

// 5. Operators
app.get('/api/operators', (_req: Request, res: Response) => {
  res.json({ success: true, data: operators });
});

app.put('/api/operators/:id', (req: Request, res: Response) => {
  const operator = operators.find((op) => op.id === req.params.id);
  if (!operator) {
    res.status(404).json({ success: false, error: 'Operator not found' });
    return;
  }

  if (req.body.assignedFacilityIds) {
    operator.assignedFacilityIds = req.body.assignedFacilityIds;
  }
  if (req.body.availability) {
    operator.availability = req.body.availability;
  }
  operator.lastActive = new Date().toISOString();

  res.json({ success: true, data: operator });
});

// 6. Audit Logs
app.get('/api/audit-logs', (_req: Request, res: Response) => {
  res.json({ success: true, count: auditLogs.length, data: auditLogs });
});

// 7. Analytics & Coverage Stats
app.get('/api/stats', (_req: Request, res: Response) => {
  const total = facilities.length;
  const operational = facilities.filter((f) => f.operationalStatus === 'operational').length;
  const maintenance = facilities.filter((f) => f.operationalStatus === 'maintenance').length;
  const closed = facilities.filter((f) => f.operationalStatus === 'temporarily_closed').length;
  const unknown = facilities.filter((f) => f.operationalStatus === 'status_unknown').length;

  const verified = facilities.filter((f) => f.verificationStatus === 'verified').length;
  const pending = facilities.filter((f) => f.verificationStatus === 'pending_verification').length;
  const demo = facilities.filter((f) => f.verificationStatus === 'demo_data').length;

  const byCategory: Record<string, number> = {};
  facilities.forEach((f) => {
    byCategory[f.category] = (byCategory[f.category] || 0) + 1;
  });

  const byZone: Record<string, number> = {};
  facilities.forEach((f) => {
    byZone[f.zone] = (byZone[f.zone] || 0) + 1;
  });

  const pendingFeedback = feedbackItems.filter((fb) => fb.status === 'pending').length;
  const activeMaintenance = maintenanceReports.filter((m) => m.status !== 'resolved').length;

  res.json({
    success: true,
    data: {
      total,
      operational,
      maintenance,
      closed,
      unknown,
      verified,
      pending,
      demo,
      byCategory,
      byZone,
      pendingFeedback,
      activeMaintenance,
    },
  });
});

// 8. Demo Reset
app.post('/api/reset-demo', (_req: Request, res: Response) => {
  facilities = JSON.parse(JSON.stringify(INITIAL_FACILITIES));
  operators = JSON.parse(JSON.stringify(INITIAL_OPERATORS));
  feedbackItems = JSON.parse(JSON.stringify(INITIAL_FEEDBACK));
  maintenanceReports = JSON.parse(JSON.stringify(INITIAL_MAINTENANCE));
  announcements = JSON.parse(JSON.stringify(INITIAL_ANNOUNCEMENTS));
  auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));

  res.json({
    success: true,
    message: 'Reset all database records to clean initial demo data successfully.',
  });
});

// ----------------------------------------------------
// AI Integration (Google Gemini with Fallback)
// ----------------------------------------------------

// AI Smart Search
app.post('/api/ai/search', async (req: Request, res: Response) => {
  const { query, userLat, userLon, language = 'en' } = req.body;

  if (!query || typeof query !== 'string') {
    res.status(400).json({ success: false, error: 'Search query string is required.' });
    return;
  }

  // Fallback preparation
  const fallbackIntent = classifySearchIntent(query);
  let fallbackMatches: Facility[] = [];

  if (fallbackIntent.detectedCategory) {
    fallbackMatches = facilities.filter((f) => f.category === fallbackIntent.detectedCategory);
  } else {
    fallbackMatches = filterFacilities(facilities, { query });
  }

  // If user coordinates provided, sort by proximity
  if (userLat !== undefined && userLon !== undefined) {
    fallbackMatches = fallbackMatches.sort((a, b) => {
      const distA = calculateDistanceKm(userLat, userLon, a.latitude, a.longitude);
      const distB = calculateDistanceKm(userLat, userLon, b.latitude, b.longitude);
      return distA - distB;
    });
  }

  // Attempt Gemini API call if client is available
  if (aiClient) {
    try {
      const promptFacilitiesList = facilities.map((f) => ({
        id: f.id,
        name: f.name,
        category: f.category,
        zone: f.zone,
        address: f.address,
        operationalStatus: f.operationalStatus,
        verificationStatus: f.verificationStatus,
        services: f.services,
        wheelchairAccessible: f.accessibilityDetails.wheelchairAccessible,
      }));

      const systemInstruction = `You are the GIS Facility Search Engine for Godavari SmartMap (Godavari Pushkaralu 2027 in Rajahmundry & Kovvur, Andhra Pradesh).
CRITICAL CONSTRAINTS:
1. NEVER invent, hallucinate, or fabricate facilities, coordinates, addresses, phone numbers, or operational statuses.
2. ONLY return facility IDs that exist in the provided database list.
3. Understand natural language queries in Telugu, English, or Hindi (e.g. "Nearest hospital", "Drinking water at Pushkar ghat", "చూడదగ్గ ఘాట్లు", "शौचालय कहां हैं").
4. If no exact facility matches, explain politely without making anything up.
5. Provide the explanation in the requested language code: ${language}.
Return strict JSON in this format:
{
  "intentSummary": "Short explanation of what was understood",
  "detectedCategory": "hospital | toilet | drinking_water | parking | bus_stop | railway_station | police | lost_and_found | information_center | food_center | accessibility_help | bathing_ghat | other",
  "matchedFacilityIds": ["fac-001", "fac-002"],
  "explanation": "Clear, friendly explanation in the selected language (${language}) of the results found",
  "isEmergency": false
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `User Query: "${query}".
User Location: ${userLat !== undefined && userLon !== undefined ? `${userLat}, ${userLon}` : 'Not provided'}.
Database Facilities:
${JSON.stringify(promptFacilitiesList)}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const matchedFacilities = (parsed.matchedFacilityIds || [])
        .map((id: string) => facilities.find((f) => f.id === id))
        .filter(Boolean);

      res.json({
        success: true,
        source: 'gemini-3.8-flash',
        intentSummary: parsed.intentSummary || 'Natural language search query',
        detectedCategory: parsed.detectedCategory,
        explanation: parsed.explanation || `Found ${matchedFacilities.length} matching facilities.`,
        isEmergency: Boolean(parsed.isEmergency),
        data: matchedFacilities.length > 0 ? matchedFacilities : fallbackMatches.slice(0, 5),
      });
      return;
    } catch (error) {
      console.warn('Gemini AI search call failed; using deterministic fallback:', error);
    }
  }

  // Deterministic fallback response
  let explanation = `Found ${fallbackMatches.length} facilities matching your request.`;
  if (language === 'te') {
    explanation = `మీ అభ్యర్థనకు సరిపోయే ${fallbackMatches.length} సౌకర్యాలు లభించాయి.`;
  } else if (language === 'hi') {
    explanation = `आपके अनुरोध से मेल खाने वाली ${fallbackMatches.length} सुविधाएं मिली हैं।`;
  }

  res.json({
    success: true,
    source: 'deterministic_fallback',
    intentSummary: `Search for ${fallbackIntent.detectedCategory || 'keyword query'}`,
    detectedCategory: fallbackIntent.detectedCategory,
    explanation,
    isEmergency: fallbackIntent.isEmergency,
    data: fallbackMatches.slice(0, 8),
  });
});

// Multilingual Pilgrim Assistant
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  const { message, language = 'en', userLat, userLon } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ success: false, error: 'Message is required.' });
    return;
  }

  const activeAnnouncementsList = announcements
    .filter((a) => a.active)
    .map((a) => `- ${a.title}: ${a.message}`)
    .join('\n');

  if (aiClient) {
    try {
      const systemInstruction = `You are Godavari SmartMap Pilgrim Assistant for Godavari Pushkaralu 2027 in Andhra Pradesh.
Languages supported: Telugu (తెలుగు), English, and Hindi (हिन्दी).
Your role:
- Help pilgrims find civic facilities (bathing ghats, drinking water, clean bio-toilets, emergency medical posts, parking grounds, bus terminals, lost and found).
- Explain map markers and operational statuses (Operational, Maintenance, Temporarily Closed, Status Unknown).
- Provide emergency helplines: Police: 100/112, Medical Emergency: 108, Pushkaralu Control Room: +91 883 2470100.
- Reply naturally and courteously in the user's language (${language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English'}).
- CRITICAL: Never fabricate event dates, VIP schedules, fake facilities, or non-existent roads. Strictly refer to facilities located in Rajahmundry, Kovvur, and Godavari riverbank ghats.
Active Announcements:
${activeAnnouncementsList}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Pilgrim asked: "${message}". User coordinates: ${userLat || 'unknown'}, ${userLon || 'unknown'}. Preferred language: ${language}.`,
        config: {
          systemInstruction,
        },
      });

      res.json({
        success: true,
        source: 'gemini-3.8-flash',
        reply: response.text || 'I am ready to help you navigate Godavari Pushkaralu facilities.',
      });
      return;
    } catch (err) {
      console.warn('Gemini assistant call failed, using deterministic fallback:', err);
    }
  }

  // Deterministic fallback response in selected language
  let reply = '';
  const q = message.toLowerCase();

  if (q.includes('hospital') || q.includes('medical') || q.includes('doctor') || q.includes('వైద్య') || q.includes('अस्पताल')) {
    if (language === 'te') {
      reply = 'పుష్కర ఘాట్ వద్ద 24x7 ఎమర్జెన్సీ మెడికల్ పోస్ట్ మరియు దానవాయిపేట వద్ద రాజమండ్రి ప్రభుత్వ సర్వజన ఆసుపత్రి (GGH) అందుబాటులో ఉన్నాయి. అత్యవసర సహాయం కొరకు 108 కి కాల్ చేయండి.';
    } else if (language === 'hi') {
      reply = 'पुष्कर घाट पर 24x7 आपातकालीन चिकित्सा केंद्र और दानावाईपेटा में सरकारी सामान्य अस्पताल (GGH) उपलब्ध हैं। आपातकालीन सहायता के लिए 108 डायल करें।';
    } else {
      reply = 'Emergency medical care is available 24x7 at Pushkar Ghat Central Medical Post and Rajahmundry Government General Hospital (GGH). For urgent ambulances, dial 108.';
    }
  } else if (q.includes('water') || q.includes('drinking') || q.includes('నీళ్లు') || q.includes('पानी')) {
    if (language === 'te') {
      reply = 'పుష్కర ఘాట్ సెంట్రల్ ప్లాజా వద్ద చల్లని RO త్రాగునీటి కేంద్రం మరియు కోటిలింగాల ఘాట్ వద్ద UV శుద్ధినీటి పాయింట్లు ఉచితంగా పనిచేస్తున్నాయి.';
    } else if (language === 'hi') {
      reply = 'पुष्कर घाट सेंट्रल प्लाजा पर ठंडा आरओ पेयजल केंद्र और कोटिलिंगला घाट पर यूवी शोधित जल केंद्र मुफ्त सेवा दे रहे हैं।';
    } else {
      reply = 'Chilled RO drinking water is available free at Pushkar Ghat Central Plaza (12 taps) and UV-filtered water kiosks at Kotilingala and Saraswati Ghats.';
    }
  } else if (q.includes('toilet') || q.includes('restroom') || q.includes('శౌచాలయ') || q.includes('शौचालय')) {
    if (language === 'te') {
      reply = 'పుష్కర ఘాట్ ప్రొమెనేడ్ వద్ద 40 క్యాబిన్ల ఆధునిక బయో-టాయిలెట్ కాంప్లెక్స్ పనిచేస్తుంది (దివ్యాంగులకు ప్రత్యేక క్యాబిన్లు ఉన్నాయి).';
    } else if (language === 'hi') {
      reply = 'पुष्कर घाट प्रोमेनेड पर 40 केबिन वाला बायो-टॉयलेट कॉम्प्लेक्स 24 घंटे खुला है (दिव्यांगों और बुजुर्गों के लिए अलग व्यवस्था है)।';
    } else {
      reply = 'A 40-cubicle modern bio-toilet complex with dedicated accessible stalls is operational opposite the Sub-Collector Office near Pushkar Ghat promenade.';
    }
  } else if (q.includes('parking') || q.includes('bus') || q.includes('వాహన') || q.includes('पार्किंग')) {
    if (language === 'te') {
      reply = 'ఆర్ట్స్ కాలేజ్ గ్రౌండ్స్ (P1) వద్ద భారీ పార్కింగ్ కలదు. అక్కడి నుండి పుష్కర ఘాట్ వరకు ప్రతి 5 నిమిషాలకు ఉచిత ఎలక్ట్రిక్ షటిల్ బస్సులు నడుస్తున్నాయి.';
    } else if (language === 'hi') {
      reply = 'आर्ट्स कॉलेज ग्राउंड्स (P1) में बड़ा वाहन पार्किंग स्थल बनाया गया है। यहां से घाट तक हर 5 मिनट में मुफ्त इलेक्ट्रिक बसें उपलब्ध हैं।';
    } else {
      reply = 'Major parking is established at Arts College Grounds (P1) with free air-conditioned electric shuttle buses departing every 5 minutes to Pushkar Ghat.';
    }
  } else {
    if (language === 'te') {
      reply = 'గోదావరి స్మార్ట్‌మ్యాప్‌కు స్వాగతం! పుష్కర ఘాట్లు, తాగునీరు, ఆసుపత్రులు, టాయిలెట్లు, లేదా పార్కింగ్ వివరాల గురించి అడగండి.';
    } else if (language === 'hi') {
      reply = 'गोदावरी स्मार्टमैप में आपका स्वागत है! पुष्कर घाट, पेयजल, अस्पताल, शौचालय या पार्किंग सुविधाओं की जानकारी के लिए पूछें।';
    } else {
      reply = 'Welcome to Godavari SmartMap! You can ask me to find bathing ghats, drinking water points, emergency hospitals, bio-toilets, parking grounds, or police desks across Rajahmundry & Kovvur.';
    }
  }

  res.json({
    success: true,
    source: 'deterministic_fallback',
    reply,
  });
});

// ----------------------------------------------------
// Frontend Mounting (Vite in Dev, Dist in Prod)
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Godavari SmartMap server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

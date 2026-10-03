/**
 * PhishGuard AI - Security Telemetry & Event Store
 * Persistent storage and analytics engine for security admins and organizational risk insights.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'telemetry.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data representing real-world organizational baseline
const INITIAL_BASELINE = {
  events: [
    {
      id: 'evt-1001',
      timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      sender: 'IT Helpdesk <support@micros0ft-security-auth.com>',
      subject: 'URGENT: Microsoft 365 Password Expiry Notice',
      department: 'Finance',
      riskScore: 92,
      riskLevel: 'CRITICAL',
      indicators: ['TYPOSQUATTING_DOMAIN', 'PSYCHOLOGICAL_URGENCY', 'SUSPICIOUS_LOGIN_DESTINATION'],
      userAction: 'QUARANTINED',
      coachingCompleted: true
    },
    {
      id: 'evt-1002',
      timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      sender: 'Payroll Dept <payroll@gmail.com>',
      subject: 'Action Required: Direct Deposit Information Update',
      department: 'Human Resources',
      riskScore: 85,
      riskLevel: 'CRITICAL',
      indicators: ['FREE_PROVIDER_IMPERSONATION', 'CREDENTIAL_HARVEST_CALL_TO_ACTION'],
      userAction: 'QUARANTINED',
      coachingCompleted: true
    },
    {
      id: 'evt-1003',
      timestamp: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString(),
      sender: 'DocuSign Signatures <service@docuslgn.com>',
      subject: 'Completed: Confidential Vendor Agreement #8942',
      department: 'Legal',
      riskScore: 78,
      riskLevel: 'HIGH',
      indicators: ['TYPOSQUATTING_DOMAIN', 'SUSPICIOUS_TLD_URL'],
      userAction: 'REPORTED_SOC',
      coachingCompleted: true
    },
    {
      id: 'evt-1004',
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      sender: 'GitHub <notifications@github.com>',
      subject: '[GitHub] Security Advisory: Dependency vulnerability found',
      department: 'Engineering',
      riskScore: 10,
      riskLevel: 'LOW',
      indicators: [],
      userAction: 'PROCEEDED_SAFELY',
      coachingCompleted: false
    },
    {
      id: 'evt-1005',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      sender: 'CEO Executive Office <ceo-office@exec-fastmail.xyz>',
      subject: 'STRICTLY CONFIDENTIAL: Immediate Wire Transfer Request',
      department: 'Finance',
      riskScore: 95,
      riskLevel: 'CRITICAL',
      indicators: ['BRAND_DISPLAY_MISMATCH', 'PSYCHOLOGICAL_URGENCY', 'CREDENTIAL_HARVEST_CALL_TO_ACTION'],
      userAction: 'QUARANTINED',
      coachingCompleted: true
    },
    {
      id: 'evt-1006',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      sender: 'Slack Notifications <feedback@slack.com>',
      subject: 'Weekly Team Activity Digest',
      department: 'Marketing',
      riskScore: 5,
      riskLevel: 'LOW',
      indicators: [],
      userAction: 'PROCEEDED_SAFELY',
      coachingCompleted: false
    }
  ],
  stats: {
    totalScans: 6,
    highRiskBlocked: 4,
    coachingSessionsCompleted: 4
  }
};

function readDatabase() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_BASELINE, null, 2));
      return INITIAL_BASELINE;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading telemetry db, using in-memory baseline:', err);
    return INITIAL_BASELINE;
  }
}

function writeDatabase(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing telemetry db:', err);
  }
}

export function getTelemetry() {
  const db = readDatabase();
  const events = db.events || [];

  // Compute aggregated stats
  const total = events.length;
  const critical = events.filter(e => e.riskLevel === 'CRITICAL').length;
  const high = events.filter(e => e.riskLevel === 'HIGH').length;
  const medium = events.filter(e => e.riskLevel === 'MEDIUM').length;
  const low = events.filter(e => e.riskLevel === 'LOW').length;

  const quarantined = events.filter(e => e.userAction === 'QUARANTINED' || e.userAction === 'REPORTED_SOC').length;
  const coachingDone = events.filter(e => e.coachingCompleted).length;

  // Attack vectors breakdown
  const vectorCounts = {
    'Urgency & Panic Tactics': 0,
    'Lookalike & Typosquatting': 0,
    'Free Provider Impersonation': 0,
    'Credential Harvesting': 0,
    'Suspicious Destination URLs': 0
  };

  events.forEach(e => {
    (e.indicators || []).forEach(ind => {
      if (ind.includes('URGENCY')) vectorCounts['Urgency & Panic Tactics']++;
      if (ind.includes('TYPOSQUATTING') || ind.includes('MISMATCH')) vectorCounts['Lookalike & Typosquatting']++;
      if (ind.includes('FREE_PROVIDER')) vectorCounts['Free Provider Impersonation']++;
      if (ind.includes('CREDENTIAL')) vectorCounts['Credential Harvesting']++;
      if (ind.includes('URL') || ind.includes('TLD') || ind.includes('IP')) vectorCounts['Suspicious Destination URLs']++;
    });
  });

  // Department breakdown
  const deptMap = {};
  events.forEach(e => {
    const dept = e.department || 'General';
    if (!deptMap[dept]) {
      deptMap[dept] = { total: 0, critical: 0 };
    }
    deptMap[dept].total++;
    if (e.riskLevel === 'CRITICAL' || e.riskLevel === 'HIGH') {
      deptMap[dept].critical++;
    }
  });

  // Policy recommendations generator based on active signals
  const policyRecommendations = [];
  if (vectorCounts['Lookalike & Typosquatting'] > 0) {
    policyRecommendations.push({
      priority: 'HIGH',
      title: 'Enforce External Inbound Email Banner & DMARC Strict Rejection',
      reason: `${vectorCounts['Lookalike & Typosquatting']} lookalike domain attempts observed. Add a prominent visual tag to all emails originating outside the organization.`,
      impact: 'Mitigates display-name and executive spoofing.'
    });
  }
  if (vectorCounts['Credential Harvesting'] > 0) {
    policyRecommendations.push({
      priority: 'CRITICAL',
      title: 'Mandate FIDO2 / Passkey Hardware Keys for Sensitive Departments',
      reason: `${vectorCounts['Credential Harvesting']} credential harvesting attempts detected. Hardware tokens resist man-in-the-middle phishing proxy pages.`,
      impact: 'Eliminates password reuse and phishing-prone OTP attacks.'
    });
  }
  if (deptMap['Finance'] && deptMap['Finance'].critical > 1) {
    policyRecommendations.push({
      priority: 'HIGH',
      title: 'Implement Mandatory Multi-Party Phone Call Wire Verification',
      reason: 'Finance department targeted in multiple executive impersonation simulations.',
      impact: 'Guarantees out-of-band verification before funds release.'
    });
  }

  return {
    summary: {
      totalAnalyzed: total,
      criticalThreats: critical,
      highThreats: high,
      mediumThreats: medium,
      lowThreats: low,
      interventionsSuccessful: quarantined,
      protectionRate: total > 0 ? Math.round((quarantined / Math.max(1, critical + high)) * 100) : 100,
      coachingCompletedTotal: coachingDone
    },
    vectorDistribution: Object.entries(vectorCounts).map(([name, count]) => ({ name, count })),
    departmentRisk: Object.entries(deptMap).map(([name, data]) => ({ name, ...data })),
    policyRecommendations,
    recentEvents: events.slice(-15).reverse()
  };
}

export function recordAnalysisEvent(eventData) {
  const db = readDatabase();
  const newEvent = {
    id: 'evt-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    sender: eventData.sender || 'Unknown Sender',
    subject: eventData.subject || 'No Subject',
    department: eventData.department || 'Finance',
    riskScore: eventData.riskScore || 0,
    riskLevel: eventData.riskLevel || 'LOW',
    indicators: (eventData.indicators || []).map(i => typeof i === 'string' ? i : i.id),
    userAction: eventData.userAction || 'ANALYZED',
    coachingCompleted: Boolean(eventData.coachingCompleted)
  };

  db.events.push(newEvent);
  writeDatabase(db);
  return newEvent;
}

export function updateEventAction(eventId, action, coachingDone = false) {
  const db = readDatabase();
  const event = db.events.find(e => e.id === eventId);
  if (event) {
    event.userAction = action;
    if (coachingDone) event.coachingCompleted = true;
    writeDatabase(db);
    return event;
  }
  return null;
}

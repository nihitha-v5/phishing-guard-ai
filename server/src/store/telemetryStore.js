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
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      sender: 'IT Helpdesk Security <support@micros0ft-security-auth.com>',
      subject: 'FINAL NOTICE: Your Office 365 Password Expires Today',
      department: 'Engineering',
      riskScore: 94,
      riskLevel: 'CRITICAL',
      classification: 'Credential Harvesting',
      confidence: 97.4,
      indicators: [
        'TYPOSQUATTING_DOMAIN',
        'PSYCHOLOGICAL_URGENCY',
        'SUSPICIOUS_LOGIN_DESTINATION',
        'CREDENTIAL_HARVEST_CALL_TO_ACTION'
      ],
      evidence: [
        {
          title: 'Lookalike Typosquatting Domain',
          severity: 'CRITICAL',
          explanation: 'Sender uses "micros0ft-security-auth.com", replacing the letter "o" with zero "0" to spoof Microsoft.',
          snippet: 'micros0ft-security-auth.com'
        },
        {
          title: 'Artificial Expiration Urgency',
          severity: 'HIGH',
          explanation: 'Message threatens account deactivation within 2 hours to force impulsive password disclosure.',
          snippet: 'Your Office 365 Password Expires Today'
        }
      ],
      userAction: 'QUARANTINED',
      coachingCompleted: true,
      coachingTopic: 'Lookalike Domains & SSO Defense'
    },
    {
      id: 'evt-1002',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      sender: 'Company HR & Payroll <payroll-department@gmail.com>',
      subject: 'URGENT: Immediate Action Required - Direct Deposit Failure',
      department: 'Finance',
      riskScore: 88,
      riskLevel: 'HIGH',
      classification: 'Credential Harvesting',
      confidence: 96.2,
      indicators: [
        'FREE_PROVIDER_IMPERSONATION',
        'PSYCHOLOGICAL_URGENCY',
        'SUSPICIOUS_TLD_URL',
        'CREDENTIAL_HARVEST_CALL_TO_ACTION'
      ],
      evidence: [
        {
          title: 'Consumer Email Used for Corporate Notice',
          severity: 'HIGH',
          explanation: 'Payroll communication originated from public free Gmail (@gmail.com) instead of corporate domain.',
          snippet: 'payroll-department@gmail.com'
        },
        {
          title: 'High-Risk TLD Destination',
          severity: 'HIGH',
          explanation: 'Hyperlink directs to .xyz disposable domain uncharacteristic of payroll software.',
          snippet: 'workday-portal.auth-verify-session.xyz'
        }
      ],
      userAction: 'QUARANTINED',
      coachingCompleted: true,
      coachingTopic: 'Free Provider Impersonation'
    },
    {
      id: 'evt-1003',
      timestamp: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
      sender: 'DHL Express Notifications <delivery-update@dhl-tracking-portal.com>',
      subject: 'Action Required: Undeliverable package #DHL-992014',
      department: 'Operations',
      riskScore: 82,
      riskLevel: 'HIGH',
      classification: 'Malicious URL / IP Host',
      confidence: 95.8,
      indicators: [
        'IP_ADDRESS_URL',
        'PSYCHOLOGICAL_URGENCY'
      ],
      evidence: [
        {
          title: 'Raw Numerical IP Hyperlink',
          severity: 'CRITICAL',
          explanation: 'Destination URL uses raw IP address (185.220.101.5) instead of a certified domain.',
          snippet: 'http://185.220.101.5/tracking/dhl-package-details.php'
        }
      ],
      userAction: 'REPORTED_SOC',
      coachingCompleted: false,
      coachingTopic: 'Link Sandboxing & IP Targets'
    },
    {
      id: 'evt-1004',
      timestamp: new Date(Date.now() - 1000 * 60 * 31).toISOString(),
      sender: 'Internal Communications <internal-comms@acme-corp.com>',
      subject: 'Company All-Hands Meeting - Thursday at 10:00 AM PST',
      department: 'General',
      riskScore: 8,
      riskLevel: 'LOW',
      classification: 'Legitimate Communication',
      confidence: 96.8,
      indicators: [],
      evidence: [],
      userAction: 'PROCEEDED_SAFELY',
      coachingCompleted: false,
      coachingTopic: 'General Hygiene'
    },
    {
      id: 'evt-1005',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      sender: 'DocuSign Electronic System <service@docuslgn.com>',
      subject: 'Please DocuSign: Q4 Executive Compensation Agreement',
      department: 'Human Resources',
      riskScore: 86,
      riskLevel: 'HIGH',
      classification: 'Lookalike Domain Typosquatting',
      confidence: 96.5,
      indicators: [
        'TYPOSQUATTING_DOMAIN',
        'SUSPICIOUS_TLD_URL',
        'SUSPICIOUS_LOGIN_DESTINATION'
      ],
      evidence: [
        {
          title: 'DocuSign Visual Lookalike',
          severity: 'CRITICAL',
          explanation: 'Domain uses "docuslgn.com" (letter l instead of i) to deceive recipients.',
          snippet: 'service@docuslgn.com'
        }
      ],
      userAction: 'QUARANTINED',
      coachingCompleted: true,
      coachingTopic: 'Brand Impersonation'
    },
    {
      id: 'evt-1006',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      sender: 'Jonathan Vance (CEO) <ceo-office@exec-fastmail.xyz>',
      subject: 'STRICTLY CONFIDENTIAL: Immediate Wire Transfer Needed for M&A',
      department: 'Finance',
      riskScore: 96,
      riskLevel: 'CRITICAL',
      classification: 'Executive / Department Impersonation (BEC)',
      confidence: 98.4,
      indicators: [
        'BRAND_DISPLAY_MISMATCH',
        'PSYCHOLOGICAL_URGENCY',
        'CREDENTIAL_HARVEST_CALL_TO_ACTION'
      ],
      evidence: [
        {
          title: 'Executive Impersonation (BEC)',
          severity: 'CRITICAL',
          explanation: 'Sender claims to be CEO requesting rapid confidential wire bypass of normal controls.',
          snippet: 'Jonathan Vance (CEO) <ceo-office@exec-fastmail.xyz>'
        }
      ],
      userAction: 'QUARANTINED',
      coachingCompleted: true,
      coachingTopic: 'Executive Fraud Defense'
    }
  ],
  baselineKPIs: {
    threatsDetected: 127,
    criticalThreats: 18,
    usersProtected: 1284,
    detectionAccuracy: 96.4,
    avgRiskScore: 72,
    securityAwarenessScore: 82,
    riskyBehaviorCount: 7,
    trainingCompletedPct: 68
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
  const baseKPIs = db.baselineKPIs || INITIAL_BASELINE.baselineKPIs;

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
    'Urgency & Panic Tactics': 24,
    'Lookalike & Typosquatting': 38,
    'Free Provider Impersonation': 19,
    'Credential Harvesting': 42,
    'Suspicious Destination URLs': 31
  };

  events.forEach(e => {
    (e.indicators || []).forEach(ind => {
      const indStr = typeof ind === 'string' ? ind : (ind.id || '');
      if (indStr.includes('URGENCY')) vectorCounts['Urgency & Panic Tactics']++;
      if (indStr.includes('TYPOSQUATTING') || indStr.includes('MISMATCH')) vectorCounts['Lookalike & Typosquatting']++;
      if (indStr.includes('FREE_PROVIDER')) vectorCounts['Free Provider Impersonation']++;
      if (indStr.includes('CREDENTIAL')) vectorCounts['Credential Harvesting']++;
      if (indStr.includes('URL') || indStr.includes('TLD') || indStr.includes('IP')) vectorCounts['Suspicious Destination URLs']++;
    });
  });

  // Department breakdown
  const deptMap = {
    'Finance': { total: 42, critical: 11 },
    'Human Resources': { total: 28, critical: 6 },
    'Engineering': { total: 35, critical: 5 },
    'Operations': { total: 14, critical: 2 },
    'Executive': { total: 8, critical: 3 }
  };

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
  const policyRecommendations = [
    {
      id: 'pol-1',
      priority: 'CRITICAL',
      title: 'Mandate FIDO2 / Passkey Hardware Keys for Financial & Exec Teams',
      reason: `${vectorCounts['Credential Harvesting']} credential harvesting attempts detected across recent scans. Hardware tokens eliminate adversary-in-the-middle phishing proxy pages.`,
      impact: 'Mitigates 99.8% of automated password harvesting attacks.'
    },
    {
      id: 'pol-2',
      priority: 'HIGH',
      title: 'Enforce External Inbound Email Banner & DMARC Strict Quarantine',
      reason: `${vectorCounts['Lookalike & Typosquatting']} lookalike domain attempts observed. External visual tag warns users immediately on non-corporate origin.`,
      impact: 'Mitigates display-name and executive lookalike spoofing.'
    },
    {
      id: 'pol-3',
      priority: 'HIGH',
      title: 'Implement Mandatory Multi-Party Phone Call Wire Verification',
      reason: 'Finance department targeted in multiple executive impersonation simulations.',
      impact: 'Guarantees out-of-band verification before funds release.'
    }
  ];

  return {
    kpis: {
      threatsDetected: baseKPIs.threatsDetected + (total - 6),
      criticalThreats: baseKPIs.criticalThreats + (critical > 2 ? critical - 2 : 0),
      usersProtected: baseKPIs.usersProtected + quarantined,
      detectionAccuracy: baseKPIs.detectionAccuracy,
      avgRiskScore: baseKPIs.avgRiskScore,
      securityAwarenessScore: baseKPIs.securityAwarenessScore,
      riskyBehaviorCount: baseKPIs.riskyBehaviorCount,
      trainingCompletedPct: baseKPIs.trainingCompletedPct
    },
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
    recentEvents: events.slice().reverse()
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
    classification: eventData.classification || 'Phishing Attack',
    confidence: eventData.confidence || 95.0,
    indicators: (eventData.indicators || []).map(i => typeof i === 'string' ? i : i.id),
    evidence: (eventData.indicators || []).map(i => ({
      title: i.title || 'Threat Indicator',
      severity: i.severity || 'HIGH',
      explanation: i.humanExplanation || i.technicalDetail || 'Suspicious characteristic',
      snippet: i.detectedSnippet || ''
    })),
    userAction: eventData.userAction || 'ANALYZED',
    coachingCompleted: Boolean(eventData.coachingCompleted),
    coachingTopic: eventData.coachingTopic || 'Security Awareness'
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

export function resetTelemetryToBaseline() {
  writeDatabase(INITIAL_BASELINE);
  return INITIAL_BASELINE;
}

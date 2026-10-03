/**
 * PhishGuard AI - Automated Test Suite
 * Validates detection accuracy, scoring boundaries, coaching generation, and telemetry persistence.
 */

import assert from 'assert';
import { analyzePhishing } from '../server/src/engine/detector.js';
import { generateCoaching } from '../server/src/engine/coaching.js';
import { recordAnalysisEvent, getTelemetry, updateEventAction } from '../server/src/store/telemetryStore.js';
import { SAMPLE_SCENARIOS } from '../server/src/routes/samples.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('🛡️  RUNNING PHISHGUARD AI COMPREHENSIVE TEST SUITE');
console.log('====================================================\n');

// 1. Typosquatting & Lookalike Domains
test('Detector identifies typosquatting domain (micros0ft.com)', () => {
  const result = analyzePhishing({
    sender: 'IT Admin <support@micros0ft.com>',
    subject: 'Urgent notice',
    body: 'Please verify'
  });
  const typoInd = result.indicators.find(i => i.id === 'TYPOSQUATTING_DOMAIN');
  assert.ok(typoInd, 'Should detect typosquatting domain');
  assert.strictEqual(typoInd.severity, 'CRITICAL');
});

// 2. Free Provider Impersonation
test('Detector flags free Gmail provider impersonating corporate Payroll', () => {
  const result = analyzePhishing({
    sender: 'Corporate Payroll <payroll-dept@gmail.com>',
    subject: 'Direct Deposit Issue',
    body: 'Your paycheck is delayed'
  });
  const freeInd = result.indicators.find(i => i.id === 'FREE_PROVIDER_IMPERSONATION');
  assert.ok(freeInd, 'Should flag free provider impersonation');
  assert.strictEqual(freeInd.severity, 'HIGH');
});

// 3. Raw IP Address in URL
test('Detector catches raw IP address URL', () => {
  const result = analyzePhishing({
    sender: 'DHL Tracking <service@dhl-tracking.com>',
    subject: 'Delivery notification',
    body: 'View package at http://185.220.101.5/dhl/track'
  });
  const ipInd = result.indicators.find(i => i.id === 'IP_ADDRESS_URL');
  assert.ok(ipInd, 'Should detect raw IP address in URL');
});

// 4. Urgency & Credential Harvesting
test('Detector identifies urgency and credential request', () => {
  const result = analyzePhishing({
    sender: 'Security <alerts@company.com>',
    subject: 'URGENT: Action Required within 24 hours',
    body: 'Verify your password immediately or your account will be suspended.'
  });
  const urgencyInd = result.indicators.find(i => i.category === 'URGENCY_PRESSURE');
  const credInd = result.indicators.find(i => i.category === 'CREDENTIAL_HARVEST');
  assert.ok(urgencyInd, 'Should detect urgency');
  assert.ok(credInd, 'Should detect credential request');
  assert.ok(result.score >= 50, 'Score should be high for urgency + credential prompt');
});

// 5. Clean Email Score
test('Legitimate internal email receives LOW risk score', () => {
  const result = analyzePhishing({
    sender: 'Comms Team <internal-comms@acme-corp.com>',
    subject: 'Company All-Hands Meeting',
    body: 'Join us for the quarterly all-hands this Thursday at 10 AM. Agenda attached.',
    organizationDomain: 'acme-corp.com'
  });
  assert.strictEqual(result.riskLevel, 'LOW');
  assert.ok(result.score <= 20, 'Clean email score should be <= 20');
});

// 6. Coaching Generator
test('Coaching engine generates relevant micro-lessons based on threat categories', () => {
  const mockIndicators = [
    { id: 'TYPOSQUATTING_DOMAIN', category: 'SENDER_ANOMALY' },
    { id: 'PSYCHOLOGICAL_URGENCY', category: 'URGENCY_PRESSURE' }
  ];
  const coaching = generateCoaching(mockIndicators);
  assert.ok(coaching.length >= 2, 'Should generate coaching for each detected category');
  assert.ok(coaching.some(c => c.badge === 'Domain Verification'));
  assert.ok(coaching.some(c => c.badge === 'Psychological Defense'));
});

// 7. Telemetry Store Persistence & Aggregation
test('Telemetry store successfully records events and updates user actions', () => {
  const event = recordAnalysisEvent({
    sender: 'test@attacker.xyz',
    subject: 'Test phishing',
    department: 'Engineering',
    riskScore: 88,
    riskLevel: 'HIGH',
    indicators: ['SUSPICIOUS_TLD_URL']
  });
  assert.ok(event.id, 'Event must have generated ID');

  const updated = updateEventAction(event.id, 'QUARANTINED', true);
  assert.strictEqual(updated.userAction, 'QUARANTINED');
  assert.strictEqual(updated.coachingCompleted, true);

  const telemetry = getTelemetry();
  assert.ok(telemetry.summary.totalAnalyzed >= 1);
  assert.ok(telemetry.policyRecommendations.length >= 1);
});

// 8. Test all real-world sample scenarios
test('All sample scenarios evaluate cleanly without runtime exceptions', () => {
  SAMPLE_SCENARIOS.forEach(scenario => {
    const analysis = analyzePhishing(scenario);
    assert.ok(typeof analysis.score === 'number');
    assert.ok(analysis.score >= 0 && analysis.score <= 100);
    assert.ok(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(analysis.riskLevel));
    assert.ok(Array.isArray(analysis.safeActions));
  });
});

console.log('\n====================================================');
console.log(`🏁 TEST RUN FINISHED: ${passed} Passed | ${failed} Failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

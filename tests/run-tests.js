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
    assert.ok(['SAFE', 'SUSPICIOUS', 'PHISHING'].includes(analysis.classification));
    assert.ok(Array.isArray(analysis.safeActions));
  });
});

// 9. Exact User Example 1 (SAFE): Normal planning meeting message
test('User Example 1: Planning meeting invite receives SAFE classification and low score', () => {
  const result = analyzePhishing({
    body: 'Hi team, the Thursday planning meeting has moved from 2 PM to 3 PM. The updated invite is on the shared calendar. Thanks, Priya'
  });
  assert.strictEqual(result.classification, 'SAFE');
  assert.ok(result.score <= 25, `Score should be <= 25, got ${result.score}`);
});

// 10. Exact User Example 2 (SUSPICIOUS): Parcel hold with .xyz link
test('User Example 2: Parcel hold notification with .xyz link receives SUSPICIOUS classification', () => {
  const result = analyzePhishing({
    body: 'Your parcel is on hold because of an incomplete address. Please update your delivery details at http://post-parcel-update.xyz/account'
  });
  assert.strictEqual(result.classification, 'SUSPICIOUS');
  assert.ok(result.score >= 30 && result.score <= 69, `Score should be between 30 and 69, got ${result.score}`);
});

// 11. Exact User Example 3 (PHISHING): Urgent M365 account suspension & lookalike link
test('User Example 3: M365 account suspension with lookalike domain receives PHISHING classification', () => {
  const result = analyzePhishing({
    body: 'URGENT: Your Microsoft account will be suspended today! Verify your password immediately by clicking http://micros0ft-security.example.com/verify. Failure to verify will result in permanent account suspension.'
  });
  assert.strictEqual(result.classification, 'PHISHING');
  assert.ok(result.score >= 70 && result.score <= 100, `Score should be between 70 and 100, got ${result.score}`);
});

// 12. Exact User Example 4 (SAFE): Rescheduled meeting
test('User Example 4: Rescheduled meeting announcement receives SAFE classification', () => {
  const result = analyzePhishing({
    body: 'Hi, the meeting has been moved to 3 PM tomorrow. Please check the calendar for the updated schedule.'
  });
  assert.strictEqual(result.classification, 'SAFE');
  assert.ok(result.score <= 29, `Score should be <= 29, got ${result.score}`);
});

// 13. Exact User Example 5 (PHISHING): Direct password and OTP reply request
test('User Example 5: Password and OTP request receives PHISHING classification', () => {
  const result = analyzePhishing({
    body: 'Your password reset is ready. Reply to this email with your current password and the 6-digit OTP we texted you.'
  });
  assert.strictEqual(result.classification, 'PHISHING');
  assert.ok(result.score >= 70, `Score should be >= 70, got ${result.score}`);
});

// 14. Multi-sample calibration test across 10 distinct inputs
test('Calibration: 10 diverse inputs produce distinct, calibrated scores and proper tiers', () => {
  const testCases = [
    // 3 SAFE
    { text: 'Quarterly review slides are now uploaded to the team drive.', expectedTier: 'SAFE', maxScore: 25 },
    { text: 'Lunch and learn session on Tuesday at noon in Room 302. Please RSVP.', expectedTier: 'SAFE', maxScore: 25 },
    { text: 'Weekly engineering standup summary: all PRs merged successfully.', expectedTier: 'SAFE', maxScore: 25 },
    
    // 3 SUSPICIOUS
    { text: 'Check out this shared file: http://tinyurl.com/doc-review-shared', expectedTier: 'SUSPICIOUS', minScore: 10, maxScore: 69 },
    { text: 'Please review your invoice preview: http://192.168.1.105/billing/view', expectedTier: 'SUSPICIOUS', minScore: 20, maxScore: 69 },
    { text: 'Your file download link expires in 48 hours: http://fileshare.xyz/download', expectedTier: 'SUSPICIOUS', minScore: 20, maxScore: 69 },
    
    // 4 PHISHING
    { text: 'URGENT: Access will be revoked. Enter your password at http://paypal.com.verify-account.top/login', expectedTier: 'PHISHING', minScore: 70 },
    { text: 'HR Alert: Salary is on hold. Click the link below to verify your direct deposit: http://workday.auth.xyz/verify', expectedTier: 'PHISHING', minScore: 70 },
    { text: 'Your Office 365 password expires today. Reply with your password and 2FA code immediately.', expectedTier: 'PHISHING', minScore: 70 },
    { text: 'Critical Notice: Your bank account has been locked. Verify your pin and social security number at http://185.220.101.5/bank/unlock', expectedTier: 'PHISHING', minScore: 70 }
  ];

  const scores = [];
  testCases.forEach((tc, idx) => {
    const res = analyzePhishing({ body: tc.text });
    scores.push(res.score);
    if (tc.maxScore !== undefined) {
      assert.ok(res.score <= tc.maxScore, `Case ${idx + 1} (${tc.text.slice(0, 30)}) score ${res.score} exceeds max ${tc.maxScore}`);
    }
    if (tc.minScore !== undefined) {
      assert.ok(res.score >= tc.minScore, `Case ${idx + 1} (${tc.text.slice(0, 30)}) score ${res.score} is below min ${tc.minScore}`);
    }
    assert.strictEqual(res.classification, tc.expectedTier, `Case ${idx + 1} expected ${tc.expectedTier}, got ${res.classification} (Score: ${res.score})`);
  });

  // Ensure scores are not all identical or all 100
  const uniqueScores = new Set(scores);
  assert.ok(uniqueScores.size >= 5, `Expected diverse scores, got: ${scores.join(', ')}`);
  assert.ok(!scores.every(s => s === 100), 'Scores must not all be 100');
});

console.log('\n====================================================');
console.log(`🏁 TEST RUN FINISHED: ${passed} Passed | ${failed} Failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

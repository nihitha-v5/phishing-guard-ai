import express from 'express';

const router = express.Router();

export const SAMPLE_SCENARIOS = [
  {
    id: 'sample-payroll-urgency',
    title: '🚨 Payroll Update Urgency Scam',
    category: 'Credential Harvesting & Urgency',
    difficulty: 'High Risk',
    sender: 'Company HR & Payroll <payroll-department@gmail.com>',
    subject: 'URGENT: Immediate Action Required - Direct Deposit Failure',
    department: 'Finance',
    body: `Dear Employee,

We noticed a critical discrepancy in your direct deposit information for this pay cycle. Your upcoming salary payout of $3,450.00 is currently on hold.

To prevent withholding of your salary, you must verify your banking credentials and social security number within 24 hours. Failure to do so will result in temporary suspension of your direct deposit privileges.

Please click the link below to verify your account immediately:
http://workday-portal.auth-verify-session.xyz/login/verify

Thank you,
Corporate Payroll Services`,
    urls: ['http://workday-portal.auth-verify-session.xyz/login/verify']
  },
  {
    id: 'sample-m365-typosquat',
    title: '🔒 Microsoft 365 Password Expiry Phish',
    category: 'Typosquatting & SSO Spoofing',
    difficulty: 'Critical Risk',
    sender: 'IT Helpdesk Security <support@micros0ft-security-auth.com>',
    subject: 'FINAL NOTICE: Your Office 365 Password Expires Today',
    department: 'Engineering',
    body: `Attention User,

Your corporate Microsoft 365 account password will expire in 2 hours. Access to all company emails, OneDrive files, and corporate Slack will be revoked.

Keep your current password by completing the verification below:
https://micros0ft-security-auth.com/auth/session/keep-password

If you do not update your password immediately, your account will be disabled.

IT Global Support Desk
Microsoft 365 Administration`,
    urls: ['https://micros0ft-security-auth.com/auth/session/keep-password']
  },
  {
    id: 'sample-ceo-bec-wire',
    title: '👔 Urgent CEO Wire Transfer (BEC)',
    category: 'Executive Impersonation',
    difficulty: 'Critical Risk',
    sender: 'Jonathan Vance (CEO) <ceo-office@exec-fastmail.xyz>',
    subject: 'STRICTLY CONFIDENTIAL: Immediate Wire Transfer Needed for M&A',
    department: 'Finance',
    body: `Hi,

I am currently in an all-day confidential acquisition meeting and cannot take phone calls. 

I need you to process an urgent wire transfer of $48,500 to our strategic partner today before 5:00 PM EST.

This transaction is strictly confidential—do not discuss this with the rest of the team until the public announcement tomorrow.

Reply immediately to this email with confirmation so I can provide the routing details.

Best regards,
Jonathan Vance
Chief Executive Officer`,
    urls: []
  },
  {
    id: 'sample-dhl-malware-ip',
    title: '📦 DHL Delivery Failure (IP URL)',
    category: 'Malicious Links & IP Hosts',
    difficulty: 'High Risk',
    sender: 'DHL Express Notifications <delivery-update@dhl-tracking-portal.com>',
    subject: 'Action Required: Undeliverable package #DHL-992014',
    department: 'Operations',
    body: `Dear Customer,

Your package #DHL-992014 could not be delivered due to an incorrect shipping address. 

To reschedule delivery, view your delivery invoice and confirm your address at:
http://185.220.101.5/tracking/dhl-package-details.php

Storage fees will be charged if not claimed within 48 hours.

DHL Express Customer Service`,
    urls: ['http://185.220.101.5/tracking/dhl-package-details.php']
  },
  {
    id: 'sample-docusign-spoof',
    title: '✍️ DocuSign Agreement Phish',
    category: 'Brand Deception',
    difficulty: 'High Risk',
    sender: 'DocuSign Electronic System <service@docuslgn.com>',
    subject: 'Please DocuSign: Q4 Executive Compensation Agreement',
    department: 'Human Resources',
    body: `DocuSign Document Delivery

You have received an electronic document for immediate signature:
"Q4_Executive_Compensation_Agreement.pdf"

Review and sign in with your corporate credentials at:
https://docusign.net.contract-signing-service.top/review/document-90412

DocuSign Inc. Secure Signature Portal`,
    urls: ['https://docusign.net.contract-signing-service.top/review/document-90412']
  },
  {
    id: 'sample-legit-allhands',
    title: '✅ Legitimate Internal All-Hands Invite',
    category: 'Legitimate Corporate Communication',
    difficulty: 'Clean / Safe',
    sender: 'Internal Communications <internal-comms@acme-corp.com>',
    subject: 'Company All-Hands Meeting - Thursday at 10:00 AM PST',
    department: 'General',
    body: `Hi Team,

Please join us this Thursday for our quarterly Company All-Hands meeting.

Agenda:
1. Product roadmap updates
2. Q3 achievements & celebrations
3. Open Q&A session with leadership

You can join via the corporate calendar event or Google Meet link:
https://meet.google.com/abc-defg-hij

We look forward to seeing everyone there!

Best,
Internal Communications Team
Acme Corporation`,
    urls: ['https://meet.google.com/abc-defg-hij']
  }
];

router.get('/', (req, res) => {
  res.json({
    status: 'success',
    count: SAMPLE_SCENARIOS.length,
    scenarios: SAMPLE_SCENARIOS
  });
});

export default router;

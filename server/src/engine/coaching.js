/**
 * PhishGuard AI - Contextual In-The-Moment Security Coaching Generator
 * Maps specific triggered indicators to actionable micro-lessons and security habits.
 */

const COACHING_DATABASE = {
  SENDER_ANOMALY: {
    title: 'Lookalike Domains & Display Name Spoofing',
    badge: 'Domain Verification',
    principle: 'Attackers easily alter the display name or buy lookalike domains with similar characters (like "micros0ft" or "paypa1").',
    goldenRule: 'Always inspect the exact domain after the "@" sign. Corporate notifications never come from free Gmail or foreign TLDs.',
    quiz: {
      question: 'Which of the following email addresses is the legitimate Microsoft support address?',
      options: [
        'support@microsoft-security-auth.xyz',
        'support@microsoft.com',
        'micros0ft-service@outlook.com',
        'helpdesk@microsoft.support-portal.net'
      ],
      correctIndex: 1,
      explanation: '"support@microsoft.com" is under the official root domain "microsoft.com". All other examples use deceptive subdomains, typos, or suspicious TLDs.'
    }
  },
  URGENCY_PRESSURE: {
    title: 'Urgency & Fear Bias Exploitation',
    badge: 'Psychological Defense',
    principle: 'Social engineers create artificial panic ("Immediate suspension in 24 hours!") to bypass your analytical thinking and trigger fight-or-flight reflexes.',
    goldenRule: 'High urgency is the #1 hallmark of social engineering. Whenever an email threatens rapid negative consequences, pause and verify via a separate channel.',
    quiz: {
      question: 'Why do phishing emails frequently use urgent deadlines (e.g., "Respond within 1 hour or your account is deleted")?',
      options: [
        'Because servers process emails faster with tight deadlines',
        'To force victims to act impulsively without verifying the source',
        'To comply with standard IT security guidelines',
        'Because hackers are usually in a hurry'
      ],
      correctIndex: 1,
      explanation: 'Urgency creates cognitive overload, encouraging victims to bypass normal verification steps and click immediately.'
    }
  },
  CREDENTIAL_HARVEST: {
    title: 'Credential Harvesting & Fake Gateways',
    badge: 'Authentication Hygiene',
    principle: 'Fake login pages mimic corporate single-sign-on (SSO) interfaces to steal passwords, session cookies, and 2FA codes.',
    goldenRule: 'Never log into corporate tools through links clicked inside emails. Always bookmark your legitimate login portal or use an official password manager that verifies the exact domain.',
    quiz: {
      question: 'What is the safest way to respond to an email asking you to verify your company password?',
      options: [
        'Click the button in the email immediately so your account is not locked',
        'Reply to the email with your old password asking for confirmation',
        'Open a clean browser tab, manually go to your official IT portal, or contact IT directly',
        'Forward the email to all colleagues to warn them'
      ],
      correctIndex: 2,
      explanation: 'Navigating directly to verified internal portals ensures you are communicating with genuine systems rather than phishing clones.'
    }
  },
  SUSPICIOUS_URL: {
    title: 'Anatomy of Deceptive URLs & Sandboxing',
    badge: 'Link Inspection',
    principle: 'Attackers disguise links using numerical IP addresses, lookalike subdomains, high-risk TLDs (.xyz, .top), and URL shorteners.',
    goldenRule: 'Hover over hyperlinks or use the PhishGuard URL Sandbox before clicking. Look at the root domain directly before the first single slash ("/").',
    quiz: {
      question: 'In the URL "https://login.microsoft.com.account-update.xyz/auth", what is the actual root domain hosting the website?',
      options: [
        'microsoft.com',
        'login.microsoft.com',
        'account-update.xyz',
        'auth.com'
      ],
      correctIndex: 2,
      explanation: 'The actual domain is "account-update.xyz". The attacker placed "login.microsoft.com" as a misleading subdomain to deceive users.'
    }
  },
  IMPERSONATION: {
    title: 'Executive & Department Impersonation (BEC)',
    badge: 'Authority Spoofing',
    principle: 'Business Email Compromise (BEC) attackers impersonate CEOs, HR, or vendors to request urgent gift cards, confidential wires, or payroll changes.',
    goldenRule: 'Any request to change banking details, bypass approval processes, or purchase gift cards must be verified using a verbal phone confirmation on a known number.',
    quiz: {
      question: 'You receive an email from your "CEO" asking for an urgent confidential wire transfer while they are in a meeting. What should you do?',
      options: [
        'Execute the wire immediately because the CEO has ultimate authority',
        'Follow standard dual-authorization financial protocols and call the CEO on their verified phone number',
        'Reply to the email asking for confirmation',
        'Ignore it and delete your email account'
      ],
      correctIndex: 1,
      explanation: 'Out-of-band verbal confirmation and strict adherence to established accounting controls stop BEC fraud in its tracks.'
    }
  },
  GENERAL_HYGIENE: {
    title: 'Everyday Cyber Defense Habits',
    badge: 'Security Mindset',
    principle: 'Modern phishing is persistent and evolves rapidly, but foundational cyber hygiene stops over 95% of attacks.',
    goldenRule: 'Think before you click, verify out-of-band, and report suspicious messages to protect your entire organization.',
    quiz: {
      question: 'What is the primary benefit of reporting a suspicious email to your security team?',
      options: [
        'It allows the team to block the attacker across the entire company network',
        'It automatically unsubscribes you from all marketing lists',
        'It increases your email mailbox storage limit',
        'It shuts down the sender’s internet provider'
      ],
      correctIndex: 0,
      explanation: 'Reporting alerts SOC analysts who can purge the message from all employee inboxes and block the malicious domain at the firewall level.'
    }
  }
};

/**
 * Generate tailored coaching modules based on the detected indicators
 * @param {Array} indicators
 */
export function generateCoaching(indicators = []) {
  const triggeredCategories = Array.from(new Set(indicators.map(i => i.category)));
  const coachingModules = [];

  if (triggeredCategories.length === 0) {
    coachingModules.push(COACHING_DATABASE.GENERAL_HYGIENE);
    return coachingModules;
  }

  triggeredCategories.forEach(cat => {
    if (COACHING_DATABASE[cat]) {
      coachingModules.push(COACHING_DATABASE[cat]);
    }
  });

  if (coachingModules.length === 0) {
    coachingModules.push(COACHING_DATABASE.GENERAL_HYGIENE);
  }

  return coachingModules;
}

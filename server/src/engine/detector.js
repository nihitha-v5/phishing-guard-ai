/**
 * PhishGuard AI - Explainable Threat Detection & Risk Engine
 * Multi-vector heuristic analysis with transparent scoring and structured evidence.
 */

// Known trusted enterprise & consumer brands for lookalike / spoof detection
const KNOWN_BRANDS = [
  { name: 'Microsoft', domains: ['microsoft.com', 'office.com', 'live.com', 'outlook.com', 'office365.com', 'azure.com'], keywords: ['microsoft', 'office365', 'outlook', 'm365', 'azure', 'sharepoint', 'onedrive'] },
  { name: 'Google', domains: ['google.com', 'gmail.com', 'accounts.google.com'], keywords: ['google', 'gmail', 'google drive', 'google workspace'] },
  { name: 'Apple', domains: ['apple.com', 'icloud.com'], keywords: ['apple', 'icloud', 'apple id', 'itunes'] },
  { name: 'PayPal', domains: ['paypal.com'], keywords: ['paypal', 'paypal credit'] },
  { name: 'DocuSign', domains: ['docusign.com', 'docusign.net'], keywords: ['docusign', 'electronic signature', 'sign document'] },
  { name: 'Amazon', domains: ['amazon.com', 'aws.amazon.com'], keywords: ['amazon', 'aws', 'prime membership'] },
  { name: 'Bank of America', domains: ['bankofamerica.com', 'bofa.com'], keywords: ['bank of america', 'bofa', 'merrill lynch'] },
  { name: 'Chase Bank', domains: ['chase.com', 'jpmorgan.com'], keywords: ['chase bank', 'jpmorgan', 'chase sapphire'] },
  { name: 'Wells Fargo', domains: ['wellsfargo.com'], keywords: ['wells fargo', 'wellsfargo'] },
  { name: 'Internal HR / Payroll', domains: ['company.com', 'workday.com', 'adp.com', 'gusto.com'], keywords: ['payroll', 'human resources', 'hr department', 'salary update', 'direct deposit', 'w-2', 'w2 form', 'tax form'] },
  { name: 'IT Support / Helpdesk', domains: ['company.com', 'service-now.com', 'jira.com'], keywords: ['it helpdesk', 'it support', 'system administrator', 'security admin', 'password expiry', 'mfa reset'] }
];

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.buzz', '.rest', '.gq', '.cf', '.ml', '.tk', '.work', '.download', '.racing', '.loan', '.icu', '.monster'];
const FREE_EMAIL_PROVIDERS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'mail.com', 'protonmail.com', 'yandex.com', 'zoho.com'];
const URL_SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'ow.ly', 'is.gd', 'buff.ly', 'cutt.ly', 'rb.gy', 'shorte.st'];

// Levenshtein distance for typosquatting / lookalike detection
function levenshtein(a, b) {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, () => Array(an + 1).fill(0));
  for (let i = 0; i <= an; ++i) matrix[0][i] = i;
  for (let j = 0; j <= bn; ++j) matrix[j][0] = j;

  for (let j = 1; j <= bn; ++j) {
    for (let i = 1; i <= an; ++i) {
      if (b.charAt(j - 1) === a.charAt(i - 1)) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

// Extract email address and display name from "Display Name <user@domain.com>" or "user@domain.com"
function parseSender(senderString) {
  if (!senderString || typeof senderString !== 'string') {
    return { raw: '', displayName: '', email: '', domain: '' };
  }
  const match = senderString.match(/(.*?)<([^>]+)>/);
  if (match) {
    const displayName = match[1].trim().replace(/^["']|["']$/g, '');
    const email = match[2].trim().toLowerCase();
    const domain = email.includes('@') ? email.split('@')[1] : '';
    return { raw: senderString, displayName, email, domain };
  }
  const email = senderString.trim().toLowerCase();
  const domain = email.includes('@') ? email.split('@')[1] : '';
  return { raw: senderString, displayName: '', email, domain };
}

// Extract all URLs from text
function extractUrls(text) {
  if (!text || typeof text !== 'string') return [];
  const urlRegex = /(https?:\/\/[^\s<>""']+)|(www\.[^\s<>""']+)/gi;
  const matches = text.match(urlRegex) || [];
  return Array.from(new Set(matches.map(u => {
    let clean = u.replace(/[.,;!?()]$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'http://' + clean;
    }
    return clean;
  })));
}

// Parse URL breakdown safely
function parseUrlDetails(urlString) {
  try {
    const parsed = new URL(urlString);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;
    const protocol = parsed.protocol;
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    const port = parsed.port;
    const search = parsed.search;

    const tldMatch = hostname.match(/\.[a-z0-9]+$/i);
    const tld = tldMatch ? tldMatch[0].toLowerCase() : '';
    const isSuspiciousTld = SUSPICIOUS_TLDS.includes(tld);
    const isShortener = URL_SHORTENERS.includes(hostname);

    return {
      raw: urlString,
      protocol,
      hostname,
      pathname,
      search,
      port,
      isIp,
      tld,
      isSuspiciousTld,
      isShortener,
      isValid: true
    };
  } catch (err) {
    return {
      raw: urlString,
      hostname: urlString,
      isIp: false,
      isValid: false
    };
  }
}

/**
 * Main Detection Function
 * @param {Object} input - { sender, subject, body, urls, headers, organizationDomain }
 */
export function analyzePhishing(input) {
  const senderStr = input.sender || '';
  const subject = input.subject || '';
  const body = input.body || '';
  const providedUrls = Array.isArray(input.urls) ? input.urls : [];
  const orgDomain = (input.organizationDomain || 'acme-corp.com').toLowerCase();

  const sender = parseSender(senderStr);
  const combinedText = `${subject}\n${body}`;
  const extractedUrls = extractUrls(combinedText);
  const allUrls = Array.from(new Set([...providedUrls, ...extractedUrls]));

  const indicators = [];
  let scoreSum = 0;

  // ==========================================
  // 1. SENDER & DOMAIN SPOOFING ANALYSIS
  // ==========================================

  // A. Free Email Service Impersonating Corporate / Brand
  if (sender.domain && FREE_EMAIL_PROVIDERS.includes(sender.domain)) {
    const claimsCorporate = KNOWN_BRANDS.some(b => {
      const matchInDisplay = sender.displayName.toLowerCase().includes(b.name.toLowerCase()) ||
        b.keywords.some(kw => sender.displayName.toLowerCase().includes(kw));
      const matchInSubject = subject.toLowerCase().includes(b.name.toLowerCase()) ||
        b.keywords.some(kw => subject.toLowerCase().includes(kw));
      return matchInDisplay || matchInSubject;
    });

    if (claimsCorporate || sender.displayName.toLowerCase().includes('support') || sender.displayName.toLowerCase().includes('hr') || sender.displayName.toLowerCase().includes('security') || sender.displayName.toLowerCase().includes('admin') || sender.displayName.toLowerCase().includes('payroll')) {
      indicators.push({
        id: 'FREE_PROVIDER_IMPERSONATION',
        title: 'Free Email Provider Used for Corporate/Brand Message',
        severity: 'HIGH',
        category: 'SENDER_ANOMALY',
        scoreImpact: 30,
        technicalDetail: `Sender uses free consumer provider (${sender.domain}) while display name or subject asserts official corporate authority ("${sender.displayName || subject}").`,
        humanExplanation: 'Legitimate organizations and corporate departments always email from their verified corporate domains, never from free public services like Gmail or Yahoo.',
        detectedSnippet: `Sender: ${senderStr}`,
        recommendedVerification: 'Check the real email address behind the display name. Legitimate corporate notices never originate from free email accounts.'
      });
      scoreSum += 30;
    }
  }

  // B. Display Name vs Actual Address Mismatch
  if (sender.displayName) {
    const brandMatch = KNOWN_BRANDS.find(b => sender.displayName.toLowerCase().includes(b.name.toLowerCase()));
    if (brandMatch && sender.domain) {
      const isOfficialDomain = brandMatch.domains.some(d => sender.domain === d || sender.domain.endsWith('.' + d));
      if (!isOfficialDomain) {
        indicators.push({
          id: 'BRAND_DISPLAY_MISMATCH',
          title: `Brand Impersonation (${brandMatch.name})`,
          severity: 'CRITICAL',
          category: 'IMPERSONATION',
          scoreImpact: 35,
          technicalDetail: `Display name claims to represent "${brandMatch.name}", but the RFC 5322 sender domain is "${sender.domain}", which is not an authorized domain.`,
          humanExplanation: `The sender is posing as ${brandMatch.name} to trick you into trusting the message, but the actual sending server belongs to "${sender.domain}".`,
          detectedSnippet: `"${sender.displayName}" <${sender.email}>`,
          recommendedVerification: `Do not trust the display name. Verify through official ${brandMatch.name} channels or apps.`
        });
        scoreSum += 35;
      }
    }
  }

  // C. Lookalike Domain / Typosquatting
  if (sender.domain) {
    KNOWN_BRANDS.forEach(brand => {
      brand.domains.forEach(legitDomain => {
        const legitBase = legitDomain.split('.')[0];
        const senderBase = sender.domain.split('.')[0];
        const dist = levenshtein(legitBase, senderBase);

        if (dist > 0 && dist <= 2 && senderBase.length >= 4) {
          indicators.push({
            id: 'TYPOSQUATTING_DOMAIN',
            title: `Lookalike Typosquatting Domain Detected (${sender.domain})`,
            severity: 'CRITICAL',
            category: 'SENDER_ANOMALY',
            scoreImpact: 40,
            technicalDetail: `Sender domain "${sender.domain}" is visually deceptive and only ${dist} character(s) different from legitimate domain "${legitDomain}".`,
            humanExplanation: `Attackers registered a lookalike domain (${sender.domain}) designed to fool human readers at a glance (e.g., swapping letters with numbers or adding subtle hyphens).`,
            detectedSnippet: `Sender Domain: ${sender.domain} vs Target: ${legitDomain}`,
            recommendedVerification: 'Double-check character spelling in the address bar and domain name.'
          });
          scoreSum += 40;
        }
      });
    });
  }

  // ==========================================
  // 2. SUSPICIOUS URL & LINK ANALYSIS
  // ==========================================
  const analyzedUrls = allUrls.map(u => parseUrlDetails(u));

  analyzedUrls.forEach(urlObj => {
    if (!urlObj.isValid) return;

    // IP as Hostname
    if (urlObj.isIp) {
      indicators.push({
        id: 'IP_ADDRESS_URL',
        title: 'Raw IP Address in Hyperlink',
        severity: 'CRITICAL',
        category: 'SUSPICIOUS_URL',
        scoreImpact: 35,
        technicalDetail: `Destination URL uses raw numerical IP address "${urlObj.hostname}" instead of a registered domain name.`,
        humanExplanation: 'Legitimate corporate services always use registered domain names with valid SSL certificates. Direct IP links are a hallmark of phishing hosts and malware servers.',
        detectedSnippet: urlObj.raw,
        recommendedVerification: 'Never open links containing raw IP addresses.'
      });
      scoreSum += 35;
    }

    // Suspicious / Disposable TLD
    if (urlObj.isSuspiciousTld) {
      indicators.push({
        id: 'SUSPICIOUS_TLD_URL',
        title: `High-Risk Top-Level Domain (${urlObj.tld})`,
        severity: 'HIGH',
        category: 'SUSPICIOUS_URL',
        scoreImpact: 25,
        technicalDetail: `URL uses "${urlObj.tld}", a top-level domain frequently associated with low-cost, disposable phishing infrastructure.`,
        humanExplanation: `The destination website is hosted on a cheap high-risk domain extension (${urlObj.tld}) uncharacteristic of trustworthy organizations.`,
        detectedSnippet: urlObj.raw,
        recommendedVerification: 'Inspect the root domain before clicking any link.'
      });
      scoreSum += 25;
    }

    // URL Shortener Obfuscation
    if (urlObj.isShortener) {
      indicators.push({
        id: 'URL_SHORTENER_OBFUSCATION',
        title: 'Obfuscated Destination via URL Shortener',
        severity: 'MEDIUM',
        category: 'SUSPICIOUS_URL',
        scoreImpact: 15,
        technicalDetail: `URL is hidden behind shortening service "${urlObj.hostname}".`,
        humanExplanation: 'Attackers use link shorteners in emails to hide the true destination and bypass basic security scanners.',
        detectedSnippet: urlObj.raw,
        recommendedVerification: 'Use a link expander tool or check the destination before navigating.'
      });
      scoreSum += 15;
    }

    // Lookalike brand in URL path or subdomain
    KNOWN_BRANDS.forEach(brand => {
      brand.keywords.forEach(kw => {
        if (urlObj.hostname.includes(kw) && !brand.domains.some(d => urlObj.hostname === d || urlObj.hostname.endsWith('.' + d))) {
          indicators.push({
            id: 'BRAND_IN_UNOFFICIAL_HOST',
            title: `Subdomain / Brand Spoofing in Link (${kw})`,
            severity: 'CRITICAL',
            category: 'SUSPICIOUS_URL',
            scoreImpact: 35,
            technicalDetail: `Hostname "${urlObj.hostname}" contains the brand keyword "${kw}" but does not belong to the authorized domain owner.`,
            humanExplanation: `The link includes the brand name "${kw}" to look legitimate, but the actual domain hosting the page is "${urlObj.hostname}".`,
            detectedSnippet: urlObj.raw,
            recommendedVerification: 'Look at the last two parts of the domain name before the slash to identify the real owner.'
          });
          scoreSum += 35;
        }
      });
    });

    // Credential harvest paths in URL
    const sensitivePaths = ['/login', '/signin', '/verify', '/auth', '/update-password', '/session', '/secure', '/account/recover'];
    const hasSensitivePath = sensitivePaths.some(p => urlObj.pathname.toLowerCase().includes(p));
    if (hasSensitivePath && (urlObj.isSuspiciousTld || urlObj.isIp || indicators.some(i => i.category === 'SENDER_ANOMALY' || i.category === 'IMPERSONATION'))) {
      indicators.push({
        id: 'SUSPICIOUS_LOGIN_DESTINATION',
        title: 'Deceptive Credential Prompt / Login Destination',
        severity: 'CRITICAL',
        category: 'CREDENTIAL_HARVEST',
        scoreImpact: 30,
        technicalDetail: `URL path (${urlObj.pathname}) points to a login or authentication gateway hosted on an unverified domain.`,
        humanExplanation: 'This link leads directly to a fake authentication form designed to harvest your username and password.',
        detectedSnippet: urlObj.raw,
        recommendedVerification: 'Never enter your credentials on links provided directly in unexpected emails.'
      });
      scoreSum += 30;
    }
  });

  // ==========================================
  // 3. URGENCY & PSYCHOLOGICAL PRESSURE
  // ==========================================
  const urgencyPatterns = [
    { pattern: /\b(immediate(ly)?|urgent(ly)?|action required|within 24 hours|within 12 hours|24-hour notice|final notice|account suspended|access revoked|suspended immediately|terminate your account)\b/i, weight: 20, desc: 'Extreme deadline or punitive threat', excerpt: 'Immediate action / Account suspension threat' },
    { pattern: /\b(security alert|unauthorized access|compromised|unusual activity detected|critical payroll|salary hold|direct deposit failure)\b/i, weight: 15, desc: 'High-anxiety topic trigger', excerpt: 'Security panic / Payroll disruption trigger' },
    { pattern: /\b(strictly confidential|do not discuss|do not contact it|wire transfer immediately|gift cards?|it is critical that you do not)\b/i, weight: 25, desc: 'Executive isolation or secrecy pressure', excerpt: 'Secrecy & bypass official protocol' }
  ];

  urgencyPatterns.forEach(rule => {
    const match = combinedText.match(rule.pattern);
    if (match) {
      indicators.push({
        id: 'PSYCHOLOGICAL_URGENCY',
        title: 'Artificial Urgency & Fear Pressure Tactics',
        severity: rule.weight >= 20 ? 'HIGH' : 'MEDIUM',
        category: 'URGENCY_PRESSURE',
        scoreImpact: rule.weight,
        technicalDetail: `Message contains psychological pressure language: "${match[0]}".`,
        humanExplanation: 'Attackers create artificial panic with tight deadlines and harsh consequences (like account suspension) so victims act impulsively without verifying.',
        detectedSnippet: `Trigger text: "${match[0]}"`,
        recommendedVerification: 'Step back and breathe. Legitimate security issues can always be verified through your internal IT helpdesk or official portals.'
      });
      scoreSum += rule.weight;
    }
  });

  // ==========================================
  // 4. CREDENTIAL & SENSITIVE DATA HARVESTING
  // ==========================================
  const credentialPatterns = [
    { pattern: /\b(verify your (password|credentials|identity|account|login)|enter your (password|pin|ssn|social security)|confirm your direct deposit|update your banking details|mfa token|2fa code)\b/i, weight: 30, desc: 'Direct credential or financial verification request' },
    { pattern: /\b(click (the )?link below to (login|verify|unlock|keep your access|restore)|sign in with your work email)\b/i, weight: 20, desc: 'Call to action leading to external login' }
  ];

  credentialPatterns.forEach(rule => {
    const match = combinedText.match(rule.pattern);
    if (match) {
      indicators.push({
        id: 'CREDENTIAL_HARVEST_CALL_TO_ACTION',
        title: 'Explicit Request for Credentials or Financial Data',
        severity: 'CRITICAL',
        category: 'CREDENTIAL_HARVEST',
        scoreImpact: rule.weight,
        technicalDetail: `Message instructs user to disclose sensitive data: "${match[0]}".`,
        humanExplanation: 'The email asks you to verify passwords, financial accounts, or authentication tokens through an external link.',
        detectedSnippet: `Matched text: "${match[0]}"`,
        recommendedVerification: 'Official IT teams and vendors will never ask you to email passwords or click an email link to verify your password.'
      });
      scoreSum += rule.weight;
    }
  });

  // ==========================================
  // 5. ATTACHMENT RISK HEURISTICS
  // ==========================================
  if (input.attachments && Array.isArray(input.attachments)) {
    input.attachments.forEach(att => {
      const ext = (att.name || '').split('.').pop().toLowerCase();
      if (['html', 'htm', 'exe', 'scr', 'vbs', 'js', 'iso', 'zip', 'rar', 'xlsm', 'docm'].includes(ext)) {
        indicators.push({
          id: 'DANGEROUS_ATTACHMENT_EXTENSION',
          title: `High-Risk Attachment File Type (.${ext})`,
          severity: 'HIGH',
          category: 'ATTACHMENT_RISK',
          scoreImpact: 25,
          technicalDetail: `Attachment "${att.name}" has an executable or active content file extension (.${ext}).`,
          humanExplanation: 'Files with this extension can execute scripts or launch credential-stealing phishing pages directly in your browser.',
          detectedSnippet: `Attachment: ${att.name}`,
          recommendedVerification: 'Do not download or open this attachment. Submit it to your security team for sandbox inspection.'
        });
        scoreSum += 25;
      }
    });
  }

  // ==========================================
  // 6. SCORING NORMALIZATION & RISK TIER
  // ==========================================
  // Deduplicate indicators by title / ID
  const uniqueIndicators = [];
  const seenIds = new Set();
  indicators.forEach(ind => {
    if (!seenIds.has(ind.id + ind.detectedSnippet)) {
      seenIds.add(ind.id + ind.detectedSnippet);
      uniqueIndicators.push(ind);
    }
  });

  // Calculate final bounded score (0 - 100)
  let rawScore = uniqueIndicators.reduce((acc, curr) => acc + (curr.scoreImpact || 0), 0);
  let finalScore = Math.min(100, Math.max(0, rawScore));

  // Determine Risk Tier
  let riskLevel = 'LOW';
  let threatSummary = 'No significant phishing indicators detected. The message appears standard.';

  if (finalScore >= 80) {
    riskLevel = 'CRITICAL';
    threatSummary = 'High-probability targeted social engineering or credential harvesting attack.';
  } else if (finalScore >= 50) {
    riskLevel = 'HIGH';
    threatSummary = 'Suspicious message with multiple high-risk indicators. Do not click links or submit credentials.';
  } else if (finalScore >= 25) {
    riskLevel = 'MEDIUM';
    threatSummary = 'Unusual message characteristics detected. Exercise caution and verify independently.';
  }

  // Generate Clear, Actionable Guidance
  const safeActions = [];
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    safeActions.push('DO NOT click any links, open attachments, or reply to this sender.');
    safeActions.push('Quarantine this email or report it to your Security Operations Center (SOC).');
    safeActions.push('If you already entered credentials, immediately reset your enterprise password from a known clean device.');
    safeActions.push('Verify the request by contacting the purported sender through an independent, verified corporate directory or phone call.');
  } else if (riskLevel === 'MEDIUM') {
    safeActions.push('Verify the sender address carefully before replying.');
    safeActions.push('Navigate to the official portal manually in your browser instead of clicking the link in the message.');
    safeActions.push('Inspect any destination URLs in a safe preview sandbox.');
  } else {
    safeActions.push('Standard message signals. Continue to practice regular cyber hygiene.');
    safeActions.push('Always confirm unexpected requests involving funds or credentials.');
  }

  // Derive classification
  let classification = 'Clean Communication';
  if (uniqueIndicators.some(i => i.category === 'CREDENTIAL_HARVEST')) {
    classification = 'Credential Harvesting';
  } else if (uniqueIndicators.some(i => i.id === 'BRAND_DISPLAY_MISMATCH' || i.id === 'FREE_PROVIDER_IMPERSONATION')) {
    classification = 'Executive / Department Impersonation (BEC)';
  } else if (uniqueIndicators.some(i => i.id === 'TYPOSQUATTING_DOMAIN')) {
    classification = 'Lookalike Domain Typosquatting';
  } else if (uniqueIndicators.some(i => i.category === 'SUSPICIOUS_URL')) {
    classification = 'Malicious URL / Suspicious Destination';
  } else if (uniqueIndicators.some(i => i.category === 'URGENCY_PRESSURE')) {
    classification = 'Social Engineering & Urgency Scam';
  }

  // Calculate dynamic confidence score (e.g. 92% to 98% based on indicator richness)
  let confidence = 94.2;
  if (finalScore >= 80) {
    confidence = Math.min(99.1, 95.0 + uniqueIndicators.length * 1.2);
  } else if (finalScore <= 15) {
    confidence = 96.8;
  } else {
    confidence = Math.min(96.0, 91.0 + uniqueIndicators.length * 1.5);
  }
  confidence = parseFloat(confidence.toFixed(1));

  return {
    score: finalScore,
    riskLevel,
    classification,
    confidence,
    threatSummary,
    analyzedAt: new Date().toISOString(),
    senderInfo: sender,
    urlsAnalyzed: analyzedUrls,
    indicators: uniqueIndicators,
    indicatorCount: uniqueIndicators.length,
    safeActions,
    breakdown: {
      senderAnomaly: uniqueIndicators.filter(i => i.category === 'SENDER_ANOMALY').length,
      impersonation: uniqueIndicators.filter(i => i.category === 'IMPERSONATION').length,
      suspiciousUrls: uniqueIndicators.filter(i => i.category === 'SUSPICIOUS_URL').length,
      urgencyPressure: uniqueIndicators.filter(i => i.category === 'URGENCY_PRESSURE').length,
      credentialHarvest: uniqueIndicators.filter(i => i.category === 'CREDENTIAL_HARVEST').length,
      attachmentRisk: uniqueIndicators.filter(i => i.category === 'ATTACHMENT_RISK').length
    }
  };
}

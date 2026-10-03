/**
 * PhishGuard AI - Explainable Threat Detection & Risk Engine
 * Multi-vector weighted scoring system producing calibrated, realistic risk scores (0–100).
 * 
 * Classification Tiers:
 *  0–29  = SAFE (Low Risk)
 *  30–69 = SUSPICIOUS (Medium Risk)
 *  70–100 = PHISHING (High / Critical Risk)
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
  { name: 'Internal HR / Payroll', domains: ['company.com', 'workday.com', 'adp.com', 'gusto.com'], keywords: ['workday', 'payroll', 'human resources', 'hr department', 'salary update', 'direct deposit', 'w-2', 'w2 form', 'tax form'] },
  { name: 'IT Support / Helpdesk', domains: ['company.com', 'service-now.com', 'jira.com'], keywords: ['it helpdesk', 'it support', 'system administrator', 'security admin', 'password expiry', 'mfa reset'] }
];

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.buzz', '.rest', '.gq', '.cf', '.ml', '.tk', '.work', '.download', '.racing', '.loan', '.icu', '.monster', '.cc', '.space', '.online'];
const FREE_EMAIL_PROVIDERS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'mail.com', 'protonmail.com', 'yandex.com', 'zoho.com'];
const URL_SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'ow.ly', 'is.gd', 'buff.ly', 'cutt.ly', 'rb.gy', 'shorte.st'];
const FREE_HOSTING_DOMAINS = ['firebaseapp.com', 'weebly.com', '000webhostapp.com', 'glitch.me', 'pages.dev', 'vercel.app', 'netlify.app', 'wixsite.com', 'github.io'];

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

// Extract email address and display name
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
    const isSuspiciousTld = SUSPICIOUS_TLDS.some(t => hostname.endsWith(t));
    const isShortener = URL_SHORTENERS.includes(hostname);
    const isFreeHosting = FREE_HOSTING_DOMAINS.some(h => hostname.endsWith(h));
    const isHttp = protocol === 'http:';
    const isLongUrl = urlString.length > 90;
    const hasRedirectParam = /[?&](redirect|url|next|goto|target|dest)=https?:\/\//i.test(search);

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
      isFreeHosting,
      isHttp,
      isLongUrl,
      hasRedirectParam,
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
 * Main Detection Function with Calibrated Weighted Scoring
 * @param {Object} input - { sender, subject, body, urls, headers, organizationDomain }
 */
export function analyzePhishing(input) {
  const senderStr = input.sender || '';
  const subject = input.subject || '';
  const body = input.body || '';
  const providedUrls = Array.isArray(input.urls) ? input.urls : [];
  const orgDomain = (input.organizationDomain || 'acme-corp.com').toLowerCase();

  const sender = parseSender(senderStr);
  const combinedText = `${subject}\n${body}`.trim();
  const extractedUrls = extractUrls(combinedText);
  const allUrls = Array.from(new Set([...providedUrls, ...extractedUrls]));

  const indicators = [];

  // ==========================================
  // 1. SENDER & BRAND IMPERSONATION ANALYSIS
  // ==========================================

  // A. Free Email Service Impersonating Corporate / Brand (+20)
  if (sender.domain && FREE_EMAIL_PROVIDERS.includes(sender.domain)) {
    const claimsCorporate = KNOWN_BRANDS.some(b => {
      const matchInDisplay = sender.displayName.toLowerCase().includes(b.name.toLowerCase()) ||
        b.keywords.some(kw => sender.displayName.toLowerCase().includes(kw));
      const matchInSubject = subject.toLowerCase().includes(b.name.toLowerCase()) ||
        b.keywords.some(kw => subject.toLowerCase().includes(kw));
      return matchInDisplay || matchInSubject;
    });

    const isAuthority = sender.displayName.toLowerCase().includes('support') || 
      sender.displayName.toLowerCase().includes('hr') || 
      sender.displayName.toLowerCase().includes('security') || 
      sender.displayName.toLowerCase().includes('admin') || 
      sender.displayName.toLowerCase().includes('payroll');

    if (claimsCorporate || isAuthority) {
      indicators.push({
        id: 'FREE_PROVIDER_IMPERSONATION',
        title: 'Free Email Provider Used for Corporate/Brand Message',
        severity: 'HIGH',
        category: 'SENDER_ANOMALY',
        scoreImpact: 20,
        technicalDetail: `Sender uses consumer provider (${sender.domain}) while display name or subject asserts official corporate authority ("${sender.displayName || subject}").`,
        humanExplanation: 'Legitimate organizations email from verified corporate domains, not from free public email providers like Gmail or Yahoo.',
        detectedSnippet: `Sender: ${senderStr}`,
        recommendedVerification: 'Check the actual sender address. Legitimate corporate departments do not use public webmail.'
      });
    }
  }

  // B. Display Name vs Actual Address Mismatch / Brand Impersonation (+20)
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
          scoreImpact: 20,
          technicalDetail: `Display name claims to represent "${brandMatch.name}", but the RFC 5322 sender domain is "${sender.domain}", which is not an authorized domain.`,
          humanExplanation: `The sender claims to be ${brandMatch.name}, but the email originated from an unauthorized domain ("${sender.domain}").`,
          detectedSnippet: `"${sender.displayName}" <${sender.email}>`,
          recommendedVerification: `Do not trust the display name. Verify through official ${brandMatch.name} channels.`
        });
      }
    }
  }

  // C. Lookalike Domain / Typosquatting in Sender Domain (+25)
  if (sender.domain) {
    KNOWN_BRANDS.forEach(brand => {
      brand.domains.forEach(legitDomain => {
        const legitBase = legitDomain.split('.')[0];
        const senderBase = sender.domain.split('.')[0];
        const dist = levenshtein(legitBase, senderBase);

        if (dist > 0 && dist <= 2 && senderBase.length >= 4) {
          indicators.push({
            id: 'TYPOSQUATTING_DOMAIN',
            title: `Lookalike Typosquatting Domain (${sender.domain})`,
            severity: 'CRITICAL',
            category: 'SENDER_ANOMALY',
            scoreImpact: 25,
            technicalDetail: `Sender domain "${sender.domain}" is visually deceptive and only ${dist} character(s) different from legitimate domain "${legitDomain}".`,
            humanExplanation: `Attackers registered a lookalike domain (${sender.domain}) designed to mislead readers at a glance.`,
            detectedSnippet: `Sender Domain: ${sender.domain} vs Target: ${legitDomain}`,
            recommendedVerification: 'Inspect domain spelling carefully in the sender address.'
          });
        }
      });
    });
  }

  // ==========================================
  // 2. URL & HYPERLINK ANALYSIS
  // ==========================================
  const analyzedUrls = allUrls.map(u => parseUrlDetails(u));

  analyzedUrls.forEach(urlObj => {
    if (!urlObj.isValid) return;

    // A. Raw IP Address in URL (+20)
    if (urlObj.isIp) {
      indicators.push({
        id: 'IP_ADDRESS_URL',
        title: 'Raw IP Address in Hyperlink',
        severity: 'CRITICAL',
        category: 'SUSPICIOUS_URL',
        scoreImpact: 20,
        technicalDetail: `Destination URL uses raw numerical IP address "${urlObj.hostname}" instead of a registered domain name.`,
        humanExplanation: 'Legitimate enterprise services use registered domain names with SSL certificates. Raw IP links are common in malware and phishing.',
        detectedSnippet: urlObj.raw,
        recommendedVerification: 'Never open links containing raw IP addresses.'
      });
    }

    // B. Suspicious / Disposable High-Risk TLD (+10)
    if (urlObj.isSuspiciousTld) {
      indicators.push({
        id: 'SUSPICIOUS_TLD_URL',
        title: `High-Risk Top-Level Domain (${urlObj.tld || 'Suspicious TLD'})`,
        severity: 'HIGH',
        category: 'SUSPICIOUS_URL',
        scoreImpact: 10,
        technicalDetail: `URL uses "${urlObj.tld}", a top-level domain frequently associated with low-cost, disposable phishing infrastructure.`,
        humanExplanation: `The destination website is hosted on a high-risk domain extension (${urlObj.tld}) uncharacteristic of trustworthy organizations.`,
        detectedSnippet: urlObj.raw,
        recommendedVerification: 'Inspect the root domain before clicking any link.'
      });
    }

    // C. URL Shortener (+10)
    if (urlObj.isShortener) {
      indicators.push({
        id: 'URL_SHORTENER_OBFUSCATION',
        title: 'Obfuscated Destination via URL Shortener',
        severity: 'MEDIUM',
        category: 'SUSPICIOUS_URL',
        scoreImpact: 15,
        technicalDetail: `URL is hidden behind shortening service "${urlObj.hostname}".`,
        humanExplanation: 'Attackers use link shorteners to disguise the true destination of an untrusted site.',
        detectedSnippet: urlObj.raw,
        recommendedVerification: 'Use a link expander tool or check the destination before navigating.'
      });
    }

    // D. Free Hosting Provider (+10)
    if (urlObj.isFreeHosting) {
      indicators.push({
        id: 'FREE_HOSTING_URL',
        title: 'Hosted on Free Cloud Webpage / Hosting Provider',
        severity: 'MEDIUM',
        category: 'SUSPICIOUS_URL',
        scoreImpact: 10,
        technicalDetail: `Link points to free cloud hosting platform (${urlObj.hostname}) often abused for credential landing pages.`,
        humanExplanation: 'Phishing pages are frequently hosted on free app hosting domains to bypass domain reputation checks.',
        detectedSnippet: urlObj.raw,
        recommendedVerification: 'Check if official enterprise portals use free web host subdomains.'
      });
    }

    // E. Lookalike brand or typosquatting in URL Hostname (+25)
    let foundBrandTyposquat = false;
    KNOWN_BRANDS.forEach(brand => {
      // 1. Keyword containment in unofficial domain
      brand.keywords.forEach(kw => {
        if (urlObj.hostname.includes(kw) && !brand.domains.some(d => urlObj.hostname === d || urlObj.hostname.endsWith('.' + d))) {
          indicators.push({
            id: 'BRAND_IN_UNOFFICIAL_HOST',
            title: `Lookalike / Brand Spoofing in Link (${kw})`,
            severity: 'CRITICAL',
            category: 'SUSPICIOUS_URL',
            scoreImpact: 25,
            technicalDetail: `Hostname "${urlObj.hostname}" contains the brand keyword "${kw}" but does not belong to the authorized domain owner.`,
            humanExplanation: `The link includes the brand name "${kw}" to look legitimate, but the actual domain hosting the page is "${urlObj.hostname}".`,
            detectedSnippet: urlObj.raw,
            recommendedVerification: 'Look at the root domain before the single slash to identify the real host.'
          });
          foundBrandTyposquat = true;
        }
      });

      // 2. Levenshtein edit distance check against brand names (e.g. micros0ft)
      if (!foundBrandTyposquat) {
        brand.domains.forEach(legitDomain => {
          const legitBase = legitDomain.split('.')[0];
          const hostParts = urlObj.hostname.split('.');
          hostParts.forEach(part => {
            const subparts = part.split('-');
            subparts.forEach(sub => {
              const dist = levenshtein(legitBase, sub);
              if (dist > 0 && dist <= 2 && sub.length >= 4) {
                indicators.push({
                  id: 'TYPOSQUATTING_IN_URL',
                  title: `Lookalike Typosquatting in Link (${sub} vs ${legitBase})`,
                  severity: 'CRITICAL',
                  category: 'SUSPICIOUS_URL',
                  scoreImpact: 25,
                  technicalDetail: `URL hostname part "${sub}" is a deceptive lookalike of "${legitBase}" (Levenshtein distance = ${dist}).`,
                  humanExplanation: `The link domain is visually designed to mimic ${brand.name} with subtle spelling mutations.`,
                  detectedSnippet: urlObj.raw,
                  recommendedVerification: 'Inspect domain spelling closely before opening links.'
                });
                foundBrandTyposquat = true;
              }
            });
          });
        });
      }
    });

    // F. Brand impersonation in message body combined with unofficial link domain (+20)
    const mentionedBrand = KNOWN_BRANDS.find(b => combinedText.toLowerCase().includes(b.name.toLowerCase()));
    if (mentionedBrand && !foundBrandTyposquat) {
      const isAuthorizedHost = mentionedBrand.domains.some(d => urlObj.hostname === d || urlObj.hostname.endsWith('.' + d));
      if (!isAuthorizedHost && (urlObj.isSuspiciousTld || urlObj.isHttp || urlObj.isIp || urlObj.isShortener || urlObj.isFreeHosting || urlObj.hostname.includes('security') || urlObj.hostname.includes('account') || urlObj.hostname.includes('update') || urlObj.hostname.includes('verify'))) {
        indicators.push({
          id: 'BODY_BRAND_LINK_MISMATCH',
          title: `Brand Impersonation in Link (${mentionedBrand.name})`,
          severity: 'HIGH',
          category: 'IMPERSONATION',
          scoreImpact: 20,
          technicalDetail: `Message references "${mentionedBrand.name}", but the call-to-action link leads to unofficial domain "${urlObj.hostname}".`,
          humanExplanation: `The message mentions ${mentionedBrand.name}, but directs you to an unrelated external domain (${urlObj.hostname}).`,
          detectedSnippet: urlObj.raw,
          recommendedVerification: `Always navigate directly to official ${mentionedBrand.name} domains.`
        });
      }
    }

    // G. HTTP instead of HTTPS on destination link (+5)
    if (urlObj.isHttp) {
      indicators.push({
        id: 'UNENCRYPTED_HTTP_LINK',
        title: 'Unencrypted Plain HTTP Destination',
        severity: 'MEDIUM',
        category: 'SUSPICIOUS_URL',
        scoreImpact: 5,
        technicalDetail: `Destination link uses unencrypted plain HTTP protocol (${urlObj.protocol}) instead of HTTPS.`,
        humanExplanation: 'Modern legitimate portals use HTTPS encryption. Plain HTTP links present security risks.',
        detectedSnippet: urlObj.raw,
        recommendedVerification: 'Ensure websites requesting actions or credentials use HTTPS.'
      });
    }

    // H. Open Redirect / Suspicious Target Query Parameter (+10)
    if (urlObj.hasRedirectParam) {
      indicators.push({
        id: 'SUSPICIOUS_REDIRECT_PARAM',
        title: 'Suspicious Redirect Query Parameter in URL',
        severity: 'HIGH',
        category: 'SUSPICIOUS_URL',
        scoreImpact: 10,
        technicalDetail: `URL contains an open redirect parameter (${urlObj.search}) pointing to an external destination.`,
        humanExplanation: 'Redirect parameters can bounce victims from a known link to a malicious destination.',
        detectedSnippet: urlObj.raw,
        recommendedVerification: 'Inspect destination parameters before opening redirect links.'
      });
    }

    // I. Excessively Long URL (+5)
    if (urlObj.isLongUrl) {
      indicators.push({
        id: 'EXCESSIVELY_LONG_URL',
        title: 'Obfuscated / Excessively Long URL Structure',
        severity: 'LOW',
        category: 'SUSPICIOUS_URL',
        scoreImpact: 5,
        technicalDetail: `URL exceeds 90 characters (${urlObj.raw.length} chars) with complex token parameters.`,
        humanExplanation: 'Long URLs are often crafted to push the real domain out of view on mobile screens.',
        detectedSnippet: urlObj.raw.slice(0, 70) + '...',
        recommendedVerification: 'Inspect the full URL to verify the destination.'
      });
    }

    // J. Generic Unknown External Link / Shared Document Notice (+15)
    if (indicators.length === 0 && !urlObj.hostname.includes('google.com') && !urlObj.hostname.includes('microsoft.com') && !urlObj.hostname.endsWith(orgDomain)) {
      indicators.push({
        id: 'EXTERNAL_UNKNOWN_LINK',
        title: 'External Unverified Hyperlink',
        severity: 'LOW',
        category: 'SUSPICIOUS_URL',
        scoreImpact: 15,
        technicalDetail: `Message contains an external hyperlink to "${urlObj.hostname}".`,
        humanExplanation: 'External links from unfamiliar domains should be verified before opening.',
        detectedSnippet: urlObj.raw,
        recommendedVerification: 'Verify the link destination in a safe preview.'
      });
    }
  });

  // ==========================================
  // 3. URGENCY, DEADLINES & THREATS
  // ==========================================
  
  // A. Account Suspension / Punitive Threat (+15)
  const suspensionMatch = combinedText.match(/\b(account (will be |is |has been )?(suspended|disabled|locked|terminated|revoked|closed)|suspended (today|immediately|within)|access (will be )?revoked|permanent account suspension|terminate your (account|access)|salary (is )?(on hold|withheld)|direct deposit failure|funds? (are )?(frozen|on hold)|parcel (is )?on hold|shipment (is )?on hold)\b/i);
  if (suspensionMatch) {
    indicators.push({
      id: 'ACCOUNT_SUSPENSION_THREAT',
      title: 'Account Suspension, Hold, or Punitive Threat',
      severity: 'HIGH',
      category: 'URGENCY_PRESSURE',
      scoreImpact: 15,
      technicalDetail: `Message threatens account termination or service disruption: "${suspensionMatch[0]}".`,
      humanExplanation: 'Threatening negative consequences is designed to push victims into impulsive reactions without verification.',
      detectedSnippet: `Trigger text: "${suspensionMatch[0]}"`,
      recommendedVerification: 'Check account status directly by logging into your official portal.'
    });
  }

  // B. Urgency / Pressure / Tight Deadline (+10)
  const urgencyMatch = combinedText.match(/\b(urgent(ly)?|immediate(ly)?|action required|final notice|critical notice|within 24 hours|within 12 hours|within 2 hours|within 48 hours|today only|expires today|expires in|act now|hurry|asap|confidential wire transfer|do not discuss)\b/i);
  if (urgencyMatch) {
    indicators.push({
      id: 'PSYCHOLOGICAL_URGENCY',
      title: 'Artificial Urgency & Time Pressure Tactics',
      severity: 'MEDIUM',
      category: 'URGENCY_PRESSURE',
      scoreImpact: 10,
      technicalDetail: `Message uses urgency keywords: "${urgencyMatch[0]}".`,
      humanExplanation: 'Artificial deadlines create cognitive pressure so users act quickly before checking for warning signs.',
      detectedSnippet: `Trigger text: "${urgencyMatch[0]}"`,
      recommendedVerification: 'Pause and verify through standard corporate channels.'
    });
  }

  // ==========================================
  // 4. CREDENTIAL, PASSWORD & OTP REQUESTS
  // ==========================================
  
  // A. Direct Credential / Password / SSN Request (+25)
  const credPromptMatch = combinedText.match(/\b(verify your (password|credentials|identity|account|ssn|social security( number)?|pin|passcode|direct deposit|banking|payroll|card)|enter your (password|pin|ssn|passcode|social security( number)?|credentials)|reply (to this email )?with your (current )?password|confirm your (banking|direct deposit)|update your (password|delivery details|account details)|keep your (current )?password|reset your password|sign in with your (work|corporate|office) (email|credentials))\b/i);
  if (credPromptMatch) {
    indicators.push({
      id: 'CREDENTIAL_HARVEST_REQUEST',
      title: 'Password, Credential, or Account Verification Request',
      severity: 'CRITICAL',
      category: 'CREDENTIAL_HARVEST',
      scoreImpact: 25,
      technicalDetail: `Message requests sensitive authentication or account data: "${credPromptMatch[0]}".`,
      humanExplanation: 'Asking for passwords, credentials, or account verification is the primary mechanism of credential harvesting.',
      detectedSnippet: `Matched text: "${credPromptMatch[0]}"`,
      recommendedVerification: 'Never enter or reply with passwords from email prompts.'
    });
  }

  // B. OTP / 2FA / Authentication Code Request (+25)
  const otpMatch = combinedText.match(/\b(6-digit otp|otp we texted|enter the (code|otp)|2fa code|mfa code|security code we sent|texted you)\b/i);
  if (otpMatch) {
    indicators.push({
      id: 'OTP_INTERCEPTION_REQUEST',
      title: 'One-Time Passcode (OTP / 2FA) Interception Request',
      severity: 'CRITICAL',
      category: 'CREDENTIAL_HARVEST',
      scoreImpact: 25,
      technicalDetail: `Message prompts for multi-factor authentication token: "${otpMatch[0]}".`,
      humanExplanation: 'Adversaries request OTP codes to bypass Multi-Factor Authentication in real-time.',
      detectedSnippet: `Matched text: "${otpMatch[0]}"`,
      recommendedVerification: 'Never share OTP codes or passcodes over email or chat.'
    });
  }

  // C. Insecure Email Reply Credential Request / Reset Lure (+20)
  const replyWithSecretMatch = combinedText.match(/\b(reply (to this email )?with (your )?(current )?password|password reset is ready|send your (password|otp|pin))\b/i);
  if (replyWithSecretMatch) {
    indicators.push({
      id: 'INSECURE_CREDENTIAL_EMAIL_REPLY',
      title: 'Insecure Out-of-Band Credential Disclosure Request',
      severity: 'CRITICAL',
      category: 'CREDENTIAL_HARVEST',
      scoreImpact: 20,
      technicalDetail: `Message asks user to transmit authentication secrets directly: "${replyWithSecretMatch[0]}".`,
      humanExplanation: 'Legitimate organizations never solicit passwords or security tokens over email replies.',
      detectedSnippet: `Matched text: "${replyWithSecretMatch[0]}"`,
      recommendedVerification: 'Do not respond to emails requesting secrets.'
    });
  }

  // D. Suspicious Call to Action Link (+10)
  const ctaLinkMatch = combinedText.match(/\b(click (the )?(link|button) below to (verify|login|unlock|restore|update|view)|open the attached (document|invoice|form)|check out this shared file|review your (invoice|statement|document|bill|preview)|download (the |your )?(file|attachment|document)|download link|access link)\b/i);
  if (ctaLinkMatch && !credPromptMatch && !otpMatch && allUrls.length > 0) {
    indicators.push({
      id: 'SUSPICIOUS_CTA_LINK',
      title: 'Call-to-Action Directing to External Link',
      severity: 'MEDIUM',
      category: 'SUSPICIOUS_URL',
      scoreImpact: 10,
      technicalDetail: `Message contains prompt directing user to external hyperlink: "${ctaLinkMatch[0]}".`,
      humanExplanation: 'Prompts instructing users to click external links to resolve account or document issues warrant scrutiny.',
      detectedSnippet: `Matched text: "${ctaLinkMatch[0]}"`,
      recommendedVerification: 'Navigate manually to the website instead of clicking email links.'
    });
  }

  // ==========================================
  // 5. ATTACHMENT RISK
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
          scoreImpact: 15,
          technicalDetail: `Attachment "${att.name}" has an executable or active content file extension (.${ext}).`,
          humanExplanation: 'Attachments with active extensions can execute scripts or launch credential phishing forms.',
          detectedSnippet: `Attachment: ${att.name}`,
          recommendedVerification: 'Do not open this attachment without sandbox verification.'
        });
      }
    });
  }

  // ==========================================
  // 6. MULTIPLE INDICATOR CORROBORATION BONUS
  // ==========================================
  // Deduplicate indicators by id + snippet
  const uniqueIndicators = [];
  const seenIds = new Set();
  indicators.forEach(ind => {
    const key = ind.id + (ind.detectedSnippet || '');
    if (!seenIds.has(key)) {
      seenIds.add(key);
      uniqueIndicators.push(ind);
    }
  });

  // Calculate base score sum
  let rawScore = uniqueIndicators.reduce((acc, curr) => acc + (curr.scoreImpact || 0), 0);

  // Bonus for multiple corroborating suspicious indicators (+5)
  if (uniqueIndicators.length >= 3 && rawScore >= 35) {
    rawScore += 5;
  }

  // Bound score strictly between 0 and 100 as integer
  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Determine Classification and Risk Level
  // 0–29: SAFE (LOW)
  // 30–69: SUSPICIOUS (MEDIUM)
  // 70–100: PHISHING (HIGH / CRITICAL)
  let classification = 'SAFE';
  let riskLevel = 'LOW';
  let threatSummary = 'No significant phishing indicators detected. The message appears standard and safe.';

  if (finalScore >= 70) {
    classification = 'PHISHING';
    riskLevel = finalScore >= 85 ? 'CRITICAL' : 'HIGH';
    threatSummary = 'High-confidence phishing threat detected with multiple deceptive indicators and potential credential risk.';
  } else if (finalScore >= 30) {
    classification = 'SUSPICIOUS';
    riskLevel = 'MEDIUM';
    threatSummary = 'Suspicious characteristics detected. Exercise caution and verify the source before interacting.';
  } else {
    classification = 'SAFE';
    riskLevel = 'LOW';
    threatSummary = 'Standard communication profile. No malicious deception patterns identified.';
  }

  // Actionable guidance
  const safeActions = [];
  if (classification === 'PHISHING') {
    safeActions.push('DO NOT click any links, open attachments, or reply to this sender.');
    safeActions.push('Quarantine this message or report it to your Security Operations Center (SOC).');
    safeActions.push('If you already entered credentials, immediately reset your password from a clean browser.');
    safeActions.push('Verify any claims directly through official, verified corporate portals or direct phone contact.');
  } else if (classification === 'SUSPICIOUS') {
    safeActions.push('Exercise caution before clicking links or downloading files.');
    safeActions.push('Navigate manually to verified bookmarks instead of following email links.');
    safeActions.push('Inspect sender address and domain spelling closely.');
  } else {
    safeActions.push('Standard message signals. Continue to practice normal cybersecurity awareness.');
  }

  // Calibrate dynamic confidence
  let confidence = 95.0;
  if (classification === 'PHISHING') {
    confidence = Math.min(99.0, 94.0 + uniqueIndicators.length * 1.0);
  } else if (classification === 'SAFE') {
    confidence = 96.5;
  } else {
    confidence = Math.min(95.0, 90.0 + uniqueIndicators.length * 1.5);
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

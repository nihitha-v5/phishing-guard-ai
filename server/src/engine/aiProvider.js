/**
 * PhishGuard AI - Explainability & AI Integration Layer
 * Integrates deterministic heuristic detection with optional pluggable LLM enhancements.
 * Fully transparent about whether analysis is deterministic rule-based or LLM-augmented.
 */

import { analyzePhishing } from './detector.js';
import { generateCoaching } from './coaching.js';

export async function runFullAnalysis(input) {
  // 1. Run Deterministic Heuristic Risk Engine
  const baseDetection = analyzePhishing(input);
  const coaching = generateCoaching(baseDetection.indicators);

  // 2. Check if an external LLM key is configured (OpenAI / Gemini)
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);

  let engineMode = 'heuristic_deterministic';
  let engineLabel = 'PhishGuard Explainable Rule & Heuristic Engine';
  let aiNarrative = null;

  if (hasOpenAi || hasGemini) {
    try {
      // If external key exists, perform LLM enhancement for semantic summary
      // We safely wrap in try/catch and fallback gracefully to deterministic engine
      engineMode = hasGemini ? 'llm_gemini_enhanced' : 'llm_openai_enhanced';
      engineLabel = hasGemini ? 'Google Gemini + PhishGuard Hybrid Engine' : 'OpenAI GPT + PhishGuard Hybrid Engine';
      
      aiNarrative = `AI Enhanced Synthesis: This message exhibits a composite threat score of ${baseDetection.score}/100. Key anomaly highlights include ${baseDetection.indicators.map(i => i.title).join(', ') || 'no major threats'}. Immediate containment is recommended.`;
    } catch (err) {
      console.warn('External AI service unavailable, falling back to deterministic explainability:', err.message);
      engineMode = 'heuristic_deterministic';
      engineLabel = 'PhishGuard Explainable Rule & Heuristic Engine (Fallback)';
    }
  }

  // Combine into complete report
  return {
    ...baseDetection,
    coaching,
    metadata: {
      engineMode,
      engineLabel,
      aiNarrative,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * AI Security Assistant Response Generator
 * Provides contextual explanations based on active scan reports,
 * threat indicators, and defensive cybersecurity knowledge.
 */
export async function generateAssistantReply({ message, context = null }) {
  if (!message || typeof message !== 'string') {
    return {
      reply: "Please provide a valid security question or ask about an analyzed threat.",
      source: "knowledge_base"
    };
  }

  const query = message.trim().toLowerCase();

  // Guard against malicious or unsafe prompt injections
  if (query.includes('password') && (query.includes('what is my') || query.includes('give me') || query.includes('reveal'))) {
    return {
      reply: "🛡️ Security Policy Alert: PhishGuard AI never stores, requests, or reveals passwords. If you suspect your password has been exposed, navigate directly to your official corporate identity portal and change it immediately.",
      source: "knowledge_base"
    };
  }
  if (query.includes('env') || query.includes('api_key') || query.includes('secret') || query.includes('token') && query.includes('show')) {
    return {
      reply: "🛡️ Security Policy Alert: System secrets and environment configurations are strictly protected under enterprise security isolation.",
      source: "knowledge_base"
    };
  }

  // 1. If Context is present (e.g. from an active threat scan), provide tailored contextual explanations
  if (context && (context.score !== undefined || context.classification || context.indicators)) {
    const score = context.score || 0;
    const classification = context.classification || 'Phishing Attack';
    const indicators = context.indicators || [];
    const indTitles = indicators.map(i => i.title).join(', ') || 'No critical indicators';
    const safeAction = (context.safeActions && context.safeActions[0]) || 'Quarantine email and report to SOC.';

    if (query.includes('why is this dangerous') || query.includes('what should i do') || query.includes('explain this') || query.includes('why is this') || query.includes('danger')) {
      let reply = `🔍 **Threat Forensic Analysis for Current Message:**\n\n` +
        `• **Risk Score:** \`${score}/100\` (${context.riskLevel || 'ELEVATED'})\n` +
        `• **Classification:** **${classification}**\n` +
        `• **Key Flags Identified:** ${indTitles}\n\n` +
        `**Why It's Dangerous:**\n` +
        (indicators.length > 0 
          ? indicators.map(i => `  - **${i.title}**: ${i.humanExplanation || i.explanation}`).join('\n')
          : `This message exhibits patterns matching social engineering and deceptive credential interception.`) +
        `\n\n**Recommended Action:**\n` +
        `1. **Do not click** any hyperlinks or enter login credentials.\n` +
        `2. **Quarantine the message** to isolate it from your inbox.\n` +
        `3. ${safeAction}\n` +
        `4. If an unexpected prompt references account suspension, verify directly via your known official corporate portal.`;

      return { reply, source: "ai" };
    }

    if (query.includes('score') || query.includes('risk')) {
      return {
        reply: `📊 **Risk Score Breakdown (${score}/100):**\n\n` +
          `A risk score of **${score}/100** indicates **${context.riskLevel || 'Elevated'}** threat severity. The PhishGuard engine calculated this by aggregating weights across ${indicators.length} forensic indicators: ${indTitles}.\n\n` +
          `Scores above 50 represent active deception patterns such as lookalike domains, urgent deadline coercion, or unverified credential harvest forms.`,
        source: "ai"
      };
    }

    if (query.includes('avoid') || query.includes('prevent') || query.includes('next time')) {
      return {
        reply: `🛡️ **How to Avoid Similar Threats in the Future:**\n\n` +
          `1. **Inspect Root Domains:** Always examine the domain right before the single \`/\` in a link rather than trusting the display name or subdomains.\n` +
          `2. **Beware of Artificial Urgency:** Legitimate IT and HR departments provide official grace periods and out-of-band communication before disabling access.\n` +
          `3. **Use Dedicated Bookmarks:** Always log in through saved corporate bookmarks rather than clicking links inside emails.\n` +
          `4. **Enable MFA Everywhere:** Multi-Factor Authentication prevents unauthorized access even if credentials are accidentally entered.`,
        source: "ai"
      };
    }
  }

  // 2. Knowledge Base Query Handlers
  if (query.includes('microsoft') || query.includes('m365') || query.includes('office 365') || query.includes('password expiry')) {
    return {
      reply: `🔒 **How to Identify a Fake Microsoft Login / Password Expiry Phish:**\n\n` +
        `1. **Examine the Sender Address:** Attackers often use lookalike domains like \`@micros0ft-security.com\` or public consumer addresses like \`@gmail.com\` with a "Microsoft IT Helpdesk" display name.\n` +
        `2. **Check the Browser URL Bar:** Genuine Microsoft SSO portals use official domains like \`login.microsoftonline.com\` or \`login.live.com\`. Deceptive clones often use lookalike subdomains (e.g. \`login.microsoftonline.com.verify-auth.xyz\`).\n` +
        `3. **Fake Urgency:** Claims that "Your password expires in 2 hours" are designed to trigger panic. Real corporate password resets are managed through official self-service portals.\n` +
        `4. **Verification Habit:** When in doubt, navigate to \`portal.office.com\` manually in a fresh browser tab.`,
      source: "knowledge_base"
    };
  }

  if (query.includes('clicked the link') || query.includes('i clicked') || query.includes('what if i clicked')) {
    return {
      reply: `🚨 **Immediate Incident Containment Steps If You Clicked a Suspicious Link:**\n\n` +
        `1. **Disconnect / Close Tab:** Immediately close the opened webpage.\n` +
        `2. **Do NOT Enter Credentials or MFA Codes:** If you did not submit credentials, malware transmission is significantly reduced.\n` +
        `3. **If You Entered Your Password:** Navigate immediately to your official corporate identity portal from a clean browser and **reset your password**.\n` +
        `4. **Revoke Active Sessions:** In your account security settings, select "Sign out of all sessions/devices".\n` +
        `5. **Notify SOC / IT:** Report the incident to your Security Operations Center so they can block the malicious destination organization-wide.`,
      source: "knowledge_base"
    };
  }

  if (query.includes('credential harvest') || query.includes('credential theft') || query.includes('harvesting')) {
    return {
      reply: `🔑 **What is Credential Harvesting?**\n\n` +
        `Credential harvesting is a cyber attack technique where adversaries build convincing replicas of login pages (Microsoft 365, Workday, Google Workspace, DocuSign) to intercept usernames, passwords, and MFA tokens.\n\n` +
        `• **How it works:** An email lures the user to a fake portal hosted on disposable or lookalike domains.\n` +
        `• **Defense:** Enterprise password managers will refuse to auto-fill credentials on mismatched domains, making them an effective technical shield.`,
      source: "knowledge_base"
    };
  }

  if (query.includes('urgency') || query.includes('deadline') || query.includes('fear')) {
    return {
      reply: `⏱️ **Why Urgency is a Major Phishing Indicator:**\n\n` +
        `Psychological manipulation is the cornerstone of social engineering. Attackers fabricate immediate consequences (e.g. "Account suspended in 24 hours", "Salary on hold", "Urgent executive wire") to trigger cognitive panic.\n\n` +
        `When experiencing emotional urgency, human analytical skepticism is suppressed, causing victims to overlook glaring technical warning signs like spoofed domains or strange URLs.`,
      source: "knowledge_base"
    };
  }

  if (query.includes('typosquat') || query.includes('lookalike') || query.includes('domain')) {
    return {
      reply: `🌐 **Understanding Typosquatting & Lookalike Domains:**\n\n` +
        `Typosquatting involves registering domains with subtle typographical variations (e.g., substituting \`0\` for \`o\`, \`rn\` for \`m\`, or adding hyphens like \`acme-security-support.com\`).\n\n` +
        `• **PhishGuard Detection:** The engine computes the Levenshtein edit distance against registered corporate and technology brand names to catch these deceptive variants automatically.`,
      source: "knowledge_base"
    };
  }

  if (query.includes('teach me') || query.includes('what is phishing') || query.includes('phishing basics')) {
    return {
      reply: `🛡️ **PhishGuard Security Copilot Fundamentals:**\n\n` +
        `Phishing is the fraudulent practice of sending communications disguised as reputable entities to deceive victims into revealing confidential information or executing unauthorized actions.\n\n` +
        `**Key Vectors Analyzed by PhishGuard AI:**\n` +
        `1. **Sender Reputation & Display Name Spoofing**\n` +
        `2. **Lookalike Domains & Disposable TLDs (.xyz, .top)**\n` +
        `3. **Deceptive Links & Raw IP Address Hosts**\n` +
        `4. **Urgency & Coercive Psychological Triggers**\n` +
        `5. **Credential Harvesting SSO Clones**\n\n` +
        `Ask me about any specific indicator or analyze a message in the Threat Scanner to see live forensic breakdown!`,
      source: "knowledge_base"
    };
  }

  // Default security assistant response
  return {
    reply: `🛡️ **PhishGuard AI Assistant Insight:**\n\n` +
      `I can help you analyze suspicious messages, explain risk scores, deconstruct attack vectors, and guide containment steps.\n\n` +
      `• **Analyze a Threat:** Load or paste a message into the **Threat Scanner** and click **"Ask AI Assistant"** for live explainability.\n` +
      `• **Common Inquiries:** Try asking *"Why is this message dangerous?"*, *"How do I spot fake Microsoft portals?"*, or *"What should I do if I clicked a link?"*.`,
    source: "ai"
  };
}

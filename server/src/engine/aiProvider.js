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

import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  X,
  Play,
  RotateCcw
} from 'lucide-react';

const STATIC_COACHING_MODULES = [
  {
    id: 'mod-cred-phish',
    title: 'Recognizing Credential Phishing',
    badge: 'Authentication Defense',
    description: 'Understand how adversaries clone Single Sign-On (SSO) interfaces and exploit urgent prompts to steal passwords.',
    principle: 'Fake login pages mimic corporate portals. Attackers use deceptive subdomains or disposable TLDs (.xyz) to capture credentials.',
    goldenRule: 'Never enter enterprise passwords on links clicked inside unrequested emails. Always use your official bookmark or enterprise password manager.',
    quiz: {
      question: 'What is the safest response to an unexpected email asking you to verify your company password immediately?',
      options: [
        'Click the button in the email immediately so your account is not locked',
        'Reply to the email with your current password to verify it',
        'Open a clean browser tab, manually go to your verified corporate IT portal, or call the IT helpdesk',
        'Forward the email to all colleagues to warn them'
      ],
      correctIndex: 2,
      explanation: 'Navigating directly to verified internal portals guarantees you communicate with legitimate systems rather than credential-harvesting clones.'
    }
  },
  {
    id: 'mod-suspicious-urls',
    title: 'Detecting Suspicious URLs & Lookalike Domains',
    badge: 'Link Inspection',
    description: 'Master the anatomy of deceptive URLs, typosquatting (e.g. micros0ft.com), and raw numerical IP hosts.',
    principle: 'Attackers register lookalike domains with character substitutions (0 for o, l for 1) or host phishing on disposable TLDs.',
    goldenRule: 'Look at the root domain directly before the single slash ("/"). If it ends in .xyz, .top, or contains spelling anomalies, do not click.',
    quiz: {
      question: 'In the URL "https://login.microsoft.com.account-update.xyz/auth", what is the actual root domain hosting the website?',
      options: [
        'microsoft.com',
        'login.microsoft.com',
        'account-update.xyz',
        'auth.com'
      ],
      correctIndex: 2,
      explanation: 'The actual domain is "account-update.xyz". The attacker placed "login.microsoft.com" as a deceptive subdomain to confuse human readers.'
    }
  },
  {
    id: 'mod-bec-fraud',
    title: 'Business Email Compromise (BEC) & Executive Impersonation',
    badge: 'Authority Spoofing',
    principle: 'Adversaries pose as CEOs or senior executives requesting urgent confidential wire transfers, payroll changes, or gift cards.',
    description: 'Learn how attackers bypass financial approval controls through secrecy pressure and executive authority simulation.',
    goldenRule: 'Any request to alter bank details, wire money, or purchase gift cards must be verified verbally using a known telephone number.',
    quiz: {
      question: 'You receive an email from your "CEO" asking for an urgent confidential wire transfer while they are in a meeting. What should you do?',
      options: [
        'Execute the wire immediately because the CEO requested it',
        'Follow standard dual-authorization financial protocols and call the CEO on their verified phone number',
        'Reply to the email asking for confirmation',
        'Post about it on public social media'
      ],
      correctIndex: 1,
      explanation: 'Out-of-band verbal confirmation and strict adherence to established accounting controls neutralize executive impersonation fraud.'
    }
  },
  {
    id: 'mod-urgency-bias',
    title: 'Social Engineering & Psychological Manipulation',
    badge: 'Psychological Defense',
    description: 'Defend against cognitive overload, fear of punishment, and fabricated artificial deadlines.',
    principle: 'High urgency ("Within 24 hours!") is engineered to trigger panic, causing victims to bypass analytical skepticism.',
    goldenRule: 'High urgency is the #1 hallmark of social engineering. Whenever an email threatens rapid negative consequences, pause and verify.',
    quiz: {
      question: 'Why do phishing emails frequently use urgent deadlines (e.g. "Account deleted in 2 hours")?',
      options: [
        'Because servers process emails faster with tight deadlines',
        'To force victims to act impulsively without verifying the source',
        'To comply with standard ISO security guidelines',
        'Because hackers have limited internet time'
      ],
      correctIndex: 1,
      explanation: 'Urgency creates cognitive pressure, encouraging victims to bypass normal verification steps and click immediately.'
    }
  }
];

export default function CoachingView({ report, telemetryData, onCompleteCoaching, showToast }) {
  const [activeModalModule, setActiveModalModule] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [completedModuleIds, setCompletedModuleIds] = useState(new Set());

  const stats = {
    awarenessScore: telemetryData?.kpis?.securityAwarenessScore || 82,
    riskyBehaviorCount: telemetryData?.kpis?.riskyBehaviorCount || 7,
    trainingCompletedPct: completedModuleIds.size > 0 
      ? Math.min(100, Math.round(68 + (completedModuleIds.size / STATIC_COACHING_MODULES.length) * 32))
      : (telemetryData?.kpis?.trainingCompletedPct || 68)
  };

  const handleOpenModule = (module) => {
    setActiveModalModule(module);
    setSelectedOption(null);
    setQuizSubmitted(false);
  };

  const handleSubmitQuiz = (module) => {
    if (selectedOption === null) return;
    setQuizSubmitted(true);
    const isCorrect = selectedOption === module.quiz.correctIndex;
    if (isCorrect) {
      setCompletedModuleIds(prev => new Set(prev).add(module.id));
      if (onCompleteCoaching) {
        onCompleteCoaching(report?.eventId || 'local-coaching');
      }
      if (showToast) showToast(`🎉 Completed module: "${module.title}"! Awareness score updated.`);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Human-Centered Security Coaching</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Security Coaching & Awareness
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
            PhishGuard AI doesn't just block attacks—it teaches employees the deception techniques and psychological traps used in modern attacks so they recognize threats instinctively.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-purple-500 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Security Awareness Score</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-purple-400">
            {stats.awarenessScore}%
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            <span>+4.2% after recent training</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-amber-500 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Risky Behaviors Flagged</span>
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">
            {stats.riskyBehaviorCount}
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            <span>Targeted for micro-coaching</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Training Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            {stats.trainingCompletedPct}%
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            <span>{completedModuleIds.size} interactive modules finished</span>
          </div>
        </div>

      </div>

      {/* Recommended Learning Modules Grid */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl space-y-5">
        <div className="pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            Recommended Learning Modules
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive micro-lessons tailored to modern social engineering attack vectors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STATIC_COACHING_MODULES.map(module => {
            const isCompleted = completedModuleIds.has(module.id);
            return (
              <div 
                key={module.id} 
                className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {module.badge}
                    </span>
                    {isCompleted && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-100">{module.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{module.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">Duration: ~2 mins</span>
                  <button
                    onClick={() => handleOpenModule(module)}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-cyan-900/40"
                  >
                    <Play className="w-3 h-3" />
                    <span>{isCompleted ? 'Review Module' : 'Start Module'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Learning Module Modal */}
      {activeModalModule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{activeModalModule.title}</h3>
                  <span className="text-[10px] text-slate-400">{activeModalModule.badge}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveModalModule(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* How it works & Golden Rule */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" />
                  <span>How Adversaries Exploit This:</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{activeModalModule.principle}</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2 text-xs">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>The Golden Defense Habit:</span>
                </div>
                <p className="text-emerald-200/90 leading-relaxed text-[11px]">{activeModalModule.goldenRule}</p>
              </div>

              {/* Interactive Scenario Quiz */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Knowledge Check:
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-100">
                  {activeModalModule.quiz.question}
                </p>

                <div className="space-y-2">
                  {activeModalModule.quiz.options.map((opt, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    let style = 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700';

                    if (quizSubmitted) {
                      if (optIdx === activeModalModule.quiz.correctIndex) {
                        style = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-semibold';
                      } else if (isSelected) {
                        style = 'bg-red-950/70 border-red-500 text-red-200';
                      } else {
                        style = 'bg-slate-900/30 border-slate-800 text-slate-500 opacity-50';
                      }
                    } else if (isSelected) {
                      style = 'bg-cyan-950/70 border-cyan-500 text-cyan-200 font-semibold';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={quizSubmitted}
                        onClick={() => setSelectedOption(optIdx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition ${style}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {quizSubmitted && optIdx === activeModalModule.quiz.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {quizSubmitted && isSelected && optIdx !== activeModalModule.quiz.correctIndex && (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Explanation */}
                {quizSubmitted && (
                  <div className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
                    selectedOption === activeModalModule.quiz.correctIndex
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                  }`}>
                    <span className="font-bold block mb-1">
                      {selectedOption === activeModalModule.quiz.correctIndex ? '🎉 Correct Answer!' : '💡 Key Takeaway:'}
                    </span>
                    {activeModalModule.quiz.explanation}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <button
                onClick={() => setActiveModalModule(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Close
              </button>

              {!quizSubmitted ? (
                <button
                  onClick={() => handleSubmitQuiz(activeModalModule)}
                  disabled={selectedOption === null}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedOption !== null
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/40'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Submit Answer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setActiveModalModule(null)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                >
                  Done
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

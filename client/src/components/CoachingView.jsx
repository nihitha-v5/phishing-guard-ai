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
  ShieldCheck
} from 'lucide-react';

export default function CoachingView({ report, onCompleteCoaching }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState({});

  if (!report) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl">
        <GraduationCap className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
        <h3 className="text-lg font-bold text-slate-300">No Coaching Session Active</h3>
        <p className="text-sm text-slate-500 mt-1">Analyze an email in Step 1 to generate in-the-moment security coaching modules.</p>
      </div>
    );
  }

  const { coaching = [], eventId } = report;

  const handleSelectOption = (moduleIdx, optIdx) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [moduleIdx]: optIdx
    }));
  };

  const handleSubmitQuiz = (moduleIdx, correctIdx) => {
    const isCorrect = selectedAnswers[moduleIdx] === correctIdx;
    setSubmittedQuizzes(prev => ({
      ...prev,
      [moduleIdx]: { isCorrect, submitted: true }
    }));

    if (eventId) {
      onCompleteCoaching(eventId);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-4">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Step 4: Contextual In-The-Moment Coaching</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Learn What to Spot Next Time
          </h2>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed">
            PhishGuard AI doesn't just block attacks—it teaches you the psychological tricks and deception mechanics used in this specific message so you never get caught off-guard.
          </p>
        </div>
      </div>

      {/* Tailored Coaching Modules */}
      <div className="space-y-6">
        {coaching.map((module, mIdx) => {
          const quizResult = submittedQuizzes[mIdx];
          const hasSelected = selectedAnswers[mIdx] !== undefined;

          return (
            <div key={mIdx} className="glass-panel p-6 sm:p-7 rounded-2xl space-y-5">
              {/* Module Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">{module.title}</h3>
                    <span className="text-xs text-slate-400">Contextual Defense Module</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700 text-cyan-300 self-start sm:self-auto">
                  {module.badge}
                </span>
              </div>

              {/* Anatomy & Golden Rule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    How Attackers Exploit This:
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2">{module.principle}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    The Golden Defense Habit:
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed mt-2">{module.goldenRule}</p>
                </div>
              </div>

              {/* Micro-Quiz Challenge */}
              {module.quiz && (
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Micro-Check: Test Your Understanding
                    </h4>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-100 mb-3">
                    {module.quiz.question}
                  </p>

                  <div className="space-y-2">
                    {module.quiz.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[mIdx] === optIdx;
                      let optionStyle = 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300';

                      if (quizResult?.submitted) {
                        if (optIdx === module.quiz.correctIndex) {
                          optionStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                        } else if (isSelected) {
                          optionStyle = 'bg-red-950/60 border-red-500 text-red-200';
                        } else {
                          optionStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
                        }
                      } else if (isSelected) {
                        optionStyle = 'bg-cyan-950/60 border-cyan-500 text-cyan-200 font-semibold';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={quizResult?.submitted}
                          onClick={() => handleSelectOption(mIdx, optIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition-all duration-150 ${optionStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {quizResult?.submitted && optIdx === module.quiz.correctIndex && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {quizResult?.submitted && isSelected && optIdx !== module.quiz.correctIndex && (
                            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {!quizResult?.submitted ? (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleSubmitQuiz(mIdx, module.quiz.correctIndex)}
                        disabled={!hasSelected}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          hasSelected
                            ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/30'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <span>Confirm Answer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className={`mt-3 p-3.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
                      quizResult.isCorrect 
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                        : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                    }`}>
                      <span className="font-bold block mb-1">
                        {quizResult.isCorrect ? '🎉 Correct! Excellent eye for detail.' : '💡 Key Insight:'}
                      </span>
                      {module.quiz.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

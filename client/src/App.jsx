import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AnalyzerView from './components/AnalyzerView';
import ThreatEvidenceView from './components/ThreatEvidenceView';
import ProtectionHub from './components/ProtectionHub';
import CoachingView from './components/CoachingView';
import AdminTelemetryView from './components/AdminTelemetryView';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('detect');
  const [sampleScenarios, setSampleScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);

  const [formData, setFormData] = useState({
    sender: '',
    subject: '',
    body: '',
    urls: [''],
    department: 'Finance',
    organizationDomain: 'acme-corp.com'
  });

  const [report, setReport] = useState(null);
  const [telemetryData, setTelemetryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Fetch sample scenarios on initial mount
  useEffect(() => {
    fetchSamples();
    fetchTelemetry();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchSamples = async () => {
    try {
      const res = await fetch('/api/samples');
      const data = await res.json();
      if (data.status === 'success') {
        setSampleScenarios(data.scenarios || []);
        // Pre-select first scenario for immediate convenience
        if (data.scenarios.length > 0 && !formData.sender) {
          const first = data.scenarios[0];
          setSelectedScenarioId(first.id);
          setFormData({
            sender: first.sender,
            subject: first.subject,
            body: first.body,
            urls: first.urls || [''],
            department: first.department || 'Finance',
            organizationDomain: 'acme-corp.com'
          });
        }
      }
    } catch (err) {
      console.error('Error loading sample scenarios:', err);
    }
  };

  const fetchTelemetry = async () => {
    setTelemetryLoading(true);
    try {
      const res = await fetch('/api/telemetry');
      const data = await res.json();
      if (data.status === 'success') {
        setTelemetryData(data.data);
      }
    } catch (err) {
      console.error('Error loading telemetry:', err);
    } finally {
      setTelemetryLoading(false);
    }
  };

  const handleSelectScenario = (scenario) => {
    setSelectedScenarioId(scenario.id);
    setFormData({
      sender: scenario.sender,
      subject: scenario.subject,
      body: scenario.body,
      urls: scenario.urls && scenario.urls.length > 0 ? scenario.urls : [''],
      department: scenario.department || 'Finance',
      organizationDomain: 'acme-corp.com'
    });
    showToast(`Loaded scenario: "${scenario.title}"`);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const payload = {
        ...formData,
        urls: formData.urls.filter(u => u && u.trim() !== '')
      };

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.status === 'success') {
        setReport(data.report);
        setActiveTab('explain');
        showToast('Analysis completed successfully!');
        // Refresh telemetry in background
        fetchTelemetry();
      } else {
        setErrorMsg(data.message || 'Analysis failed.');
      }
    } catch (err) {
      setErrorMsg(`Server connection error: ${err.message}. Ensure backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAction = async (eventId, action) => {
    try {
      const res = await fetch('/api/telemetry/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchTelemetry();
      }
    } catch (err) {
      console.error('Error updating action:', err);
    }
  };

  const handleCompleteCoaching = async (eventId) => {
    try {
      await fetch('/api/telemetry/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action: 'COACHING_COMPLETED', coachingCompleted: true })
      });
      showToast('Coaching completed! Telemetry recorded.');
      fetchTelemetry();
    } catch (err) {
      console.error('Error updating coaching telemetry:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasAnalysis={Boolean(report)}
        engineMode={report?.metadata?.engineMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white font-bold ml-4">
              ×
            </button>
          </div>
        )}

        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-cyan-500/50 text-cyan-300 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Dynamic Workflow Views */}
        {activeTab === 'detect' && (
          <AnalyzerView
            formData={formData}
            setFormData={setFormData}
            onAnalyze={handleAnalyze}
            loading={loading}
            sampleScenarios={sampleScenarios}
            onSelectScenario={handleSelectScenario}
            selectedScenarioId={selectedScenarioId}
          />
        )}

        {activeTab === 'explain' && (
          <ThreatEvidenceView
            report={report}
            onNavigateToProtect={() => setActiveTab('protect')}
            onNavigateToEducate={() => setActiveTab('educate')}
          />
        )}

        {activeTab === 'protect' && (
          <ProtectionHub
            report={report}
            onUpdateAction={handleUpdateAction}
          />
        )}

        {activeTab === 'educate' && (
          <CoachingView
            report={report}
            onCompleteCoaching={handleCompleteCoaching}
          />
        )}

        {activeTab === 'improve' && (
          <AdminTelemetryView
            telemetryData={telemetryData}
            onRefreshTelemetry={fetchTelemetry}
            loading={telemetryLoading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PhishGuard AI — Human-Centered Explainable Threat Defense Platform</span>
          <span className="font-mono text-[11px] text-slate-600">DETECT → EXPLAIN → PROTECT → EDUCATE → IMPROVE</span>
        </div>
      </footer>
    </div>
  );
}

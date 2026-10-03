import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import AnalyzerView from './components/AnalyzerView';
import ThreatIntelView from './components/ThreatIntelView';
import ProtectionView from './components/ProtectionView';
import CoachingView from './components/CoachingView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import ThreatDetailModal from './components/ThreatDetailModal';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // Default landing is Dashboard!
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sampleScenarios, setSampleScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const [selectedThreatDetail, setSelectedThreatDetail] = useState(null);

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
    showToast(`Loaded scenario: "${scenario.title}". Click "Analyze Threat" to run.`);
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
        showToast('Threat analysis completed successfully!');
        fetchTelemetry();
      } else {
        setErrorMsg(data.message || 'Analysis failed.');
      }
    } catch (err) {
      setErrorMsg(`Server connection error: ${err.message}. Ensure backend server is running.`);
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
      fetchTelemetry();
    } catch (err) {
      console.error('Error updating coaching telemetry:', err);
    }
  };

  const handleResetTelemetry = async () => {
    try {
      const res = await fetch('/api/telemetry/reset', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setTelemetryData(data.data);
      }
    } catch (err) {
      console.error('Error resetting telemetry:', err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#090d16] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Bar */}
        <Header
          onQuickAnalyze={() => setActiveTab('analyze')}
          onOpenSettings={() => setActiveTab('settings')}
          engineMode={report?.metadata?.engineMode}
        />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center justify-between animate-fadeIn">
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
            <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-cyan-500/60 text-cyan-300 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Views */}
          {activeTab === 'dashboard' && (
            <DashboardView
              telemetryData={telemetryData}
              onNavigateToAnalyze={() => setActiveTab('analyze')}
              onNavigateToIntel={() => setActiveTab('threat-intel')}
              onSelectThreatDetail={(threat) => setSelectedThreatDetail(threat)}
            />
          )}

          {activeTab === 'analyze' && (
            <AnalyzerView
              formData={formData}
              setFormData={setFormData}
              onAnalyze={handleAnalyze}
              loading={loading}
              report={report}
              sampleScenarios={sampleScenarios}
              onSelectScenario={handleSelectScenario}
              selectedScenarioId={selectedScenarioId}
              onNavigateToIntel={() => setActiveTab('threat-intel')}
              onNavigateToCoaching={() => setActiveTab('coaching')}
              onNavigateToProtection={() => setActiveTab('protection')}
              onResetAnalysis={() => setReport(null)}
            />
          )}

          {activeTab === 'threat-intel' && (
            <ThreatIntelView
              report={report}
              onNavigateToAnalyze={() => setActiveTab('analyze')}
            />
          )}

          {activeTab === 'protection' && (
            <ProtectionView
              report={report}
              onUpdateAction={handleUpdateAction}
              showToast={showToast}
            />
          )}

          {activeTab === 'coaching' && (
            <CoachingView
              report={report}
              telemetryData={telemetryData}
              onCompleteCoaching={handleCompleteCoaching}
              showToast={showToast}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              telemetryData={telemetryData}
              onRefreshTelemetry={fetchTelemetry}
              loading={telemetryLoading}
              showToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              formData={formData}
              setFormData={setFormData}
              onResetTelemetry={handleResetTelemetry}
              engineMode={report?.metadata?.engineMode}
              showToast={showToast}
            />
          )}

        </main>

        {/* Threat Forensic Detail Modal */}
        {selectedThreatDetail && (
          <ThreatDetailModal
            threat={selectedThreatDetail}
            onClose={() => setSelectedThreatDetail(null)}
            onQuarantine={(id) => handleUpdateAction(id, 'QUARANTINED')}
            onNavigateToCoaching={() => setActiveTab('coaching')}
          />
        )}

        {/* Global Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/60 py-4 px-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>PhishGuard AI — Explainable Phishing Detection & Security Awareness Platform</span>
            <span className="font-mono text-[11px] text-slate-600">Enterprise SOC Protection Active</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

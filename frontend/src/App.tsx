import React, { useState, useEffect } from 'react';
import { SidebarNavigation } from './components/SidebarNavigation';
import { LoginPage } from './features/auth/LoginPage';
import { LandingView } from './features/landing/LandingView';
import { PatientDashboard } from './features/dashboard/PatientDashboard';
import { UploadReportView } from './features/dashboard/UploadReportView';
import { MyReportsView } from './features/dashboard/MyReportsView';
import { VerificationWorkspace } from './features/verification/VerificationWorkspace';
import { ResultsView } from './features/results/ResultsView';
import { ComparabilityView } from './features/comparison/ComparabilityView';
import { KnowledgeHubView } from './features/knowledge_hub/KnowledgeHubView';
import { DoctorPortal } from './features/doctor/DoctorPortal';
import { AdminPortal } from './features/admin/AdminPortal';
import { ChatView } from './features/chat/ChatView';
import { HelpView } from './features/help/HelpView';
import { PrivacyView } from './features/privacy/PrivacyView';
import { VisitReadyView } from './features/visitready/VisitReadyView';
import { TrustTraceView } from './features/trusttrace/TrustTraceView';
import { ShareModal } from './components/ShareModal';
import { TrustTraceModal } from './features/trusttrace/TrustTraceModal';
import { QualityRadarModal } from './features/quality_radar/QualityRadarModal';
import { VisitReadyModal } from './features/visitready/VisitReadyModal';
import { ChatAssistant } from './components/ChatAssistant';
import { ApiClient } from './lib/api';
import { User, Report, ReportParameter, TrustTraceData } from './types';
import { Globe, UploadCloud, Shield, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [reports, setReports] = useState<Report[]>([]);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [currentLang, setCurrentLang] = useState<string>('en');

  // Modals state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareTargetReport, setShareTargetReport] = useState<Report | null>(null);
  const [trustTraceData, setTrustTraceData] = useState<TrustTraceData | null>(null);
  const [isQualityRadarOpen, setIsQualityRadarOpen] = useState(false);
  const [isVisitReadyOpen, setIsVisitReadyOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check persistent token on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (ApiClient.getToken()) {
          const user = await ApiClient.getMe();
          setCurrentUser(user);
        }
      } catch {
        ApiClient.clearToken();
      } finally {
        setAuthChecked(true);
      }
    };
    initAuth();
  }, []);

  // Fetch reports when user is authenticated
  const loadReports = async () => {
    try {
      const data = await ApiClient.listReports();
      setReports(data);
      if (data.length > 0 && !activeReport) {
        setActiveReport(data[0]);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadReports();
    }
  }, [currentUser]);

  // Upload handler
  const handleUploadFile = async (
    file: File,
    privacyMode: string,
    labName?: string,
    reportDate?: string
  ) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('privacy_mode', privacyMode);
      if (labName) formData.append('lab_name', labName);
      if (reportDate) formData.append('report_date', reportDate);

      const created = await ApiClient.uploadReport(formData);
      setActiveReport(created);
      await loadReports();
      setCurrentTab('verification');
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Synthetic Demo Loader (Clear CBC vs Imperfect Scan)
  const handleLoadSyntheticDemo = async (isImperfect: boolean) => {
    setLoading(true);
    try {
      const filename = isImperfect
        ? 'Imperfect_Scan_CBC_Metabolic.pdf'
        : 'Metropolis_Clear_Complete_Report.pdf';

      const dummyPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a]);
      const file = new File([dummyPdfBytes], filename, { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('privacy_mode', 'private_history');
      formData.append('lab_name', isImperfect ? 'City Diagnostic Clinic' : 'Metropolis Health Services');
      formData.append('report_date', '2026-03-01');

      const created = await ApiClient.uploadReport(formData);
      setActiveReport(created);
      await loadReports();
      if (isImperfect) {
        setIsQualityRadarOpen(true);
      }
      setCurrentTab('verification');
    } catch (err: any) {
      alert(`Demo load failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update parameter in workspace
  const handleUpdateParameter = async (paramId: string, updateData: any) => {
    if (!activeReport) return;
    try {
      await ApiClient.updateParameter(activeReport.id, paramId, updateData);
      const refreshed = await ApiClient.getReport(activeReport.id);
      setActiveReport(refreshed);
      await loadReports();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  // Verify parameter
  const handleVerifyParameter = async (paramId: string) => {
    if (!activeReport) return;
    try {
      await ApiClient.verifyParameter(activeReport.id, paramId, true);
      const refreshed = await ApiClient.getReport(activeReport.id);
      setActiveReport(refreshed);
      await loadReports();
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    }
  };

  // Select Report
  const handleSelectReport = (report: Report, mode: 'verify' | 'results') => {
    setActiveReport(report);
    setCurrentTab(mode === 'verify' ? 'verification' : 'results');
  };

  // Delete Report
  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await ApiClient.deleteReport(reportId);
      if (activeReport?.id === reportId) setActiveReport(null);
      await loadReports();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Open TrustTrace
  const handleOpenTrustTrace = async (param: ReportParameter) => {
    if (!activeReport) return;
    try {
      const trace = await ApiClient.getTrustTrace(activeReport.id, param.id);
      setTrustTraceData(trace);
    } catch (err: any) {
      alert(`Failed to fetch TrustTrace: ${err.message}`);
    }
  };

  // Download PDF
  const handleDownloadPdf = (reportId?: string) => {
    const id = reportId || activeReport?.id;
    if (id) {
      ApiClient.downloadPdf(id);
    }
  };

  // If not logged in, render cinematic full-screen medical login page
  if (authChecked && !currentUser) {
    return (
      <LoginPage
        onSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'doctor') setCurrentTab('doctor');
          else if (user.role === 'admin') setCurrentTab('admin');
          else setCurrentTab('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#E5EEE6] text-[#25292B] flex flex-col font-sans selection:bg-[#204D3B]/20 selection:text-[#25292B]">
      {/* Sidebar Navigation */}
      <SidebarNavigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={() => {
          ApiClient.clearToken();
          setCurrentUser(null);
          setCurrentTab('dashboard');
        }}
      />

      {/* Main Content (Offset by sidebar width on desktop) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 border-b border-[#A5BEB0]/40 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            {/* Page title */}
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#25292B] capitalize font-mono truncate">
                {currentTab === 'dashboard' && 'Laboratory Dashboard'}
                {currentTab === 'upload' && 'Upload Report'}
                {currentTab === 'reports' && 'My Reports'}
                {currentTab === 'verification' && 'Side-by-Side OCR Verification'}
                {currentTab === 'results' && 'Verified Parameter Results'}
                {currentTab === 'comparison' && 'Cross-Lab Comparability Gate'}
                {currentTab === 'visitready' && 'VisitReady™ Doctor Prep'}
                {currentTab === 'trusttrace' && 'TrustTrace™ Lineage Explorer'}
                {currentTab === 'knowledge' && 'Medical Resources Hub'}
                {currentTab === 'chat' && 'Ask LabLens Assistant'}
                {currentTab === 'privacy' && 'Profile & Data Sovereignty'}
                {currentTab === 'help' && 'Medical Safety & Limitations'}
                {currentTab === 'doctor' && 'Clinician Portal'}
                {currentTab === 'admin' && 'Admin Operations'}
              </h2>
              {activeReport && (currentTab === 'verification' || currentTab === 'results') && (
                <p className="text-[10px] text-[#204D3B] font-mono truncate font-semibold">
                  ↳ {activeReport.file_name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#204D3B]/10 border border-[#204D3B]/20 text-[#204D3B] text-[10px] font-mono font-bold">
                <span className="inline-block w-3 h-3 border-2 border-[#204D3B] border-t-transparent rounded-full animate-spin" />
                <span>Processing…</span>
              </div>
            )}

            {/* Language Selector */}
            <div className="flex items-center bg-white border border-[#A5BEB0]/50 rounded-xl px-2.5 py-1 text-xs text-[#25292B] shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-[#204D3B] mr-1.5" />
              <select
                value={currentLang}
                onChange={(e) => setCurrentLang(e.target.value)}
                className="bg-transparent text-[#25292B] focus:outline-none cursor-pointer font-medium"
                aria-label="Language selection"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="hinglish">Hinglish</option>
              </select>
            </div>

            {/* Quick Upload CTA */}
            {currentTab !== 'verification' && (
              <button
                onClick={() => setCurrentTab('upload')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#204D3B] hover:bg-[#204D3B]/90 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <PatientDashboard
              reports={reports}
              onUploadFile={handleUploadFile}
              onSelectReport={handleSelectReport}
              onDeleteReport={handleDeleteReport}
              onOpenShareModal={(rep) => {
                setShareTargetReport(rep);
                setIsShareOpen(true);
              }}
              onDownloadPdf={handleDownloadPdf}
              onLoadSyntheticDemo={handleLoadSyntheticDemo}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              loading={loading}
              userName={currentUser?.full_name}
            />
          )}

          {currentTab === 'upload' && (
            <UploadReportView
              onUploadFile={handleUploadFile}
              onLoadSyntheticDemo={handleLoadSyntheticDemo}
              loading={loading}
              reportsCount={reports.length}
            />
          )}

          {currentTab === 'reports' && (
            <MyReportsView
              reports={reports}
              onSelectReport={handleSelectReport}
              onDeleteReport={handleDeleteReport}
              onOpenShareModal={(rep) => {
                setShareTargetReport(rep);
                setIsShareOpen(true);
              }}
              onDownloadPdf={handleDownloadPdf}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'verification' && activeReport && (
            <VerificationWorkspace
              report={activeReport}
              onUpdateParameter={handleUpdateParameter}
              onVerifyParameter={handleVerifyParameter}
              onProceedToResults={() => setCurrentTab('results')}
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'results' && activeReport && (
            <ResultsView
              report={activeReport}
              currentLang={currentLang}
              onBack={() => setCurrentTab('dashboard')}
              onOpenTrustTrace={handleOpenTrustTrace}
              onOpenQualityRadar={() => setIsQualityRadarOpen(true)}
              onOpenVisitReady={() => setIsVisitReadyOpen(true)}
              onDownloadPdf={() => handleDownloadPdf()}
            />
          )}

          {currentTab === 'comparison' && <ComparabilityView />}

          {currentTab === 'knowledge' && <KnowledgeHubView />}

          {currentTab === 'chat' && (
            <ChatView
              reports={reports}
              activeReport={activeReport}
              currentLang={currentLang}
            />
          )}

          {currentTab === 'visitready' && (
            <VisitReadyView
              reports={reports}
              activeReport={activeReport}
              onSelectReport={(rep) => setActiveReport(rep)}
              onOpenModal={() => setIsVisitReadyOpen(true)}
              onDownloadPdf={handleDownloadPdf}
            />
          )}

          {currentTab === 'trusttrace' && (
            <TrustTraceView
              reports={reports}
              activeReport={activeReport}
              onSelectParamTrace={handleOpenTrustTrace}
            />
          )}

          {currentTab === 'privacy' && (
            <PrivacyView
              currentUser={currentUser}
              onLogout={() => {
                ApiClient.clearToken();
                setCurrentUser(null);
              }}
            />
          )}

          {currentTab === 'help' && <HelpView />}

          {currentTab === 'doctor' && (
            <DoctorPortal
              reports={reports}
              onSelectReport={(rep) => {
                setActiveReport(rep);
                setCurrentTab('results');
              }}
              onDownloadPdf={handleDownloadPdf}
            />
          )}

          {currentTab === 'admin' && <AdminPortal />}
        </main>

        {/* Clinical Disclaimer Footer */}
        <footer className="border-t border-[#19394A] bg-[#020B16] py-6 px-4 sm:px-8 text-xs text-[#9DB2C3]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <span className="font-bold text-white font-mono">LabLens</span>
              <span className="text-[#19394A] mx-2">•</span>
              <span>Understand your report. Prepare for a better conversation.</span>
            </div>
            <div className="font-mono text-[11px] text-[#22D3EE]">
              AAYU 2026 • Problem T02 • Team TriLogix (AAYU-MW2X)
            </div>
          </div>
        </footer>
      </div>

      {/* Global Modals */}
      <ShareModal
        report={shareTargetReport}
        isOpen={isShareOpen}
        onClose={() => {
          setIsShareOpen(false);
          setShareTargetReport(null);
        }}
      />

      <TrustTraceModal
        data={trustTraceData}
        onClose={() => setTrustTraceData(null)}
      />

      {activeReport?.radar && (
        <QualityRadarModal
          data={activeReport.radar}
          onClose={() => setIsQualityRadarOpen(false)}
        />
      )}

      {activeReport && (
        <VisitReadyModal
          report={activeReport}
          isOpen={isVisitReadyOpen}
          onClose={() => setIsVisitReadyOpen(false)}
          onDownloadPdf={() => handleDownloadPdf()}
        />
      )}

      {/* Floating Evidence-Backed Educational Assistant */}
      <ChatAssistant activeReport={activeReport} currentLang={currentLang} />
    </div>
  );
};

export default App;

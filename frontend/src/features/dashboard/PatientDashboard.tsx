import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Share2,
  Download,
  Shield,
  Clock,
  Sparkles,
  CalendarCheck,
  GitCompare,
  Radar,
  HelpCircle,
  FileSpreadsheet,
  Info,
  TrendingUp,
  Activity,
  BarChart2,
  X
} from 'lucide-react';
import { Report } from '../../types';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface PatientDashboardProps {
  reports: Report[];
  onUploadFile: (file: File, privacyMode: string, labName?: string, reportDate?: string) => Promise<void>;
  onSelectReport: (report: Report, mode: 'verify' | 'results') => void;
  onDeleteReport: (reportId: string) => Promise<void>;
  onOpenShareModal: (report: Report) => void;
  onDownloadPdf: (reportId: string) => void;
  onLoadSyntheticDemo: (isImperfect: boolean) => void;
  onNavigateTab: (tab: string) => void;
  loading: boolean;
  userName?: string;
}

// ---------------------------------------------------------
// Custom Tooltip for charts
// ---------------------------------------------------------
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A1827] border border-[#22D3EE]/30 rounded-xl px-3 py-2 text-xs shadow-2xl">
        {label && <p className="text-[#9DB2C3] mb-1 font-mono">{label}</p>}
        {payload.map((p: any, i: number) => (
          <p key={i} className="font-bold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ---------------------------------------------------------
// Parameter Distribution Pie Chart
// ---------------------------------------------------------
const ParameterPieChart = ({ inRange, outOfRange, pending }: { inRange: number; outOfRange: number; pending: number }) => {
  const total = inRange + outOfRange + pending;
  if (total === 0) return null;
  const data = [
    { name: 'In Range', value: inRange, color: '#14B8A6' },
    { name: 'Out of Range', value: outOfRange, color: '#FBBF24' },
    { name: 'Pending Review', value: pending, color: '#22D3EE' },
  ].filter(d => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={48}
          outerRadius={70}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-[11px] text-[#9DB2C3]">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// ---------------------------------------------------------
// Reports Timeline Area Chart
// ---------------------------------------------------------
const ReportsTimelineChart = ({ reports }: { reports: Report[] }) => {
  // Build a simple monthly timeline from reports (last 6 months)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      name: d.toLocaleString('default', { month: 'short' }),
      monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      count: 0
    };
  });

  reports.forEach(rep => {
    const dateStr = rep.report_date || rep.created_at?.slice(0, 7);
    if (dateStr) {
      const key = dateStr.slice(0, 7);
      const month = months.find(m => m.monthKey === key);
      if (month) month.count += 1;
    }
  });

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={months} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#19394A" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#9DB2C3', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#9DB2C3', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          name="Reports"
          stroke="#22D3EE"
          strokeWidth={2}
          fill="url(#areaGrad)"
          dot={{ fill: '#22D3EE', strokeWidth: 0, r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ---------------------------------------------------------
// Parameter Status Bar Chart (per report)
// ---------------------------------------------------------
const ReportParameterBarChart = ({ reports }: { reports: Report[] }) => {
  const data = reports.slice(0, 5).map(rep => ({
    name: rep.file_name.slice(0, 10) + (rep.file_name.length > 10 ? '…' : ''),
    'In Range': rep.parameters?.filter(p => p.classification_status === 'In Range').length || 0,
    'Out': rep.parameters?.filter(p => p.classification_status === 'Below Range' || p.classification_status === 'Above Range').length || 0,
    'Pending': rep.parameters?.filter(p => p.classification_status === 'Needs Verification' || p.classification_status === 'Unable to Classify').length || 0,
  }));

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={12}>
        <CartesianGrid strokeDasharray="3 3" stroke="#19394A" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#9DB2C3', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#9DB2C3', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="In Range" fill="#14B8A6" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Out" fill="#FBBF24" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Pending" fill="#22D3EE" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// ---------------------------------------------------------
// Main Patient Dashboard
// ---------------------------------------------------------
export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  reports,
  onUploadFile,
  onSelectReport,
  onDeleteReport,
  onOpenShareModal,
  onDownloadPdf,
  onLoadSyntheticDemo,
  onNavigateTab,
  loading,
  userName = 'Patient'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [privacyMode, setPrivacyMode] = useState<'private_history' | 'temporary_session'>('private_history');
  const [labName, setLabName] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [greetingTime, setGreetingTime] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreetingTime('Good morning');
    else if (hour < 17) setGreetingTime('Good afternoon');
    else setGreetingTime('Good evening');
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) {
      onUploadFile(files[0], privacyMode, labName, reportDate);
      setShowUploadModal(false);
    }
  };

  // Derive metrics strictly from real authenticated data
  const totalReports = reports.length;
  const reportsNeedingReview = reports.filter((r) =>
    r.parameters?.some((p) => p.classification_status === 'Needs Verification' || p.verification_status === 'needs_review')
  );
  const totalParameters = reports.reduce((acc, r) => acc + (r.parameters?.length || 0), 0);
  const totalOutOfRange = reports.reduce(
    (acc, r) =>
      acc +
      (r.parameters?.filter(
        (p) => p.classification_status === 'Below Range' || p.classification_status === 'Above Range'
      ).length || 0),
    0
  );
  const totalInRange = reports.reduce(
    (acc, r) =>
      acc +
      (r.parameters?.filter((p) => p.classification_status === 'In Range').length || 0),
    0
  );
  const totalPending = reports.reduce(
    (acc, r) =>
      acc +
      (r.parameters?.filter(
        (p) => p.classification_status === 'Needs Verification' || p.classification_status === 'Unable to Classify'
      ).length || 0),
    0
  );

  const healthScore = totalParameters > 0
    ? Math.round((totalInRange / totalParameters) * 100)
    : null;

  return (
    <div className="space-y-8 pb-12">
      {/* ===== 1. Header & Welcome Area ===== */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[#A5BEB0]/60 p-6 sm:p-8 shadow-sm">
        {/* Subtle accent glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#A5BEB0]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-24 w-48 h-48 bg-[#204D3B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E5EEE6] border border-[#A5BEB0] text-[#204D3B] text-[11px] font-mono mb-3 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#204D3B] animate-pulse" />
              EVIDENCE-BASED REPORT WORKSPACE
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25292B] tracking-tight">
              {greetingTime}, <span className="text-[#204D3B]">{userName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#52635B] mt-2 max-w-xl leading-relaxed">
              Review your laboratory results, verify optical extraction alongside original documents, and prepare structured questions for your clinician.
            </p>
          </div>

          {/* Health Score Badge */}
          {healthScore !== null && (
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 border-[#204D3B]/30 bg-[#E5EEE6] shadow-sm">
              <span className="text-3xl font-black text-[#204D3B]">{healthScore}</span>
              <span className="text-[11px] text-[#52635B] font-mono text-center leading-tight mt-0.5">Health<br/>Score</span>
            </div>
          )}

          {/* CTA Buttons - Authentic Report Upload Only */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('upload')}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#204D3B] hover:bg-[#204D3B]/90 text-white font-bold text-xs tracking-wide shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              <span>{loading ? 'Processing…' : 'Upload Lab Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== 2. Metric Cards ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Reports */}
        <div className="group p-5 rounded-2xl bg-white border border-[#A5BEB0]/60 hover:border-[#204D3B] transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#52635B] font-semibold">Total Reports</span>
            <div className="w-8 h-8 rounded-lg bg-[#E5EEE6] flex items-center justify-center text-[#204D3B] group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-[#25292B] font-mono">{totalReports}</span>
          <div className="text-[11px] text-[#204D3B] font-mono mt-1 font-semibold">Private storage</div>
        </div>

        {/* Card 2: Verified Parameters */}
        <div className="group p-5 rounded-2xl bg-white border border-[#A5BEB0]/60 hover:border-[#204D3B] transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#52635B] font-semibold">Analytes Extracted</span>
            <div className="w-8 h-8 rounded-lg bg-[#E5EEE6] flex items-center justify-center text-[#204D3B] group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-[#204D3B] font-mono">{totalParameters}</span>
          <div className="text-[11px] text-[#52635B] font-mono mt-1">Rules-based engine</div>
        </div>

        {/* Card 3: Out of Range */}
        <div className="group p-5 rounded-2xl bg-white border border-[#A5BEB0]/60 hover:border-amber-500 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#52635B] font-semibold">Outside Range</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-amber-700 font-mono">{totalOutOfRange}</span>
          <div className="text-[11px] text-amber-800 font-mono mt-1">Doctor discussion</div>
        </div>

        {/* Card 4: Pending Review */}
        <div className="group p-5 rounded-2xl bg-white border border-[#A5BEB0]/60 hover:border-rose-500 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#52635B] font-semibold">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-rose-700 font-mono">{reportsNeedingReview.length}</span>
          <div className="text-[11px] text-[#52635B] font-mono mt-1">Needs verification</div>
        </div>
      </div>

      {/* ===== 3. Analytics Charts Row ===== */}
      {reports.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Parameter Status Distribution */}
          <div className="p-5 rounded-2xl bg-white border border-[#A5BEB0]/60 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[#204D3B]" />
              <h3 className="text-sm font-bold text-[#25292B]">Parameter Status</h3>
            </div>
            <ParameterPieChart
              inRange={totalInRange}
              outOfRange={totalOutOfRange}
              pending={totalPending}
            />
          </div>

          {/* Reports Over Time */}
          <div className="p-5 rounded-2xl bg-white border border-[#A5BEB0]/60 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#204D3B]" />
              <h3 className="text-sm font-bold text-[#25292B]">Reports Timeline</h3>
            </div>
            <ReportsTimelineChart reports={reports} />
          </div>

          {/* Per-Report Parameter Breakdown */}
          <div className="p-5 rounded-2xl bg-white border border-[#A5BEB0]/60 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-[#204D3B]" />
              <h3 className="text-sm font-bold text-[#25292B]">Per-Report Breakdown</h3>
            </div>
            <ReportParameterBarChart reports={reports} />
          </div>
        </div>
      )}

      {/* ===== 4. Reports Needing Verification Alert ===== */}
      {reportsNeedingReview.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <h3 className="text-sm font-bold text-[#25292B]">Action Required: OCR Fields Pending Verification</h3>
            </div>
            <span className="text-[11px] text-amber-800 font-mono font-bold">
              {reportsNeedingReview.length} Report(s)
            </span>
          </div>
          <p className="text-xs text-[#52635B] mb-4">
            LabLens rules block clinical explanations until you verify uncertain values against your printed document.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportsNeedingReview.map((rep) => (
              <div
                key={rep.id}
                className="p-3.5 rounded-xl bg-white border border-[#A5BEB0] flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-[#25292B] truncate max-w-[200px]">{rep.file_name}</div>
                  <div className="text-[11px] text-[#52635B]">
                    Date: {rep.report_date || 'Unspecified'} • Lab: {rep.lab_name || 'Standard'}
                  </div>
                </div>
                <button
                  onClick={() => onSelectReport(rep, 'verify')}
                  className="px-3 py-1.5 rounded-lg bg-[#204D3B] text-white text-xs font-semibold hover:bg-[#204D3B]/90 transition-all cursor-pointer shadow-xs"
                >
                  Verify Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 5. Quick Feature Launchers ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigateTab('chat')}
          className="p-5 rounded-2xl bg-white border border-[#A5BEB0]/60 hover:border-[#204D3B] text-left transition-all group cursor-pointer shadow-xs hover:shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E5EEE6] flex items-center justify-center text-[#204D3B] mb-3 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#25292B] group-hover:text-[#204D3B] transition-colors">
            Ask LabLens Assistant
          </h4>
          <p className="text-[11px] text-[#52635B] mt-1.5 leading-relaxed">
            Evidence-linked explanations of terminology, ranges, and doctor preparation questions.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('visitready')}
          className="p-5 rounded-2xl bg-white border border-[#A5BEB0]/60 hover:border-[#204D3B] text-left transition-all group cursor-pointer shadow-xs hover:shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E5EEE6] flex items-center justify-center text-[#204D3B] mb-3 group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#25292B] group-hover:text-[#204D3B] transition-colors">
            VisitReady™ Doctor Prep
          </h4>
          <p className="text-[11px] text-[#52635B] mt-1.5 leading-relaxed">
            Generate one-page appointment guides from verified report facts.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('comparison')}
          className="p-5 rounded-2xl bg-white border border-[#A5BEB0]/60 hover:border-[#204D3B] text-left transition-all group cursor-pointer shadow-xs hover:shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E5EEE6] flex items-center justify-center text-[#204D3B] mb-3 group-hover:scale-110 transition-transform">
            <GitCompare className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#25292B] group-hover:text-[#204D3B] transition-colors">
            Cross-Lab Comparability
          </h4>
          <p className="text-[11px] text-[#52635B] mt-1.5 leading-relaxed">
            Verify whether tests share valid units and methodologies before trending.
          </p>
        </button>
      </div>

      {/* ===== 6. Reports Table ===== */}
      <div className="rounded-2xl bg-white border border-[#A5BEB0]/60 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#A5BEB0]/50 bg-[#E5EEE6]/50">
          <div>
            <h3 className="text-base font-bold text-[#25292B]">Laboratory Reports</h3>
            <p className="text-xs text-[#52635B]">
              Deterministic classification against printed reference ranges
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#204D3B] bg-[#E5EEE6] border border-[#A5BEB0] px-2.5 py-1 rounded-full">
            {reports.length} Record{reports.length !== 1 ? 's' : ''}
          </span>
        </div>

        {reports.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E5EEE6] border border-[#A5BEB0] flex items-center justify-center text-[#204D3B] mx-auto mb-5 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-[#25292B]">No Laboratory Reports Yet</h4>
            <p className="text-xs text-[#52635B] mt-2 mb-6 leading-relaxed">
              Upload an authentic PDF or scan of your clinical pathology report. LabLens will extract parameters, verify printed reference ranges, and explain findings in plain language.
            </p>
            <div className="flex items-center justify-center">
              <button
                onClick={() => onNavigateTab('upload')}
                className="px-6 py-2.5 rounded-xl bg-[#204D3B] hover:bg-[#204D3B]/90 text-white font-bold text-xs shadow-md hover:scale-105 transition-all cursor-pointer"
              >
                Upload Authentic Lab Report
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#A5BEB0]/40">
            {reports.map((rep) => {
              const inRange = rep.parameters?.filter((p) => p.classification_status === 'In Range').length || 0;
              const outOfRange = rep.parameters?.filter(
                (p) => p.classification_status === 'Below Range' || p.classification_status === 'Above Range'
              ).length || 0;
              const pending = rep.parameters?.filter(
                (p) => p.classification_status === 'Needs Verification' || p.classification_status === 'Unable to Classify'
              ).length || 0;
              const total = inRange + outOfRange + pending;
              const pct = total > 0 ? Math.round((inRange / total) * 100) : 0;

              return (
                <div
                  key={rep.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#E5EEE6]/50 transition-colors"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#E5EEE6] border border-[#A5BEB0] flex items-center justify-center text-[#204D3B] shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#25292B] truncate">{rep.file_name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                          rep.privacy_mode === 'private_history'
                            ? 'bg-[#E5EEE6] text-[#204D3B] border-[#A5BEB0]'
                            : 'bg-white text-[#52635B] border-[#A5BEB0]'
                        }`}>
                          {rep.privacy_mode === 'private_history' ? '🔒 Private' : '⏱ Session'}
                        </span>
                      </div>
                      <div className="text-xs text-[#52635B] mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span>{rep.report_date || 'No date'}</span>
                        <span className="text-[#A5BEB0]">•</span>
                        <span>{rep.lab_name || 'Standard Lab'}</span>
                        <span className="text-[#A5BEB0]">•</span>
                        <span>{(rep.file_size_bytes / 1024).toFixed(0)} KB</span>
                      </div>
                      {/* Progress bar */}
                      {total > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-[#E5EEE6] overflow-hidden max-w-xs border border-[#A5BEB0]/40">
                            <div
                              className="h-full rounded-full bg-[#204D3B] transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[#204D3B] font-mono font-bold">{pct}% in range</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Classification Badges */}
                  <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
                    {inRange > 0 && (
                      <span className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold">
                        {inRange}✓
                      </span>
                    )}
                    {outOfRange > 0 && (
                      <span className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 font-bold">
                        {outOfRange}⚠
                      </span>
                    )}
                    {pending > 0 && (
                      <span className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-300 text-blue-800 font-bold">
                        {pending}?
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onSelectReport(rep, 'verify')}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#E5EEE6] text-[#25292B] text-xs font-semibold border border-[#A5BEB0] transition-colors cursor-pointer"
                    >
                      Verify OCR
                    </button>
                    <button
                      onClick={() => onSelectReport(rep, 'results')}
                      className="px-3 py-1.5 rounded-lg bg-[#204D3B] hover:bg-[#204D3B]/90 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      Results
                    </button>
                    <button
                      onClick={() => onDownloadPdf(rep.id)}
                      className="p-1.5 rounded-lg text-[#52635B] hover:text-[#204D3B] hover:bg-[#E5EEE6] transition-colors cursor-pointer"
                      title="Download Doctor PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenShareModal(rep)}
                      className="p-1.5 rounded-lg text-[#52635B] hover:text-[#204D3B] hover:bg-[#E5EEE6] transition-colors cursor-pointer"
                      title="Share with Doctor"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteReport(rep.id)}
                      className="p-1.5 rounded-lg text-[#52635B] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== 7. Safety Notice ===== */}
      <div className="p-4 rounded-xl bg-white border border-[#A5BEB0]/60 text-xs text-[#52635B] flex items-start gap-3 shadow-xs">
        <Info className="w-4 h-4 text-[#204D3B] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-[#25292B]">Platform Capabilities & Safety Doctrine: </span>
          LabLens is an educational comprehension platform — it extracts parameters, enables side-by-side OCR verification, and deterministically classifies values against printed reference intervals. AI provides educational definitions from MedlinePlus. LabLens does not diagnose diseases or prescribe medication.
        </div>
      </div>

      {/* ===== Upload Modal ===== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0A1827] border border-[#22D3EE]/30 p-6 shadow-[0_0_60px_rgba(34,211,238,0.1)] relative">
            {/* Modal glow */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#22D3EE]/80 to-transparent" />

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#22D3EE]" />
                Upload Laboratory Report
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-lg text-[#9DB2C3] hover:text-white hover:bg-[#10283A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Privacy Mode Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#9DB2C3] mb-2">Storage Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrivacyMode('private_history')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    privacyMode === 'private_history'
                      ? 'bg-[#14B8A6]/15 border-[#14B8A6] text-[#22D3EE]'
                      : 'bg-[#061827] border-[#19394A] text-[#9DB2C3] hover:border-[#19394A]/60'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-0.5">
                    <Shield className="w-3.5 h-3.5" /> Private History
                  </div>
                  <span className="text-[10px] opacity-80">Encrypted & consent-stored</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacyMode('temporary_session')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    privacyMode === 'temporary_session'
                      ? 'bg-[#14B8A6]/15 border-[#14B8A6] text-[#22D3EE]'
                      : 'bg-[#061827] border-[#19394A] text-[#9DB2C3] hover:border-[#19394A]/60'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-0.5">
                    <Clock className="w-3.5 h-3.5" /> Temporary Session
                  </div>
                  <span className="text-[10px] opacity-80">Cleared after session ends</span>
                </button>
              </div>
            </div>

            {/* Optional Metadata */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-medium text-[#9DB2C3] mb-1">Lab / Clinic Name</label>
                <input
                  type="text"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="e.g. Dr. Lal PathLabs"
                  className="w-full px-3 py-2 rounded-xl bg-[#061827] border border-[#19394A] focus:border-[#22D3EE] text-white text-xs focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#9DB2C3] mb-1">Collection Date</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#061827] border border-[#19394A] focus:border-[#22D3EE] text-white text-xs focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
              className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#22D3EE] bg-[#22D3EE]/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]'
                  : 'border-[#19394A] hover:border-[#22D3EE]/50 bg-[#061827]'
              }`}
            >
              <input
                type="file"
                id="file-upload-input"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <label htmlFor="file-upload-input" className="cursor-pointer">
                <UploadCloud className={`w-10 h-10 mx-auto mb-3 transition-transform ${dragActive ? 'scale-110 text-[#22D3EE]' : 'text-[#19394A]'}`} />
                <span className="text-sm font-bold text-white block">
                  {dragActive ? 'Drop your report here!' : 'Click to select or drag & drop'}
                </span>
                <span className="text-[11px] text-[#9DB2C3] mt-1 block">
                  PDF, JPG, JPEG, PNG • Max 15MB
                </span>
              </label>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9DB2C3] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  CalendarCheck,
  Stethoscope,
  HelpCircle,
  Download,
  Share2,
  FileText,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { Report } from '../../types';

interface VisitReadyViewProps {
  reports: Report[];
  activeReport: Report | null;
  onSelectReport: (report: Report) => void;
  onOpenModal: () => void;
  onDownloadPdf: (reportId?: string) => void;
}

export const VisitReadyView: React.FC<VisitReadyViewProps> = ({
  reports,
  activeReport,
  onSelectReport,
  onOpenModal,
  onDownloadPdf,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(
    activeReport?.id || (reports.length > 0 ? reports[0].id : '')
  );

  const currentReport = reports.find((r) => r.id === selectedReportId) || activeReport || reports[0];

  const outOfRangeParams = currentReport?.parameters?.filter(
    (p) => p.classification_status === 'Below Range' || p.classification_status === 'Above Range'
  ) || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[#A5BEB0]/60 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E5EEE6] border border-[#A5BEB0] text-[#204D3B] text-[11px] font-mono mb-2 font-bold">
              <CalendarCheck className="w-3.5 h-3.5 text-[#204D3B]" />
              CLINICAL APPOINTMENT READINESS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25292B] tracking-tight">
              VisitReady™ Doctor Discussion Prep
            </h1>
            <p className="text-xs sm:text-sm text-[#52635B] mt-1 max-w-2xl leading-relaxed">
              Transform raw laboratory values into structured clinical questions, consultation summaries, and discussion points designed specifically for your doctor’s appointment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenModal}
              disabled={!currentReport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#204D3B] hover:bg-[#204D3B]/90 text-white font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Interactive Builder</span>
            </button>
            {currentReport && (
              <button
                onClick={() => onDownloadPdf(currentReport.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#E5EEE6] text-[#25292B] font-semibold text-xs border border-[#A5BEB0] transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#204D3B]" />
                <span>Download Prep PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report Selector if multiple reports */}
      {reports.length > 1 && (
        <div className="p-4 rounded-xl bg-white border border-[#A5BEB0]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <span className="text-xs text-[#52635B] font-semibold">Select Report for Consultation Prep:</span>
          <select
            value={currentReport?.id || ''}
            onChange={(e) => {
              setSelectedReportId(e.target.value);
              const rep = reports.find((r) => r.id === e.target.value);
              if (rep) onSelectReport(rep);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#A5BEB0] text-[#25292B] text-xs focus:outline-none focus:border-[#204D3B]"
          >
            {reports.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.file_name} ({rep.report_date || 'No Date'})
              </option>
            ))}
          </select>
        </div>
      )}

      {!currentReport ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#A5BEB0]/60 shadow-xs">
          <FileText className="w-12 h-12 text-[#A5BEB0] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#25292B]">No Report Selected</h3>
          <p className="text-xs text-[#52635B] mt-1">Upload a lab report first to generate appointment questions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Quick Snapshot */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-[#A5BEB0]/60 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#25292B] font-mono mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#204D3B]" />
                Report Snapshot
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#A5BEB0]/30">
                  <span className="text-[#52635B]">File Name</span>
                  <span className="text-[#25292B] font-semibold truncate max-w-[140px]">{currentReport.file_name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#A5BEB0]/30">
                  <span className="text-[#52635B]">Lab Provider</span>
                  <span className="text-[#25292B] font-semibold">{currentReport.lab_name || 'Standard Lab'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#A5BEB0]/30">
                  <span className="text-[#52635B]">Collection Date</span>
                  <span className="text-[#25292B] font-semibold">{currentReport.report_date || 'Unspecified'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#A5BEB0]/30">
                  <span className="text-[#52635B]">Analytes Tested</span>
                  <span className="text-[#204D3B] font-bold font-mono">{currentReport.parameters?.length || 0}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#52635B]">Outside Range</span>
                  <span className="text-amber-800 font-bold font-mono">{outOfRangeParams.length}</span>
                </div>
              </div>
            </div>

            {/* Checklist Before Your Appointment */}
            <div className="p-5 rounded-2xl bg-white border border-[#A5BEB0]/60 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#25292B] font-mono mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#204D3B]" />
                Pre-Appointment Checklist
              </h3>
              <div className="space-y-2 text-xs text-[#52635B]">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-0.5 rounded border-[#A5BEB0] text-[#204D3B] focus:ring-0" />
                  <span>Bring original physical printed lab report</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-0.5 rounded border-[#A5BEB0] text-[#204D3B] focus:ring-0" />
                  <span>List current supplements and prescriptions</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 rounded border-[#A5BEB0] text-[#204D3B] focus:ring-0" />
                  <span>Note recent changes in sleep, diet, or fatigue</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 rounded border-[#A5BEB0] text-[#204D3B] focus:ring-0" />
                  <span>Record whether fasting was observed prior to collection</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Suggested Clinical Questions & Topics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Out-of-Range Priority Focus */}
            <div className="p-6 rounded-2xl bg-white border border-[#A5BEB0]/60 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#25292B] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Priority Findings for Discussion ({outOfRangeParams.length})
                </h3>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 font-bold">
                  Needs Physician Context
                </span>
              </div>

              {outOfRangeParams.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>All extracted parameters fall within printed reference intervals. Discuss maintenance and regular screening.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {outOfRangeParams.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#25292B]">{p.test_name}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 font-bold">
                          {p.numeric_value ?? p.raw_value} {p.unit} ({p.classification_status})
                        </span>
                      </div>
                      <p className="text-[11px] text-[#52635B]">
                        Printed Reference Range: <span className="font-mono text-[#25292B] font-bold">{p.range_low ?? '?'} – {p.range_high ?? '?'} {p.unit}</span>
                      </p>
                      <div className="p-2.5 rounded-lg bg-white border border-[#A5BEB0]/60 text-xs">
                        <span className="text-[#204D3B] font-semibold">Suggested Question for Doctor:</span>
                        <p className="text-[#25292B] mt-0.5 italic">
                          "My {p.test_name} measured at {p.numeric_value ?? p.raw_value} {p.unit}. Could this be related to my hydration, recent diet, or should we schedule a follow-up test in a few weeks?"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Standard Consultation Questions */}
            <div className="p-6 rounded-2xl bg-white border border-[#A5BEB0]/60 shadow-xs">
              <h3 className="text-sm font-bold text-[#25292B] flex items-center gap-2 mb-4">
                <HelpCircle className="w-4 h-4 text-[#204D3B]" />
                Top 4 Questions to Ask at Your Appointment
              </h3>
              <div className="space-y-3">
                {[
                  {
                    q: "Do any of my results warrant confirmatory testing or repeat bloodwork?",
                    why: "Single measurements can fluctuate temporarily due to diurnal rhythm, fasting variations, or laboratory calibration."
                  },
                  {
                    q: "How do these results fit with my previous historical lab results?",
                    why: "Personal baseline trajectories are frequently more informative than universal reference intervals."
                  },
                  {
                    q: "Are any dietary or lifestyle adjustments recommended before re-testing?",
                    why: "Nutrition, hydration, sleep, and physical exertion directly influence metabolic and lipid panels."
                  },
                  {
                    q: "Should we perform any related panel to correlate these findings?",
                    why: "Biomarkers often interact (e.g. Ferritin with Hemoglobin, HbA1c with Fasting Glucose)."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/60 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#204D3B] text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#25292B]">{item.q}</span>
                    </div>
                    <p className="text-[11px] text-[#52635B] pl-7">{item.why}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { ShieldCheck, Stethoscope, FileText, ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import { Report } from '../../types';

interface DoctorPortalProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  onDownloadPdf: (reportId: string) => void;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({
  reports,
  onSelectReport,
  onDownloadPdf,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Clinician Portal</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Access strictly scoped to patient-authorized laboratory summaries. Deny-by-default RBAC enforced.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Active Patient Consent Required</span>
        </div>
      </div>

      {/* Shared Reports Cards */}
      {reports.length === 0 ? (
        <div className="text-center py-24 glass-panel rounded-3xl border border-white/5 space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Shared Reports Available</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Patients can explicitly share their verified laboratory reports with your email address (<span className="text-cyan-300 font-mono">doctor@lablens.com</span>). Once revoked by the patient, access is immediately terminated.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    Consent Active
                  </span>
                  <span className="text-xs text-slate-400">{report.report_date || '2026-03-01'}</span>
                </div>
                <h4 className="text-base font-bold text-white">{report.file_name}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Lab: {report.lab_name || 'Metropolis Labs'}
                </p>
                <div className="mt-3 text-xs text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{report.parameters?.length || 0} Deterministically Classified Analytes</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                <button
                  onClick={() => onSelectReport(report)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs transition-all shadow-glow-emerald"
                >
                  <span>Review Clinical Data</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDownloadPdf(report.id)}
                  title="Download Doctor Summary PDF"
                  className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

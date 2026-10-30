import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Search,
  Database,
  Cpu,
  Hash
} from 'lucide-react';
import { Report, ReportParameter } from '../../types';

interface TrustTraceViewProps {
  reports: Report[];
  activeReport: Report | null;
  onSelectParamTrace: (param: ReportParameter) => void;
}

export const TrustTraceView: React.FC<TrustTraceViewProps> = ({
  reports,
  activeReport,
  onSelectParamTrace,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(
    activeReport?.id || (reports.length > 0 ? reports[0].id : '')
  );
  const [searchFilter, setSearchFilter] = useState('');

  const currentReport = reports.find((r) => r.id === selectedReportId) || activeReport || reports[0];

  const parameters = currentReport?.parameters || [];
  const filteredParams = parameters.filter((p) =>
    p.test_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (p.canonical_code && p.canonical_code.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[#A5BEB0]/60 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E5EEE6] border border-[#A5BEB0] text-[#204D3B] text-[11px] font-mono mb-2 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#204D3B]" />
              CRYPTOGRAPHIC DATA LINEAGE & CLINICAL GROUNDING
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25292B] tracking-tight">
              TrustTrace™ Lineage Explorer
            </h1>
            <p className="text-xs sm:text-sm text-[#52635B] mt-1 max-w-2xl leading-relaxed">
              Inspect the end-to-end provenance of every extracted parameter — from original image coordinates and SHA-256 hashes to deterministic range verification and peer-reviewed medical citations.
            </p>
          </div>
        </div>
      </div>

      {/* 5-Step Provenance Architecture Pipeline */}
      <div className="p-6 rounded-2xl bg-white border border-[#A5BEB0]/60 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#25292B] font-mono mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#204D3B]" />
          Deterministic Lineage Pipeline
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { step: '01', title: 'File Receipt', desc: 'SHA-256 payload checksum logged at intake' },
            { step: '02', title: 'OCR Bounding', desc: 'Direct pixel coordinates linked to source PDF' },
            { step: '03', title: 'Rules Extraction', desc: 'Deterministic parser extracts numerical token' },
            { step: '04', title: 'Interval Check', desc: 'Rigid numerical boundary test against printed ranges' },
            { step: '05', title: 'MedlinePlus Hub', desc: 'Authoritative NIH citation attached for context' },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/60 relative">
              <span className="text-[10px] font-mono font-bold text-[#204D3B] block mb-1">
                STEP {item.step}
              </span>
              <div className="text-xs font-bold text-[#25292B] mb-1">{item.title}</div>
              <p className="text-[10px] text-[#52635B] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Report Selector & Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#A5BEB0]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        {reports.length > 1 && (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-[#52635B] whitespace-nowrap font-semibold">Report:</span>
            <select
              value={currentReport?.id || ''}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#A5BEB0] text-[#25292B] text-xs focus:outline-none focus:border-[#204D3B] w-full max-w-xs"
            >
              {reports.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  {rep.file_name} ({rep.report_date || 'No Date'})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52635B]" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search parameter for provenance..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#A5BEB0] text-[#25292B] text-xs placeholder:text-[#52635B]/50 focus:outline-none focus:border-[#204D3B]"
          />
        </div>
      </div>

      {/* Parameter Lineage Table */}
      {!currentReport ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#A5BEB0]/60 shadow-xs">
          <ShieldCheck className="w-12 h-12 text-[#A5BEB0] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#25292B]">No Reports Available</h3>
          <p className="text-xs text-[#52635B] mt-1">Upload a lab report to inspect cryptographic lineage.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-[#A5BEB0]/60 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-[#A5BEB0]/50 flex items-center justify-between bg-[#E5EEE6]/50">
            <div>
              <h3 className="text-sm font-bold text-[#25292B]">Extracted Analytes & Lineage Records</h3>
              <p className="text-[11px] text-[#52635B]">Click any row to open full deep-inspection modal</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#204D3B] bg-[#E5EEE6] border border-[#A5BEB0] px-2.5 py-0.5 rounded-full">
              {filteredParams.length} Analytes
            </span>
          </div>

          <div className="divide-y divide-[#A5BEB0]/40">
            {filteredParams.map((param) => {
              return (
                <div
                  key={param.id}
                  onClick={() => onSelectParamTrace(param)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#E5EEE6]/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#E5EEE6] border border-[#A5BEB0] flex items-center justify-center text-[#204D3B] group-hover:border-[#204D3B] transition-colors shrink-0">
                      <Hash className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#25292B] group-hover:text-[#204D3B] transition-colors truncate">
                          {param.test_name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E5EEE6] text-[#204D3B] border border-[#A5BEB0]">
                          {param.canonical_code || 'ANALYTE'}
                        </span>
                      </div>
                      <div className="text-xs text-[#52635B] mt-0.5 flex flex-wrap items-center gap-x-3">
                        <span>Extracted: <strong className="text-[#25292B] font-mono">{param.numeric_value ?? param.raw_value ?? '?'} {param.unit}</strong></span>
                        <span className="text-[#A5BEB0]">•</span>
                        <span>Ref Range: <span className="text-[#25292B] font-mono">{param.range_low ?? '?'} – {param.range_high ?? '?'} {param.unit}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        param.classification_status === 'In Range'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : param.classification_status === 'Below Range' || param.classification_status === 'Above Range'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-blue-50 text-blue-800 border-blue-300'
                      }`}>
                        {param.classification_status}
                      </span>
                      <div className="text-[10px] text-[#52635B] font-mono mt-0.5">Confidence: {param.ocr_confidence ? `${Math.round(param.ocr_confidence * 100)}%` : '98%'}</div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-white group-hover:bg-[#204D3B] group-hover:text-white text-[#204D3B] text-xs font-semibold border border-[#A5BEB0] group-hover:border-[#204D3B] transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <span>View Lineage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { X, Radar, CheckCircle2, AlertTriangle, AlertCircle, Info, FileCheck } from 'lucide-react';
import { QualityRadarData } from '../../types';

interface QualityRadarModalProps {
  data: QualityRadarData | null;
  onClose: () => void;
}

export const QualityRadarModal: React.FC<QualityRadarModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  const scorePct = Math.round(data.readability_score * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white border border-[#A5BEB0] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#A5BEB0]/40 bg-[#E5EEE6]/50">
          <div>
            <div className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-[#204D3B]" />
              <h3 className="text-lg font-bold text-[#25292B]">Report Quality Radar™</h3>
            </div>
            <p className="text-xs text-[#52635B] mt-0.5">
              Document Readability, Extraction Completeness & OCR Readiness
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#52635B] hover:text-[#25292B] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Readability Scorecard */}
          <div className="p-5 rounded-2xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/60 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#52635B] font-semibold block mb-1">Extraction Readiness Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#25292B] font-mono">{scorePct}%</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    data.status === 'Readable'
                      ? 'bg-[#204D3B]/10 border-[#204D3B]/30 text-[#204D3B]'
                      : data.status === 'Needs Review'
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-rose-100 border-rose-300 text-rose-800'
                  }`}
                >
                  Status: {data.status}
                </span>
              </div>
              <p className="text-xs text-[#52635B] mt-2 font-medium">{data.summary_message}</p>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={scorePct >= 80 ? 'text-[#204D3B]' : scorePct >= 50 ? 'text-amber-500' : 'text-rose-500'}
                  strokeDasharray={`${scorePct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <FileCheck className="w-6 h-6 text-[#204D3B] absolute" />
            </div>
          </div>

          {/* Important Notice */}
          <div className="p-3.5 rounded-xl bg-[#E5EEE6]/40 border border-[#A5BEB0]/50 text-[11px] text-[#52635B] leading-relaxed">
            <span className="font-bold text-[#25292B]">Important Technical Scope:</span> The Report Quality Radar measures document scan legibility, missing units, ambiguous decimals, and OCR extraction fidelity. It explicitly DOES NOT measure clinical patient health or disease risk.
          </div>

          {/* Specific Findings List */}
          <div>
            <h4 className="text-xs font-bold text-[#25292B] uppercase tracking-wider mb-3 font-mono">
              Evaluated Heuristic Checks ({data.findings?.length || 0})
            </h4>

            {data.findings?.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#204D3B]/10 border border-[#204D3B]/20 text-[#204D3B] text-xs flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>All checks passed! Document format and parameters are fully verified.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {data.findings.map((f, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white border border-[#A5BEB0]/60 shadow-xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-[#25292B]">
                        {f.severity === 'critical' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                        ) : f.severity === 'warning' ? (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Info className="w-4 h-4 text-[#204D3B]" />
                        )}
                        <span>{f.check.replace(/_/g, ' ')}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          f.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : f.severity === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-[#204D3B]/10 text-[#204D3B]'
                        }`}
                      >
                        {f.severity}
                      </span>
                    </div>

                    <p className="text-[#52635B] text-xs">{f.message}</p>

                    <div className="p-2 rounded-lg bg-[#E5EEE6]/50 border border-[#A5BEB0]/40 text-[11px] text-[#25292B] flex items-start gap-1.5">
                      <span className="font-bold text-[#204D3B] shrink-0">Remedy:</span>
                      <span>{f.remediation}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

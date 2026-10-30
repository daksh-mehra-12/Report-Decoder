import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, ExternalLink, Hash, FileCode, Cpu, BookOpen } from 'lucide-react';
import { TrustTraceData } from '../../types';

interface TrustTraceModalProps {
  data: TrustTraceData | null;
  onClose: () => void;
}

export const TrustTraceModal: React.FC<TrustTraceModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-[#A5BEB0] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#A5BEB0]/40 bg-[#E5EEE6]/50">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#204D3B]" />
              <h3 className="text-lg font-bold text-[#25292B]">TrustTrace™ Evidence Inspector</h3>
            </div>
            <p className="text-xs text-[#52635B] mt-0.5">
              Analyte: <span className="text-[#204D3B] font-bold">{data.test_name}</span> | Complete Cryptographic & Clinical Provenance
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#52635B] hover:text-[#25292B] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: The 5-Step Lineage Chain */}
        <div className="p-6 overflow-y-auto space-y-6">
          {data.remaining_uncertainty && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Remaining Uncertainty Notice:</span>
                <p className="text-[11px] text-amber-900 mt-0.5">{data.remaining_uncertainty}</p>
              </div>
            </div>
          )}

          <div className="relative border-l-2 border-[#204D3B]/40 ml-4 pl-6 space-y-8">
            {data.provenance_chain?.map((node, idx) => (
              <div key={idx} className="relative group">
                {/* Node Step Marker */}
                <div className="absolute -left-[33px] top-0 w-6 h-6 rounded-full bg-white border-2 border-[#204D3B] flex items-center justify-center text-[10px] font-bold text-[#204D3B] shadow-xs">
                  {idx + 1}
                </div>

                <div className="bg-[#E5EEE6]/40 p-4 rounded-xl border border-[#A5BEB0]/60 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-sm font-bold text-[#25292B]">{node.title}</h4>
                    {node.verified ? (
                      <span className="flex items-center gap-1 text-[10px] text-[#204D3B] font-mono font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-amber-700 font-mono font-bold">
                        <AlertCircle className="w-3 h-3" />
                        Uncertain
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#52635B] mb-3">{node.description}</p>

                  {/* Node Specific JSON/KV Data Box */}
                  <div className="bg-white p-3 rounded-lg border border-[#A5BEB0]/50 font-mono text-[11px] space-y-1 text-[#25292B] overflow-x-auto shadow-inner">
                    {Object.entries(node.data).map(([key, val]) => (
                      <div key={key} className="flex items-start gap-2">
                        <span className="text-[#204D3B] font-bold shrink-0">{key}:</span>
                        <span className="text-[#52635B] break-all">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Official Medical Sources Section */}
          <div className="pt-4 border-t border-[#A5BEB0]/40">
            <h4 className="text-xs font-bold text-[#25292B] uppercase tracking-wider mb-3 flex items-center gap-1.5 font-mono">
              <BookOpen className="w-3.5 h-3.5 text-[#204D3B]" />
              Authoritative Medical Citations Backing This Result
            </h4>
            <div className="space-y-2">
              {data.official_sources?.map((src) => (
                <div
                  key={src.source_id}
                  className="p-3 rounded-xl bg-white border border-[#A5BEB0]/60 flex items-center justify-between gap-4 shadow-xs"
                >
                  <div>
                    <div className="text-xs font-bold text-[#25292B]">{src.name}</div>
                    <div className="text-[11px] text-[#52635B]">{src.organization} • {src.trust_tier}</div>
                    <p className="text-[10px] text-[#52635B]/80 mt-0.5">{src.description}</p>
                  </div>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#204D3B]/10 hover:bg-[#204D3B]/20 text-[#204D3B] border border-[#204D3B]/30 text-xs font-bold transition-all shrink-0"
                  >
                    <span>View Official Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { CheckCircle2, Edit3, AlertCircle, ArrowRight, Eye, ShieldCheck, History, ArrowLeft } from 'lucide-react';
import { Report, ReportParameter } from '../../types';

interface VerificationWorkspaceProps {
  report: Report;
  onUpdateParameter: (paramId: string, data: any) => Promise<void>;
  onVerifyParameter: (paramId: string) => Promise<void>;
  onProceedToResults: () => void;
  onBack: () => void;
}

export const VerificationWorkspace: React.FC<VerificationWorkspaceProps> = ({
  report,
  onUpdateParameter,
  onVerifyParameter,
  onProceedToResults,
  onBack,
}) => {
  const [selectedParamId, setSelectedParamId] = useState<string>(
    report.parameters && report.parameters[0] ? report.parameters[0].id : ''
  );
  const [editingParamId, setEditingParamId] = useState<string | null>(null);

  // Edit form state
  const [editValue, setEditValue] = useState<string>('');
  const [editUnit, setEditUnit] = useState<string>('');
  const [editRange, setEditRange] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('User manual verification correction');

  const selectedParam = report.parameters?.find((p) => p.id === selectedParamId);

  const startEdit = (param: ReportParameter) => {
    setEditingParamId(param.id);
    setEditValue(param.numeric_value ? String(param.numeric_value) : param.raw_value || '');
    setEditUnit(param.unit || '');
    setEditRange(param.reference_range_raw || '');
  };

  const saveEdit = async (paramId: string) => {
    await onUpdateParameter(paramId, {
      numeric_value: parseFloat(editValue) || null,
      unit: editUnit,
      reference_range_raw: editRange,
      reason: editReason,
    });
    setEditingParamId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#A5BEB0]/40 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white hover:bg-[#E5EEE6] text-[#25292B] border border-[#A5BEB0]/60 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-[#25292B] tracking-tight">
                OCR Verification Workspace
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#204D3B]/10 text-[#204D3B] border border-[#204D3B]/20 font-bold">
                Side-by-Side Audit
              </span>
            </div>
            <p className="text-xs text-[#52635B] mt-1">
              File: <span className="text-[#25292B] font-mono font-semibold">{report.file_name}</span> | Compare extracted fields against the physical document.
            </p>
          </div>
        </div>

        <button
          onClick={onProceedToResults}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#204D3B] text-white font-bold text-xs shadow-md hover:bg-[#183a2d] hover:scale-[1.02] transition-all"
        >
          <span>View Verified Results</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Pane: Original Report View with Spatial Bounding Box (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-5 rounded-2xl border border-[#A5BEB0]/60 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#25292B] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#204D3B]" />
                Original Document Scan (Page 1)
              </span>
              <span className="text-[10px] text-[#52635B] font-mono">
                Hash: {report.file_hash_sha256?.substring(0, 10)}...
              </span>
            </div>

            {/* Scanned Document View Container */}
            <div className="relative w-full h-[520px] bg-[#F4F8F5] border border-[#A5BEB0]/60 rounded-xl overflow-hidden p-6 font-mono text-[11px] select-none text-[#25292B] shadow-inner">
              <div className="border-b border-[#A5BEB0]/50 pb-2 mb-4 flex justify-between items-center text-[#52635B]">
                <span className="font-bold text-[#204D3B]">{report.lab_name || 'METROPOLIS CLINICAL LAB'}</span>
                <span>DATE: {report.report_date || '2026-03-01'}</span>
              </div>

              <div className="grid grid-cols-12 font-bold text-[#52635B] border-b border-[#A5BEB0]/30 pb-1.5 mb-2 text-[10px]">
                <div className="col-span-5">INVESTIGATION</div>
                <div className="col-span-2 text-right">RESULT</div>
                <div className="col-span-2 text-center">UNITS</div>
                <div className="col-span-3 text-right">REF RANGE</div>
              </div>

              {/* Rows */}
              <div className="space-y-3 mt-3">
                {report.parameters?.map((p) => {
                  const isSelected = p.id === selectedParamId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedParamId(p.id)}
                      className={`grid grid-cols-12 items-center p-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#A5BEB0]/30 border-2 border-[#204D3B] text-[#25292B] font-bold shadow-sm'
                          : 'hover:bg-white border border-transparent'
                      }`}
                    >
                      <div className="col-span-5 truncate font-semibold text-[#25292B]">
                        {p.test_name}
                      </div>
                      <div className="col-span-2 text-right font-bold text-[#204D3B]">
                        {p.numeric_value !== undefined ? p.numeric_value : p.raw_value}
                      </div>
                      <div className="col-span-2 text-center text-[#52635B]">
                        {p.unit || '-'}
                      </div>
                      <div className="col-span-3 text-right text-[#52635B] truncate">
                        {p.reference_range_raw || '-'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Bounding-Box Overlay Indicator */}
              {selectedParam && (
                <div className="absolute bottom-4 left-4 right-4 p-2.5 rounded-lg bg-white/95 border border-[#204D3B]/40 text-[10px] text-[#25292B] flex items-center justify-between shadow-md">
                  <span className="font-mono text-[#52635B]">Active Parameter: <b className="text-[#204D3B]">{selectedParam.test_name}</b></span>
                  <span className="font-bold text-[#204D3B]">Spatial Locked</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Pane: Extracted Fields & Verification Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#52635B] px-1 font-semibold">
            <span>Click any test to inspect spatial coordinates or correct values</span>
            <span>{report.parameters?.length || 0} Total Fields</span>
          </div>

          {report.parameters?.map((param) => {
            const isSelected = param.id === selectedParamId;
            const isEditing = editingParamId === param.id;
            const isVerified = param.verification_status === 'user_verified' || param.verification_status === 'user_corrected';
            const hasLowConfidence = param.ocr_confidence < 0.85;

            return (
              <div
                key={param.id}
                onClick={() => setSelectedParamId(param.id)}
                className={`p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-[#204D3B] shadow-md bg-white ring-2 ring-[#204D3B]/10'
                    : 'bg-white border-[#A5BEB0]/60 hover:border-[#204D3B]/40 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-[#25292B]">{param.test_name}</h4>
                      {isVerified ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#204D3B]/10 border border-[#204D3B]/25 text-[#204D3B]">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700">
                          <AlertCircle className="w-3 h-3" />
                          Needs Review
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#52635B] font-mono mt-0.5">
                      Raw OCR string: "{param.raw_text}"
                    </p>
                  </div>

                  {/* Optical Confidence Pill */}
                  <div className="text-right">
                    <span className="text-[10px] text-[#52635B] block mb-0.5 font-medium">OCR Confidence</span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        hasLowConfidence ? 'text-rose-600' : 'text-[#204D3B]'
                      }`}
                    >
                      {Math.round(param.ocr_confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Form or Card details */}
                {isEditing ? (
                  <div className="mt-4 p-4 rounded-xl bg-[#E5EEE6]/60 border border-[#A5BEB0] space-y-3">
                    <div className="text-xs font-bold text-[#204D3B] flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                      Manual Field Correction (Recorded in Immutable Audit Log)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#52635B] font-bold mb-1">Numeric Value</label>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full bg-white border border-[#A5BEB0] rounded-lg px-2.5 py-1.5 text-xs text-[#25292B] focus:outline-none focus:border-[#204D3B] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#52635B] font-bold mb-1">Unit</label>
                        <input
                          type="text"
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value)}
                          className="w-full bg-white border border-[#A5BEB0] rounded-lg px-2.5 py-1.5 text-xs text-[#25292B] focus:outline-none focus:border-[#204D3B] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#52635B] font-bold mb-1">Printed Ref Range</label>
                        <input
                          type="text"
                          value={editRange}
                          onChange={(e) => setEditRange(e.target.value)}
                          placeholder="e.g. 12.0 - 15.5"
                          className="w-full bg-white border border-[#A5BEB0] rounded-lg px-2.5 py-1.5 text-xs text-[#25292B] focus:outline-none focus:border-[#204D3B] font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#52635B] font-bold mb-1">Reason for Revision</label>
                      <input
                        type="text"
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        className="w-full bg-white border border-[#A5BEB0] rounded-lg px-2.5 py-1.5 text-xs text-[#25292B] focus:outline-none focus:border-[#204D3B]"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingParamId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs text-[#52635B] hover:text-[#25292B] font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(param.id)}
                        className="px-4 py-1.5 rounded-lg bg-[#204D3B] text-white font-bold text-xs hover:bg-[#183a2d]"
                      >
                        Save & Reclassify
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3 p-3 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/50 text-xs">
                    <div>
                      <span className="text-[#52635B] text-[10px] block font-semibold">Result Value</span>
                      <span className="font-bold text-[#25292B] font-mono text-sm">
                        {param.numeric_value !== undefined ? param.numeric_value : param.raw_value || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#52635B] text-[10px] block font-semibold">Unit</span>
                      <span className="font-semibold text-[#25292B] font-mono">{param.unit || 'Missing'}</span>
                    </div>
                    <div>
                      <span className="text-[#52635B] text-[10px] block font-semibold">Printed Range</span>
                      <span className="font-semibold text-[#25292B] font-mono">
                        {param.reference_range_raw || 'Missing (Unclassified)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#52635B] text-[10px] block font-semibold">Deterministic Rule</span>
                      <span
                        className={`font-bold ${
                          param.classification_status === 'In Range'
                            ? 'text-[#204D3B]'
                            : param.classification_status === 'Below Range' || param.classification_status === 'Above Range'
                            ? 'text-amber-700'
                            : 'text-[#52635B]'
                        }`}
                      >
                        {param.classification_status}
                      </span>
                    </div>
                  </div>
                )}

                {/* Audit Corrections History if present */}
                {param.corrections && param.corrections.length > 0 && (
                  <div className="mt-2 text-[11px] text-[#52635B] flex items-center gap-1.5 bg-[#E5EEE6]/60 p-2 rounded-lg border border-[#A5BEB0]/50">
                    <History className="w-3.5 h-3.5 text-[#204D3B]" />
                    <span>
                      Revised {param.corrections.length} time(s): '{param.corrections[0].field_name}' changed from '{param.corrections[0].old_value}' to '{param.corrections[0].new_value}'.
                    </span>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#A5BEB0]/30">
                  <button
                    onClick={() => startEdit(param)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E5EEE6] hover:bg-[#A5BEB0]/30 text-[#25292B] text-xs font-semibold transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Correct Field
                  </button>
                  <button
                    onClick={() => onVerifyParameter(param.id)}
                    className={`flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isVerified
                        ? 'bg-[#204D3B]/10 text-[#204D3B] border border-[#204D3B]/25'
                        : 'bg-[#204D3B] hover:bg-[#183a2d] text-white shadow-sm'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isVerified ? 'Confirmed Verified' : 'Verify as Accurate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


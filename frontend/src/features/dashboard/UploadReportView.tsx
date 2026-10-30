import React, { useState } from 'react';
import {
  UploadCloud,
  Shield,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

interface UploadReportViewProps {
  onUploadFile: (file: File, privacyMode: string, labName?: string, reportDate?: string) => Promise<void>;
  onLoadSyntheticDemo: (isImperfect: boolean) => void;
  loading: boolean;
  reportsCount: number;
}

export const UploadReportView: React.FC<UploadReportViewProps> = ({
  onUploadFile,
  loading,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [privacyMode, setPrivacyMode] = useState<'private_history' | 'temporary_session'>('private_history');
  const [labName, setLabName] = useState('');
  const [reportDate, setReportDate] = useState('');

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) {
      onUploadFile(files[0], privacyMode, labName, reportDate);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Title */}
      <div className="pb-6 border-b border-[#A5BEB0]/60">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E5EEE6] border border-[#A5BEB0] text-[#204D3B] text-[11px] font-mono mb-2 font-bold">
          <UploadCloud className="w-3.5 h-3.5 text-[#204D3B]" />
          AUTHENTIC DOCUMENT INTAKE & OCR ANALYSIS
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25292B] tracking-tight">
          Upload Laboratory Report
        </h1>
        <p className="text-xs sm:text-sm text-[#52635B] mt-1">
          Upload authentic pathology PDF reports or clear scans of clinical blood tests. LabLens extracts numerical parameters and reference ranges, verifying authenticity before clinical admission.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#A5BEB0]/60 space-y-6 shadow-xs">
        {/* Privacy Mode Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#25292B] mb-2">Privacy & Retention Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPrivacyMode('private_history')}
              className={`p-4 rounded-xl border text-left transition-all ${
                privacyMode === 'private_history'
                  ? 'bg-[#E5EEE6] border-[#204D3B] text-[#204D3B]'
                  : 'bg-white border-[#A5BEB0] text-[#52635B] hover:border-[#204D3B]/40'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5 mb-1 text-[#25292B]">
                <Shield className="w-4 h-4 text-[#204D3B]" />
                Private History (Encrypted)
              </div>
              <span className="text-[11px] opacity-90 block text-[#52635B]">
                Saved to your secure patient workspace for historical tracking and comparability trends.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPrivacyMode('temporary_session')}
              className={`p-4 rounded-xl border text-left transition-all ${
                privacyMode === 'temporary_session'
                  ? 'bg-[#E5EEE6] border-[#204D3B] text-[#204D3B]'
                  : 'bg-white border-[#A5BEB0] text-[#52635B] hover:border-[#204D3B]/40'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5 mb-1 text-[#25292B]">
                <Clock className="w-4 h-4 text-amber-700" />
                Temporary Session (Ephemeral)
              </div>
              <span className="text-[11px] opacity-90 block text-[#52635B]">
                Processed in memory only and completely deleted when the browser window closes.
              </span>
            </button>
          </div>
        </div>

        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#25292B] mb-1.5">
              Diagnostic Center / Lab (Optional)
            </label>
            <input
              type="text"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              placeholder="e.g. Dr. Lal PathLabs, Metropolis Healthcare"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#A5BEB0] text-[#25292B] text-xs placeholder:text-[#52635B]/50 focus:outline-none focus:border-[#204D3B]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#25292B] mb-1.5">
              Sample Collection Date (Optional)
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#A5BEB0] text-[#25292B] text-xs focus:outline-none focus:border-[#204D3B]"
            />
          </div>
        </div>

        {/* Drag & Drop File Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
          className={`p-10 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[#204D3B] bg-[#E5EEE6] shadow-sm'
              : 'border-[#A5BEB0] hover:border-[#204D3B] bg-[#E5EEE6]/30'
          }`}
        >
          <input
            type="file"
            id="full-view-file-input"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <label htmlFor="full-view-file-input" className="cursor-pointer block">
            <div className="w-16 h-16 rounded-2xl bg-[#E5EEE6] border border-[#A5BEB0] flex items-center justify-center text-[#204D3B] mx-auto mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <span className="text-base font-bold text-[#25292B] block">
              {loading ? 'Processing Document with OCR Pipeline...' : 'Select File or Drop Here'}
            </span>
            <span className="text-xs text-[#52635B] mt-1 block">
              Only authentic pathology reports accepted • PDF, JPG, PNG • Max size 15MB
            </span>
            <button
              type="button"
              disabled={loading}
              className="mt-4 px-6 py-2.5 rounded-xl bg-[#204D3B] hover:bg-[#204D3B]/90 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Browse Computer
            </button>
          </label>
        </div>

        {/* Security & Authenticity notice */}
        <div className="pt-4 border-t border-[#A5BEB0]/60 flex items-center gap-2 text-xs text-[#52635B]">
          <Shield className="w-4 h-4 text-[#204D3B] shrink-0" />
          <span>Non-medical or fake PDFs will be automatically rejected by the strict OCR verification gate.</span>
        </div>
      </div>
    </div>
  );
};

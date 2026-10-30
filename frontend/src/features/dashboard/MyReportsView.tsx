import React, { useState } from 'react';
import {
  FileText,
  Trash2,
  Share2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  UploadCloud,
  ChevronRight
} from 'lucide-react';
import { Report } from '../../types';

interface MyReportsViewProps {
  reports: Report[];
  onSelectReport: (report: Report, mode: 'verify' | 'results') => void;
  onDeleteReport: (reportId: string) => Promise<void>;
  onOpenShareModal: (report: Report) => void;
  onDownloadPdf: (reportId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const MyReportsView: React.FC<MyReportsViewProps> = ({
  reports,
  onSelectReport,
  onDeleteReport,
  onOpenShareModal,
  onDownloadPdf,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'flagged' | 'verified'>('all');

  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      rep.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.lab_name && rep.lab_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === 'flagged') {
      return rep.parameters?.some(
        (p) => p.classification_status === 'Below Range' || p.classification_status === 'Above Range'
      );
    }
    if (filterMode === 'verified') {
      return rep.parameters?.every(
        (p) => p.verification_status === 'user_verified' || p.verification_status === 'auto_extracted'
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="pb-6 border-b border-[#A5BEB0]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E5EEE6] border border-[#A5BEB0] text-[#204D3B] text-[11px] font-mono mb-2 font-bold">
            <FileText className="w-3.5 h-3.5 text-[#204D3B]" />
            PATIENT ARCHIVE & HISTORY
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25292B] tracking-tight">
            My Laboratory Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#52635B] mt-1">
            Access your repository of authentic diagnostic reports, inspect parameter extractions, and view verified summaries.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('upload')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#204D3B] hover:bg-[#204D3B]/90 text-white font-bold text-xs tracking-wide shadow-md cursor-pointer self-start sm:self-auto transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Report</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#A5BEB0]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {(['all', 'flagged', 'verified'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filterMode === mode
                  ? 'bg-[#204D3B] text-white'
                  : 'bg-[#E5EEE6] text-[#52635B] hover:text-[#25292B] border border-[#A5BEB0]'
              }`}
            >
              {mode === 'all' ? `All (${reports.length})` : mode}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52635B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by file or lab name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#A5BEB0] text-[#25292B] text-xs placeholder:text-[#52635B]/50 focus:outline-none focus:border-[#204D3B]"
          />
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-white border border-[#A5BEB0]/60 shadow-xs">
          <FileText className="w-12 h-12 text-[#A5BEB0] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#25292B]">No Reports Found</h3>
          <p className="text-xs text-[#52635B] mt-1 mb-4">
            {searchQuery ? 'Try adjusting your search criteria.' : 'Upload your first authentic report to start analyzing.'}
          </p>
          <button
            onClick={() => onNavigateTab('upload')}
            className="px-5 py-2.5 rounded-xl bg-[#204D3B] text-white text-xs font-semibold hover:bg-[#204D3B]/90 transition-all cursor-pointer shadow-sm"
          >
            Go to Upload
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredReports.map((rep) => {
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
                className="p-5 rounded-2xl bg-white border border-[#A5BEB0]/60 hover:border-[#204D3B] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs hover:shadow-md"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#E5EEE6] border border-[#A5BEB0] flex items-center justify-center text-[#204D3B] shrink-0">
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
                      <span>Date: <strong className="text-[#25292B]">{rep.report_date || 'Unspecified'}</strong></span>
                      <span className="text-[#A5BEB0]">•</span>
                      <span>Lab: <strong className="text-[#25292B]">{rep.lab_name || 'Standard Lab'}</strong></span>
                      <span className="text-[#A5BEB0]">•</span>
                      <span>{total} Analytes Tested</span>
                    </div>

                    {total > 0 && (
                      <div className="mt-2.5 flex items-center gap-2 max-w-xs">
                        <div className="flex-1 h-1.5 rounded-full bg-[#E5EEE6] overflow-hidden border border-[#A5BEB0]/40">
                          <div
                            className="h-full rounded-full bg-[#204D3B]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#204D3B] font-mono font-bold">{pct}% Normal</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badges & Buttons */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#A5BEB0]/40">
                  <div className="flex items-center gap-1.5 font-mono text-xs">
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

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectReport(rep, 'verify')}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#E5EEE6] text-[#25292B] text-xs font-semibold border border-[#A5BEB0] transition-colors cursor-pointer"
                    >
                      Verify OCR
                    </button>
                    <button
                      onClick={() => onSelectReport(rep, 'results')}
                      className="px-3 py-1.5 rounded-lg bg-[#204D3B] hover:bg-[#204D3B]/90 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Results
                    </button>
                    <button
                      onClick={() => onDownloadPdf(rep.id)}
                      className="p-1.5 rounded-lg text-[#52635B] hover:text-[#204D3B] hover:bg-[#E5EEE6] transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenShareModal(rep)}
                      className="p-1.5 rounded-lg text-[#52635B] hover:text-[#204D3B] hover:bg-[#E5EEE6] transition-colors cursor-pointer"
                      title="Share Report"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteReport(rep.id)}
                      className="p-1.5 rounded-lg text-[#52635B] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

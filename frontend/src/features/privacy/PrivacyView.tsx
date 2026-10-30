import React, { useState } from 'react';
import { Shield, Lock, Key, Trash2, CheckCircle2, User, Database, AlertCircle } from 'lucide-react';
import { User as UserType } from '../../types';
import { ApiClient } from '../../lib/api';

interface PrivacyViewProps {
  currentUser: UserType | null;
  onLogout: () => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ currentUser, onLogout }) => {
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePurgeAllReports = async () => {
    if (!confirm('Are you sure you want to delete all uploaded reports and associated parameter records? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    try {
      const reports = await ApiClient.listReports();
      for (const r of reports) {
        await ApiClient.deleteReport(r.id);
      }
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 4000);
    } catch (err: any) {
      alert(`Purge error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div className="pb-6 border-b border-[#A5BEB0]/60">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E5EEE6] border border-[#A5BEB0] text-[#204D3B] text-[11px] font-mono mb-2 font-bold">
          PATIENT DATA SOVEREIGNTY
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25292B] tracking-tight">
          Profile & Privacy Center
        </h1>
        <p className="text-xs sm:text-sm text-[#52635B] mt-1">
          Review your authenticated identity, manage clinical report retention, and enforce data isolation policies.
        </p>
      </div>

      {purgeSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>All reports and extracted biometric data have been permanently removed from the server.</span>
        </div>
      )}

      {/* Authenticated Identity Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#A5BEB0]/60 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[#25292B] flex items-center gap-2">
          <User className="w-5 h-5 text-[#204D3B]" />
          Authenticated Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/50">
            <span className="text-[11px] text-[#52635B] font-mono block">NAME</span>
            <span className="text-sm font-bold text-[#25292B] mt-0.5 block">{currentUser?.full_name || 'Patient'}</span>
          </div>
          <div className="p-4 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/50">
            <span className="text-[11px] text-[#52635B] font-mono block">EMAIL</span>
            <span className="text-sm font-bold text-[#25292B] mt-0.5 block truncate">{currentUser?.email || 'patient@example.com'}</span>
          </div>
          <div className="p-4 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/50">
            <span className="text-[11px] text-[#52635B] font-mono block">PLATFORM ROLE</span>
            <span className="text-sm font-bold text-[#204D3B] mt-0.5 block capitalize font-mono">{currentUser?.role || 'Patient'}</span>
          </div>
        </div>
      </div>

      {/* Retention Mode Explanations */}
      <div className="p-6 rounded-2xl bg-white border border-[#A5BEB0]/60 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[#25292B] flex items-center gap-2">
          <Database className="w-5 h-5 text-[#204D3B]" />
          Report Retention Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/60 space-y-1.5">
            <span className="text-xs font-bold text-[#204D3B] block">Private History Mode</span>
            <p className="text-xs text-[#52635B] leading-relaxed">
              Your pathology parameters are stored in private patient records with SHA-256 integrity hashing to enable multi-report trending and cross-lab comparability gates.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/60 space-y-1.5">
            <span className="text-xs font-bold text-amber-800 block">Temporary Session Mode</span>
            <p className="text-xs text-[#52635B] leading-relaxed">
              Reports are processed purely in ephemeral memory. Values disappear as soon as you close your browser tab, ensuring total zero-trace privacy.
            </p>
          </div>
        </div>
      </div>

      {/* Dangerous Zone / Purge Data */}
      <div className="p-6 rounded-2xl bg-white border border-rose-300 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-rose-800 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-600" />
          Purge Clinical Data
        </h2>
        <p className="text-xs text-[#52635B] leading-relaxed">
          Permanently delete every uploaded PDF, extracted parameter record, and verification audit trail associated with your patient account. This operation is cryptographic and cannot be undone.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handlePurgeAllReports}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs tracking-wide shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Purging records...' : 'Permanently Delete All My Reports'}
          </button>
        </div>
      </div>
    </div>
  );
};

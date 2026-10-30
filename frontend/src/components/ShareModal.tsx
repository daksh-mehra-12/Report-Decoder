import React, { useState, useEffect } from 'react';
import { X, Share2, Shield, UserPlus, Trash2, CheckCircle2 } from 'lucide-react';
import { Report } from '../types';
import { ApiClient } from '../lib/api';

interface ShareModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ report, isOpen, onClose }) => {
  const [doctorEmail, setDoctorEmail] = useState('');
  const [shares, setShares] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchShares = async () => {
    if (!report) return;
    try {
      const res = await ApiClient.listShares(report.id);
      setShares(res);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen && report) {
      fetchShares();
    }
  }, [isOpen, report]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await ApiClient.shareReport(report.id, doctorEmail);
      setSuccess(`Report successfully shared with ${doctorEmail}.`);
      setDoctorEmail('');
      fetchShares();
    } catch (err: any) {
      setError(err.message || 'Failed to share report');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (shareId: string) => {
    if (!report) return;
    try {
      await ApiClient.revokeShare(report.id, shareId);
      setSuccess('Doctor access revoked immediately.');
      fetchShares();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke access');
    }
  };

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-[#A5BEB0] rounded-3xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#A5BEB0]/40">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#204D3B]" />
            <h3 className="text-base font-bold text-[#25292B]">Doctor Sharing & Consent Management</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#52635B] hover:text-[#25292B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#52635B] mt-3 leading-relaxed">
          Grant explicit read-only access to your verified report (<span className="text-[#204D3B] font-mono font-bold">{report.file_name}</span>). You retain sole ownership and can revoke access at any time.
        </p>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-[#204D3B]/30 text-[#204D3B] text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Share Form */}
        <form onSubmit={handleShare} className="mt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-[#52635B] mb-1">
              Registered Doctor's Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                placeholder="doctor@lablens.com"
                className="flex-1 bg-white border border-[#A5BEB0] rounded-xl px-3 py-2 text-xs text-[#25292B] focus:outline-none focus:border-[#204D3B]"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-[#204D3B] hover:bg-[#183a2d] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Sharing...' : 'Grant Access'}
              </button>
            </div>
            <p className="text-[10px] text-[#52635B] mt-1">
              Quick test doctor email: <span className="text-[#204D3B] font-mono font-semibold">doctor@lablens.com</span>
            </p>
          </div>
        </form>

        {/* Active Shares List */}
        <div className="mt-6 pt-4 border-t border-[#A5BEB0]/40">
          <h4 className="text-xs font-bold text-[#25292B] uppercase tracking-wider mb-2 font-mono">
            Active Permissions ({shares.filter((s) => s.is_active).length})
          </h4>

          {shares.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#E5EEE6]/50 text-center text-xs text-[#52635B]">
              This report has not been shared with any doctor yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {shares.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-[#25292B]">{s.doctor_name}</div>
                    <div className="text-[11px] text-[#52635B]">{s.doctor_email}</div>
                    <div className="text-[10px] text-[#52635B]/80">
                      {s.is_active ? 'Status: Active Consent' : `Revoked at ${s.revoked_at?.substring(0, 10)}`}
                    </div>
                  </div>

                  {s.is_active && (
                    <button
                      onClick={() => handleRevoke(s.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
                    >
                      Revoke Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

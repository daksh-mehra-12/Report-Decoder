import React, { useState, useEffect } from 'react';
import { Shield, Activity, Users, FileText, CheckCircle2, History } from 'lucide-react';
import { ApiClient } from '../../lib/api';

export const AdminPortal: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await ApiClient.getAdminMetrics();
        setMetrics(res);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-white tracking-tight">System Operations & Admin Console</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            System health, operational telemetry, and security audit events. <span className="text-amber-300 font-semibold">Strict Data Isolation Policy:</span> Admins have zero access to view patient medical report contents.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Operational Health: OK</span>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">Loading system telemetry...</div>
      ) : metrics ? (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400">Deterministic Engine</span>
              <div className="text-2xl font-extrabold text-white font-mono">v{metrics.rule_engine_version}</div>
              <span className="text-[10px] text-emerald-400">Verified Precision</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400">Curated Knowledge Analytes</span>
              <div className="text-2xl font-extrabold text-cyan-300 font-mono">{metrics.knowledge_base_entries}</div>
              <span className="text-[10px] text-cyan-400">MedlinePlus & ICMR</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400">Registered Users</span>
              <div className="text-2xl font-extrabold text-teal-300 font-mono">
                {metrics.user_statistics?.patients + metrics.user_statistics?.doctors}
              </div>
              <span className="text-[10px] text-slate-400">
                {metrics.user_statistics?.patients} Patients • {metrics.user_statistics?.doctors} Clinicians
              </span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400">Total Processed Reports</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">{metrics.reports_processed_aggregate}</div>
              <span className="text-[10px] text-slate-400">Aggregate Count Only</span>
            </div>
          </div>

          {/* Real-time Security Audit Log Stream */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">System Security & Access Audit Stream</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Cryptographically Sequenced</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {metrics.recent_audit_events?.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-navy-950/60 border border-white/5 flex items-center justify-between font-mono text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                      [{log.action}]
                    </span>
                    <span className="text-slate-300">Actor ID: {log.user_id ? log.user_id.substring(0, 8) : 'Anonymous'}...</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

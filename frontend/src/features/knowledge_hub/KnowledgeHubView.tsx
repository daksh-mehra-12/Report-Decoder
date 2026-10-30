import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MedicalKnowledgeEntry } from '../../types';
import { ApiClient } from '../../lib/api';

export const KnowledgeHubView: React.FC = () => {
  const [entries, setEntries] = useState<MedicalKnowledgeEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<MedicalKnowledgeEntry | null>(null);

  useEffect(() => {
    const fetchKb = async () => {
      try {
        const res = await ApiClient.getKnowledgeTests();
        setEntries(res);
        if (res.length > 0) setSelectedEntry(res[0]);
      } catch {
        // ignore
      }
    };
    fetchKb();
  }, []);

  const filteredEntries = entries.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      e.test_name.toLowerCase().includes(q) ||
      e.verified_aliases.some((a) => a.toLowerCase().includes(q)) ||
      e.definition.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-[#A5BEB0]/60 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E5EEE6] border border-[#A5BEB0] text-[#204D3B] text-[11px] font-mono mb-2 font-bold">
            <BookOpen className="w-3.5 h-3.5 text-[#204D3B]" />
            PEER-REVIEWED CLINICAL GLOSSARY
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#25292B] tracking-tight">
            Medical Knowledge & Authoritative Sources Hub
          </h2>
          <p className="text-xs sm:text-sm text-[#52635B] mt-1">
            Curated patient-friendly definitions and reference guidelines verified against official clinical repositories.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#52635B] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test or alias (e.g. Hb, FBS)..."
            className="w-full bg-white border border-[#A5BEB0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#25292B] placeholder:text-[#52635B]/50 focus:outline-none focus:border-[#204D3B]"
          />
        </div>
      </div>

      {/* Main Grid: Sidebar list + Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-[#52635B] uppercase tracking-wider block mb-2 font-mono">
            Vetted Analytes ({filteredEntries.length})
          </span>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredEntries.map((e) => {
              const isSelected = selectedEntry?.canonical_code === e.canonical_code;
              return (
                <div
                  key={e.canonical_code}
                  onClick={() => setSelectedEntry(e)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#204D3B] border-[#204D3B] text-white shadow-sm'
                      : 'bg-white border-[#A5BEB0]/60 text-[#25292B] hover:bg-[#E5EEE6]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-[#25292B]'}`}>{e.test_name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#E5EEE6] text-[#204D3B] border border-[#A5BEB0]'
                    }`}>
                      {e.review_status}
                    </span>
                  </div>
                  <div className={`text-[11px] mt-1 truncate ${isSelected ? 'text-white/80' : 'text-[#52635B]'}`}>
                    Aliases: {e.verified_aliases.join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane (8 cols) */}
        <div className="lg:col-span-8">
          {selectedEntry ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#A5BEB0]/60 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#A5BEB0]/40 gap-2">
                <div>
                  <h3 className="text-2xl font-bold text-[#25292B]">{selectedEntry.test_name}</h3>
                  <p className="text-xs text-[#52635B] font-mono mt-0.5 font-semibold">
                    Canonical Code: {selectedEntry.canonical_code} • Last Reviewed: {selectedEntry.last_reviewed}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Curated & Approved</span>
                </div>
              </div>

              {/* Definition */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#204D3B] uppercase tracking-wider font-mono">
                  Clinical Definition & Purpose
                </h4>
                <p className="text-sm text-[#25292B] leading-relaxed">
                  {selectedEntry.definition}
                </p>
                <div className="p-3.5 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/60 text-xs text-[#25292B]">
                  <span className="font-bold text-[#204D3B]">Test Purpose: </span>
                  {selectedEntry.test_purpose}
                </div>
              </div>

              {/* Clinical Nuances: High & Low */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-300 space-y-1.5">
                  <span className="text-xs font-bold text-amber-800 block">Above Reference Range</span>
                  <p className="text-xs text-[#25292B] leading-relaxed">
                    {selectedEntry.clinical_significance_high}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0] space-y-1.5">
                  <span className="text-xs font-bold text-[#204D3B] block">Below Reference Range</span>
                  <p className="text-xs text-[#25292B] leading-relaxed">
                    {selectedEntry.clinical_significance_low}
                  </p>
                </div>
              </div>

              {/* Official Sources & Citations */}
              <div className="pt-4 border-t border-[#A5BEB0]/40 space-y-3">
                <h4 className="text-xs font-bold text-[#25292B] uppercase tracking-wider font-mono">
                  Traceable Authoritative Medical Sources
                </h4>
                <div className="space-y-2">
                  {selectedEntry.sources?.map((s) => (
                    <div
                      key={s.source_id}
                      className="p-3.5 rounded-xl bg-[#E5EEE6]/40 border border-[#A5BEB0]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#25292B]">{s.name}</div>
                        <div className="text-[11px] text-[#52635B]">{s.organization} • {s.trust_tier}</div>
                        <p className="text-[11px] text-[#52635B] mt-0.5">{s.description}</p>
                      </div>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#204D3B] hover:text-white text-[#204D3B] border border-[#A5BEB0] text-xs font-bold transition-all shrink-0 shadow-2xs"
                      >
                        <span>Open MedlinePlus Guide</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-[#52635B] text-xs">Select an analyte to view verified clinical details.</div>
          )}
        </div>
      </div>
    </div>
  );
};

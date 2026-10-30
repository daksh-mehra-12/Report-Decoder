import React from 'react';
import { ArrowRight, ShieldCheck, Cpu, Stethoscope, Search, BarChart3, FileSpreadsheet, Lock } from 'lucide-react';
import { ThreeHeroScene } from '../../components/ThreeHeroScene';

interface LandingViewProps {
  onStartUpload: () => void;
  onLoadSyntheticDemo: (isImperfect: boolean) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartUpload, onLoadSyntheticDemo }) => {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7 z-10 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                AAYU 2026 • Problem T02: Report, Decoded
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                Understand your report.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                  Prepare for a better conversation.
                </span>
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl font-light">
                LabLens is an evidence-backed laboratory report comprehension platform. 
                We combine side-by-side OCR verification, pure deterministic classification against your printed reference ranges, 
                and inspectable citations from MedlinePlus and ICMR.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button
                  onClick={onStartUpload}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-navy-950 font-bold text-sm shadow-glow-cyan hover:scale-[1.02] transition-all"
                >
                  <span>Upload Laboratory Report</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onLoadSyntheticDemo(false)}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-medium text-sm border border-white/10 hover:border-cyan-500/40 transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  <span>Try Demo Clear Report</span>
                </button>

                <button
                  onClick={() => onLoadSyntheticDemo(true)}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-amber-300 font-medium text-xs border border-amber-500/30 hover:border-amber-400 transition-all"
                >
                  <span>⚡ Test Degraded Scan (Radar)</span>
                </button>
              </div>

              {/* Verified Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/10 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Deterministic Rule Engine v1.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span>MedlinePlus & ICMR Sourced</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-400" />
                  <span>Zero Generative Diagnosis</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Hero */}
            <div className="lg:col-span-5 h-[420px] lg:h-[500px] relative">
              <div className="w-full h-full rounded-3xl bg-gradient-to-b from-navy-900/60 to-navy-950/80 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-2.5 py-1 rounded-full bg-navy-950/80 border border-white/10 text-[10px] text-cyan-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  3D Analyte Lattice Engine
                </div>
                <ThreeHeroScene />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Three Non-Negotiable Principles */}
      <section className="py-16 bg-navy-900/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 font-mono">
              Constitutional AI Guardrails
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              The Three Non-Negotiable Principles
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              LabLens adheres to medical safety boundaries. We never compromise patient safety for synthetic confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Principle 1 */}
            <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 border border-cyan-500/20">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">1. AI Explains</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generative models and templates translate complex medical terminology into clear language exclusively from approved sources (MedlinePlus, ICMR). It never assumes unverified context.
              </p>
            </div>

            {/* Principle 2 */}
            <div className="glass-panel p-6 rounded-2xl border border-teal-500/20 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4 border border-teal-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">2. Deterministic Rules Classify</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Statuses (<em>In Range, Below Range, Above Range</em>) are computed strictly by audited arithmetic code against your physical report's reference intervals. Zero probabilistic AI guesswork.
              </p>
            </div>

            {/* Principle 3 */}
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">3. Doctors Diagnose</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                LabLens is strictly an educational tool. An out-of-range value does not prove disease; an in-range value does not guarantee health. We prepare you to have an informed discussion with your clinician.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Features Spotlight */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 font-mono">
              Core Technical Innovations
            </h2>
            <h3 className="text-3xl font-extrabold text-white">
              Architected for Integrity & Clinical Truth
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feature 1: TrustTrace */}
            <div className="glass-panel p-8 rounded-2xl border border-white/10 glass-panel-hover flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 font-mono">Signature 01</div>
                <h4 className="text-xl font-bold text-white mb-3">TrustTrace™ Provenance Chain</h4>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 font-light">
                  Inspect the complete cryptographic and clinical lineage of every test result: from the original scan bounding box, raw OCR string, user manual corrections, deterministic rule logic, to authoritative medical URLs.
                </p>
              </div>
              <div className="p-3 bg-navy-950/80 rounded-xl border border-cyan-500/20 text-xs font-mono text-cyan-300">
                Raw OCR ➜ Bounding Box ➜ User Verified ➜ Rule v1.0 ➜ MedlinePlus
              </div>
            </div>

            {/* Feature 2: Quality Radar */}
            <div className="glass-panel p-8 rounded-2xl border border-white/10 glass-panel-hover flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2 font-mono">Signature 02</div>
                <h4 className="text-xl font-bold text-white mb-3">Report Quality Radar™</h4>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 font-light">
                  Evaluates document readability, optical contrast, missing values, duplicate test parameters, and ambiguous decimal points. Explicitly measures extraction readiness—not patient health.
                </p>
              </div>
              <div className="p-3 bg-navy-950/80 rounded-xl border border-teal-500/20 text-xs font-mono text-teal-300">
                Legibility Score: 96% • Contrast: Clear • Range Parity: 100%
              </div>
            </div>

            {/* Feature 3: VisitReady */}
            <div className="glass-panel p-8 rounded-2xl border border-white/10 glass-panel-hover flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 font-mono">Signature 03</div>
                <h4 className="text-xl font-bold text-white mb-3">VisitReady™ Doctor Builder</h4>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 font-light">
                  Generates clinician-approved discussion prompts and an appointment-ready 1-page summary in English, Hindi, and Hinglish. Empowers patients to ask the right questions without panic.
                </p>
              </div>
              <div className="p-3 bg-navy-950/80 rounded-xl border border-emerald-500/20 text-xs font-mono text-emerald-300">
                1-Page Summary • Multilingual Prompts • PDF Export
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

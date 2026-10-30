import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, BookOpen, ExternalLink, HelpCircle, FileCheck, Stethoscope } from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div className="pb-6 border-b border-[#A5BEB0]/60">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E5EEE6] border border-[#A5BEB0] text-[#204D3B] text-[11px] font-mono mb-2 font-bold">
          RESPONSIBLE AI & CLINICAL BOUNDARIES
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#25292B] tracking-tight">
          Help, Limitations & Medical Safety
        </h1>
        <p className="text-xs sm:text-sm text-[#52635B] mt-1">
          Understanding how LabLens works, how deterministic classification protects you, and when to consult a licensed physician.
        </p>
      </div>

      {/* The Three Non-Negotiable Principles */}
      <div className="p-6 rounded-2xl bg-white border border-[#A5BEB0]/60 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[#25292B] flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#204D3B]" />
          The Three Non-Negotiable Principles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#E5EEE6]/60 border border-[#A5BEB0]/60">
            <span className="text-xs font-mono font-bold text-[#204D3B] block mb-1">01. AI EXPLAINS</span>
            <p className="text-xs text-[#25292B] leading-relaxed">
              Generative AI is strictly constrained to educational summaries of approved MedlinePlus content. It never guesses or modifies numbers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#E5EEE6]/60 border border-[#A5BEB0]/60">
            <span className="text-xs font-mono font-bold text-[#204D3B] block mb-1">02. DETERMINISTIC RULES CLASSIFY</span>
            <p className="text-xs text-[#25292B] leading-relaxed">
              Pure mathematical interval checks evaluate numbers against printed reference ranges on your report. Zero universal range guesswork.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#E5EEE6]/60 border border-[#A5BEB0]/60">
            <span className="text-xs font-mono font-bold text-amber-800 block mb-1">03. DOCTORS DIAGNOSE</span>
            <p className="text-xs text-[#25292B] leading-relaxed">
              Only a qualified clinician can interpret results in your complete physical context. LabLens prepares you for this conversation.
            </p>
          </div>
        </div>
      </div>

      {/* Out-of-Range vs In-Range Truth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#A5BEB0]/60 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Out-of-Range Does Not Prove Disease
          </div>
          <p className="text-xs text-[#52635B] leading-relaxed">
            Laboratory values fluctuate due to time of day, acute dehydration, recent exercise, dietary intake, temporary infection, or minor assay variances. An isolated abnormal number is an invitation for clinician review, not a definitive diagnosis.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#A5BEB0]/60 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            In-Range Does Not Guarantee Health
          </div>
          <p className="text-xs text-[#52635B] leading-relaxed">
            Normal laboratory limits represent statistical reference intervals of 95% of a healthy population. Normal test parameters do not rule out underlying conditions that require clinical examination, imaging, or specialized evaluation.
          </p>
        </div>
      </div>

      {/* Sourced Reference Knowledge */}
      <div className="p-6 rounded-2xl bg-white border border-[#A5BEB0]/60 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#25292B] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#204D3B]" />
          Authoritative Medical Reference Hierarchy
        </h3>
        <p className="text-xs text-[#52635B]">
          LabLens claims cite verified, peer-reviewed public health literature exclusively:
        </p>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/60 flex items-center justify-between">
            <div>
              <span className="font-bold text-[#25292B]">MedlinePlus (National Library of Medicine / NIH)</span>
              <p className="text-[11px] text-[#52635B]">Primary authority for test definitions, test purpose, and patient understanding.</p>
            </div>
            <a href="https://medlineplus.gov/lab-tests/" target="_blank" rel="noreferrer" className="text-[#204D3B] font-bold hover:underline flex items-center gap-1 font-mono text-xs">
              Link <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-3 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/60 flex items-center justify-between">
            <div>
              <span className="font-bold text-[#25292B]">Indian Council of Medical Research (ICMR)</span>
              <p className="text-[11px] text-[#52635B]">Clinical practice guidelines, screening thresholds, and national health context.</p>
            </div>
            <a href="https://main.icmr.nic.in/" target="_blank" rel="noreferrer" className="text-[#204D3B] font-bold hover:underline flex items-center gap-1 font-mono text-xs">
              Link <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-3 rounded-xl bg-[#E5EEE6]/50 border border-[#A5BEB0]/60 flex items-center justify-between">
            <div>
              <span className="font-bold text-[#25292B]">ARUP Consult® / Merck Manual Professional</span>
              <p className="text-[11px] text-[#52635B]">Biochemical assay context and reference laboratory documentation.</p>
            </div>
            <a href="https://www.arupconsult.com/" target="_blank" rel="noreferrer" className="text-[#204D3B] font-bold hover:underline flex items-center gap-1 font-mono text-xs">
              Link <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Emergency Escalate Notice */}
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-3 shadow-xs">
        <Stethoscope className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-rose-900">Emergency & Urgent Symptoms: </span>
          If you are experiencing severe symptoms such as chest pain, sudden difficulty breathing, persistent high fever, or loss of consciousness, do not rely on LabLens. Contact emergency medical services or proceed immediately to the nearest hospital emergency room.
        </div>
      </div>
    </div>
  );
};

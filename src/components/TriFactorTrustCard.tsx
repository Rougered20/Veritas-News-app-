import React from 'react';
import { ShieldCheck, Award, Layers, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { TriFactorProvenance } from '../types.js';

interface TriFactorTrustCardProps {
  triFactor?: TriFactorProvenance;
  compositeScore: number;
}

export const TriFactorTrustCard: React.FC<TriFactorTrustCardProps> = ({
  triFactor,
  compositeScore,
}) => {
  if (!triFactor) {
    return null;
  }

  const { sourceAuthority, crossCorroboration, primaryGrounding } = triFactor;

  return (
    <div className="bg-white border border-[#E8E3D9] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E3D9] pb-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            Tri-Factor Provenance & Verification Audit
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Transparent multi-axis factuality metrology replacing opaque single-metric scores
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E8E3D9] px-3 py-1.5 rounded-xl">
          <span className="text-2xs uppercase tracking-wider text-slate-500 font-bold">Composite Index</span>
          <span className="text-sm font-serif font-black text-emerald-800">{compositeScore}/100</span>
        </div>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Source Authority */}
        <div className="bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#C2410C] flex items-center justify-center font-bold text-xs">
                1
              </div>
              <span className="text-xs font-bold text-slate-900">Source Authority</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#C2410C]">
              {sourceAuthority.score}%
            </span>
          </div>

          {/* Meter */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#C2410C] h-full rounded-full transition-all duration-500"
              style={{ width: `${sourceAuthority.score}%` }}
            />
          </div>

          <div className="space-y-1 text-2xs text-slate-600">
            <div className="flex items-center justify-between font-mono">
              <span>Whitelist Tier:</span>
              <strong className="text-slate-900">Tier {sourceAuthority.tier}</strong>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span>Domain Historical:</span>
              <strong className="text-slate-900">{sourceAuthority.domainReputation}%</strong>
            </div>
            <p className="text-3xs text-slate-500 pt-1 leading-relaxed border-t border-slate-200">
              {sourceAuthority.notes}
            </p>
          </div>
        </div>

        {/* Pillar 2: Cross-Source Corroboration */}
        <div className="bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <span className="text-xs font-bold text-slate-900">Cross-Corroboration</span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700">
              {crossCorroboration.score}%
            </span>
          </div>

          {/* Meter */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${crossCorroboration.score}%` }}
            />
          </div>

          <div className="space-y-1 text-2xs text-slate-600">
            <div className="flex items-center justify-between font-mono">
              <span>Independent Nodes:</span>
              <strong className="text-slate-900">{crossCorroboration.independentOutletsCount} Outlets</strong>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span>Consensus Degree:</span>
              <strong className="text-slate-900">{crossCorroboration.consensusDegree.replace('_', ' ')}</strong>
            </div>
            <p className="text-3xs text-slate-500 pt-1 leading-relaxed border-t border-slate-200">
              {crossCorroboration.notes}
            </p>
          </div>
        </div>

        {/* Pillar 3: Primary Grounding */}
        <div className="bg-[#FAF8F5] border border-[#E8E3D9] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <span className="text-xs font-bold text-slate-900">Primary Grounding</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800">
              {primaryGrounding.score}%
            </span>
          </div>

          {/* Meter */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${primaryGrounding.score}%` }}
            />
          </div>

          <div className="space-y-1 text-2xs text-slate-600">
            <div className="flex items-center justify-between font-mono">
              <span>Official Registry Datasets:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Linked
              </span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span>Direct Quotations:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Grounded
              </span>
            </div>
            <p className="text-3xs text-slate-500 pt-1 leading-relaxed border-t border-slate-200">
              {primaryGrounding.notes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

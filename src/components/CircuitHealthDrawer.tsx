import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Activity,
  Shield,
  Zap,
  Radio,
  Server,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Flame,
  Layers,
  Database
} from 'lucide-react';
import { CircuitHealthStatus, IngestionPipelineLog } from '../types.js';

interface CircuitHealthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  status: CircuitHealthStatus | null;
  logs: IngestionPipelineLog[];
  onToggleFault: () => void;
  isFaultSimulated: boolean;
}

export const CircuitHealthDrawer: React.FC<CircuitHealthDrawerProps> = ({
  isOpen,
  onClose,
  status,
  logs,
  onToggleFault,
  isFaultSimulated,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'circuit' | 'whitelist' | 'logs'>('circuit');

  if (!isOpen) return null;

  const isClosed = status?.state === 'CLOSED';
  const isOpenCircuit = status?.state === 'OPEN';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full max-w-xl bg-white border-l border-[#E8E3D9] shadow-2xl h-full flex flex-col overflow-hidden"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#E8E3D9] bg-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isClosed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    Self-Healing & Circuit Health
                  </h2>
                  <span className={`px-2 py-0.5 text-2xs font-bold rounded-full uppercase border ${
                    isClosed
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {status?.state || 'CLOSED'}
                  </span>
                </div>
                <p className="text-2xs text-slate-500">
                  Resilience engine with SWR stale cache fallback & auto-recovery
                </p>
              </div>
            </div>

            <button
              id="close-circuit-drawer-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#EFECE6] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="px-5 border-b border-[#E8E3D9] bg-white flex items-center gap-2 text-xs font-medium">
            <button
              id="circuit-subtab-overview"
              onClick={() => setActiveSubTab('circuit')}
              className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'circuit'
                  ? 'border-[#C2410C] text-[#C2410C] font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Circuit Controls
            </button>
            <button
              id="circuit-subtab-whitelist"
              onClick={() => setActiveSubTab('whitelist')}
              className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'whitelist'
                  ? 'border-[#C2410C] text-[#C2410C] font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Publisher Whitelist
            </button>
            <button
              id="circuit-subtab-logs"
              onClick={() => setActiveSubTab('logs')}
              className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'logs'
                  ? 'border-[#C2410C] text-[#C2410C] font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5" /> Live Logs ({logs.length})
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#FDFBF7]">
            {activeSubTab === 'circuit' && (
              <>
                {/* Fault Simulation Hero Card */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  isFaultSimulated
                    ? 'bg-rose-50/80 border-rose-200'
                    : 'bg-white border-[#E8E3D9]'
                }`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Flame className={`w-4 h-4 ${isFaultSimulated ? 'text-rose-600' : 'text-amber-600'}`} />
                        Upstream Outage & Fault Injection Test
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        Trip the circuit breaker to simulate a dropped news wire API. The system automatically switches to the Stale-While-Revalidate fallback cache without breaking the frontend.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Current Status: <strong className={isFaultSimulated ? 'text-rose-700' : 'text-emerald-700'}>
                        {isFaultSimulated ? 'FAULT ACTIVE (OPEN)' : 'HEALTHY (CLOSED)'}
                      </strong>
                    </span>

                    <button
                      id="toggle-fault-simulation-btn"
                      onClick={onToggleFault}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
                        isFaultSimulated
                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          : 'bg-rose-700 hover:bg-rose-800 text-white'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {isFaultSimulated ? 'Restore & Auto-Heal' : 'Simulate API Drop'}
                    </button>
                  </div>
                </div>

                {/* Real-time Telemetry Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white border border-[#E8E3D9] rounded-xl">
                    <span className="text-2xs font-bold uppercase text-slate-500 block mb-1">
                      SSE Active Streams
                    </span>
                    <p className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-600" />
                      {status?.activeSSEClients || 1} Listener
                    </p>
                    <span className="text-3xs text-slate-400">Zero-reload push</span>
                  </div>

                  <div className="p-4 bg-white border border-[#E8E3D9] rounded-xl">
                    <span className="text-2xs font-bold uppercase text-slate-500 block mb-1">
                      Cache Mode
                    </span>
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {status?.cacheStatus === 'STALE_CACHE_FALLBACK' ? 'SWR Fallback' : 'Active Live'}
                    </p>
                    <span className="text-3xs text-emerald-600 font-semibold">Resilient storage</span>
                  </div>

                  <div className="p-4 bg-white border border-[#E8E3D9] rounded-xl">
                    <span className="text-2xs font-bold uppercase text-slate-500 block mb-1">
                      Sanitization Pass Rate
                    </span>
                    <p className="text-xl font-bold text-slate-900">
                      {status?.sanitizationPassRate ?? 99.8}%
                    </p>
                    <span className="text-3xs text-slate-400">Strict Zod + XSS clean</span>
                  </div>

                  <div className="p-4 bg-white border border-[#E8E3D9] rounded-xl">
                    <span className="text-2xs font-bold uppercase text-slate-500 block mb-1">
                      Articles Processed
                    </span>
                    <p className="text-xl font-bold text-slate-900">
                      {status?.totalArticlesProcessed ?? 28}
                    </p>
                    <span className="text-3xs text-slate-400">Audited & Verified</span>
                  </div>
                </div>

                {/* Subsystem Pipeline Health */}
                <div className="bg-white border border-[#E8E3D9] rounded-xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#C2410C]" /> Pipeline Subsystems Health
                  </h4>

                  <div className="space-y-2.5">
                    {[
                      { name: 'Wire Ingestion & Buffer', status: status?.pipelineStages.ingestion || 'HEALTHY' },
                      { name: 'Gemini Fact-Checking Engine', status: status?.pipelineStages.factCheckLLM || 'HEALTHY' },
                      { name: '12-Hour Cross-Referencing Matrix', status: status?.pipelineStages.crossReferencing || 'HEALTHY' },
                      { name: 'Server-Sent Events (SSE) Broadcaster', status: status?.pipelineStages.sseBroadcaster || 'HEALTHY' },
                    ].map((stage, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-lg text-xs">
                        <span className="font-medium text-slate-800">{stage.name}</span>
                        <span className={`px-2 py-0.5 rounded text-2xs font-bold uppercase ${
                          stage.status === 'HEALTHY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : stage.status === 'DEGRADED'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-900'
                        }`}>
                          {stage.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Whitelist Tab */}
            {activeSubTab === 'whitelist' && (
              <div className="space-y-4">
                <div className="bg-white border border-[#E8E3D9] rounded-xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Tiered Publisher Whitelist
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Only news nodes with verified editorial oversight and strict attribution meet Tier 1 & 2 authority levels.
                  </p>

                  <div className="space-y-2">
                    {[
                      { name: 'Nature Scientific', domain: 'nature.com', tier: 1, score: 99, lean: 'Neutral' },
                      { name: 'Reuters', domain: 'reuters.com', tier: 1, score: 98, lean: 'Neutral' },
                      { name: 'Associated Press (AP)', domain: 'apnews.com', tier: 1, score: 98, lean: 'Neutral' },
                      { name: 'Agence France-Presse (AFP)', domain: 'afp.com', tier: 1, score: 96, lean: 'Neutral' },
                      { name: 'Bloomberg News', domain: 'bloomberg.com', tier: 1, score: 95, lean: 'Neutral' },
                      { name: 'Financial Times', domain: 'ft.com', tier: 1, score: 95, lean: 'Neutral' },
                      { name: 'BBC News', domain: 'bbc.com', tier: 1, score: 94, lean: 'Neutral' },
                      { name: 'MIT Tech Review', domain: 'technologyreview.com', tier: 2, score: 93, lean: 'Neutral' },
                      { name: 'The Economist', domain: 'economist.com', tier: 2, score: 92, lean: 'Center-Right' },
                      { name: 'Wall Street Journal', domain: 'wsj.com', tier: 2, score: 91, lean: 'Center-Right' },
                      { name: 'The New York Times', domain: 'nytimes.com', tier: 2, score: 90, lean: 'Center-Left' },
                      { name: 'The Guardian', domain: 'theguardian.com', tier: 2, score: 89, lean: 'Center-Left' },
                    ].map((pub, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-[#FAF8F5] border border-[#E8E3D9] rounded-lg text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{pub.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-3xs font-bold bg-slate-200 text-slate-700">
                              Tier {pub.tier}
                            </span>
                          </div>
                          <span className="text-2xs text-slate-500">{pub.domain}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-700">{pub.score}%</span>
                          <span className="text-3xs text-slate-400 block">{pub.lean}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Live Logs Tab */}
            {activeSubTab === 'logs' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-2">
                  Streaming telemetry logs from the real-time ingestion & verification circuit:
                </p>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-2xs space-y-2 max-h-[500px] overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-slate-500 italic">Listening for live pipeline events...</p>
                  ) : (
                    logs.slice().reverse().map(log => (
                      <div key={log.id} className="pb-1.5 border-b border-slate-800/60 last:border-0">
                        <div className="flex items-center justify-between text-slate-400 text-3xs mb-0.5">
                          <span className="text-amber-400 font-semibold">[{log.stage}]</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className={
                          log.level === 'error' ? 'text-rose-400 font-semibold' :
                          log.level === 'success' ? 'text-emerald-300' :
                          log.level === 'warn' ? 'text-amber-300' : 'text-slate-300'
                        }>
                          {log.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Server, RefreshCw, Database, Radio, Activity, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { fetchSystemStatus, triggerPipeline } from '../services/api';

export default function OperationsDrawer({ isOpen, onClose, onPipelineTriggered }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [pipelineOutput, setPipelineOutput] = useState(null);
  const [activeTab, setActiveTab] = useState('db');

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchSystemStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const handleRunPipeline = async () => {
    setRunning(true);
    setPipelineOutput(null);
    try {
      const res = await triggerPipeline();
      setPipelineOutput(res);
      await loadStatus();
      if (onPipelineTriggered) onPipelineTriggered(res);
    } catch (err) {
      setError(`Pipeline run failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-[#DEDEDE] animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#DEDEDE] flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#171717] text-white flex items-center justify-center shadow-tactile">
              <Server className="w-4 h-4 text-[#F25623]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#171717] tracking-tight">System & Operations Console</h2>
              <p className="text-[11px] text-[#4D4D4D]">Database health, provider status, and collection worker</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#EBEBEB] text-[#4D4D4D] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Console Navigation */}
        <div className="flex border-b border-[#DEDEDE] bg-white px-4 pt-2 gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('db')}
            className={`pb-2 px-2 border-b-2 transition-colors ${
              activeTab === 'db'
                ? 'border-[#F25623] text-[#171717] font-semibold'
                : 'border-transparent text-[#737373] hover:text-[#171717]'
            }`}
          >
            Data Storage & Tables
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`pb-2 px-2 border-b-2 transition-colors ${
              activeTab === 'pipeline'
                ? 'border-[#F25623] text-[#171717] font-semibold'
                : 'border-transparent text-[#737373] hover:text-[#171717]'
            }`}
          >
            Pipeline Worker
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compliance')}
            className={`pb-2 px-2 border-b-2 transition-colors ${
              activeTab === 'compliance'
                ? 'border-[#F25623] text-[#171717] font-semibold'
                : 'border-transparent text-[#737373] hover:text-[#171717]'
            }`}
          >
            Compliance & Anti-Bot
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-[#FAFAFA]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#737373]">
              <span className="w-6 h-6 border-2 border-[#171717] border-t-transparent rounded-full animate-spin mb-3"></span>
              <p className="text-xs">Fetching system telemetry...</p>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          ) : (
            <>
              {activeTab === 'db' && (
                <div className="space-y-4">
                  {/* Database Engine Card */}
                  <div className="mini-card p-4 bg-white">
                    <div className="flex items-center justify-between pb-3 border-b border-[#DEDEDE]">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-[#171717]" />
                        <span className="text-xs font-bold text-[#171717]">Database Engine</span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Connected
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#DEDEDE]/60">
                        <span className="text-[10px] text-[#737373] uppercase tracking-wider block">Raw Observations</span>
                        <span className="text-base font-bold text-[#171717] tabular-nums">
                          {status?.raw_quotes_count?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#DEDEDE]/60">
                        <span className="text-[10px] text-[#737373] uppercase tracking-wider block">Validated Quotes</span>
                        <span className="text-base font-bold text-[#171717] tabular-nums">
                          {status?.validated_quotes_count?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#DEDEDE]/60">
                        <span className="text-[10px] text-[#737373] uppercase tracking-wider block">Index Observations</span>
                        <span className="text-base font-bold text-[#171717] tabular-nums">
                          {status?.index_observations_count?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#DEDEDE]/60">
                        <span className="text-[10px] text-[#737373] uppercase tracking-wider block">Data Quality Runs</span>
                        <span className="text-base font-bold text-[#171717] tabular-nums">
                          {status?.quality_runs_count?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Configured Sources & Routes */}
                  <div className="mini-card p-4 bg-white">
                    <span className="text-xs font-bold text-[#171717] block mb-2.5">Active Providers & Routes</span>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[#4D4D4D] py-1 border-b border-[#DEDEDE]/40">
                        <span>Configured Providers</span>
                        <span className="font-semibold text-[#171717]">5 Providers (6E, AI, QP, SG, MMT)</span>
                      </div>
                      <div className="flex items-center justify-between text-[#4D4D4D] py-1 border-b border-[#DEDEDE]/40">
                        <span>Configured Routes</span>
                        <span className="font-semibold text-[#171717]">{status?.routes_count || 7} Canonical Domestic Pairs</span>
                      </div>
                      <div className="flex items-center justify-between text-[#4D4D4D] py-1">
                        <span>Advance Windows</span>
                        <span className="font-semibold text-[#171717]">T+1, T+7, T+15, T+30, T+45</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pipeline' && (
                <div className="space-y-4">
                  <div className="mini-card p-4 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#171717]">Manual Pipeline Trigger</span>
                      <span className="text-[11px] text-[#737373]">Auth-Protected</span>
                    </div>
                    <p className="text-xs text-[#4D4D4D]">
                      Execute a full collection cycle across all 7 routes, 5 lead-time windows, and active providers.
                    </p>
                    <button
                      type="button"
                      onClick={handleRunPipeline}
                      disabled={running}
                      className="w-full h-9 rounded-lg btn-black flex items-center justify-center gap-2 text-xs font-medium transition-all btn-tactile disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
                      <span>{running ? 'Ingesting Airfare Quotes...' : 'Trigger Immediate Pipeline Cycle'}</span>
                    </button>
                  </div>

                  {pipelineOutput && (
                    <div className="mini-card p-4 bg-white space-y-2 border-emerald-200">
                      <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Cycle Completed Successfully</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-[#4D4D4D] pt-1">
                        <div>APIx Value: <strong className="text-[#171717]">{pipelineOutput.apix_value}</strong></div>
                        <div>Coverage: <strong className="text-[#171717]">{(pipelineOutput.coverage_ratio * 100).toFixed(0)}%</strong></div>
                        <div>Quotes Collected: <strong className="text-[#171717]">{pipelineOutput.quotes_collected}</strong></div>
                        <div>Validated Stored: <strong className="text-[#171717]">{pipelineOutput.validated_quotes_stored}</strong></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'compliance' && (
                <div className="mini-card p-4 bg-white space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-[#171717] font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#F25623]" />
                    <span>Zero-Bypass Compliance Policy</span>
                  </div>
                  <p className="text-[#4D4D4D] leading-relaxed">
                    The collection architecture enforces strict policy boundaries. If a provider presents a CAPTCHA, Cloudflare Turnstile, or anti-bot challenge:
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside text-[#4D4D4D]">
                    <li>Challenge signature is detected immediately.</li>
                    <li>Job status is flagged as <code>challenge_encountered</code>.</li>
                    <li>No attempt is made to bypass access controls or solve puzzles.</li>
                    <li>Downstream index calculation seamlessly falls back to calibration samples.</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-[#DEDEDE] bg-white flex items-center justify-between text-xs text-[#737373]">
          <span>Server: FastAPI :8000</span>
          <button
            type="button"
            onClick={loadStatus}
            className="text-[#171717] hover:underline font-medium"
          >
            Refresh Telemetry
          </button>
        </div>
      </div>
    </div>
  );
}

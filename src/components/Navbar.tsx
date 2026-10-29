import React from 'react';
import { Shield, Play, Sparkles, Bell, UserCheck, CloudRain } from 'lucide-react';
import { UserProfile, ProviderConnection } from '../types/cloudSecurity';

interface NavbarProps {
  user: UserProfile;
  connections: ProviderConnection[];
  onOpenAuditModal: () => void;
  onOpenAiCopilot: () => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  connections,
  onOpenAuditModal,
  onOpenAiCopilot,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg tracking-tight text-white">CloudGuard</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full tracking-wide uppercase">
              AI-CSPM v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Multi-Cloud Security Configuration & Audit Platform
          </p>
        </div>
      </div>

      {/* Provider Connectivity Pills */}
      <div className="hidden lg:flex items-center space-x-2 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80 text-xs">
        <span className="text-slate-400 font-medium px-2 text-[11px]">Active Clouds:</span>
        {connections.map((c) => {
          const isConnected = c.status === 'CONNECTED' || c.status === 'SAMPLE_ENV';
          return (
            <div
              key={c.provider}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all ${
                isConnected
                  ? 'bg-slate-800/60 border-slate-700 text-slate-200'
                  : 'bg-rose-950/20 border-rose-900/50 text-rose-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-rose-500'
                }`}
              />
              <span>{c.provider}</span>
              <span className="text-[10px] text-slate-400">({c.region})</span>
            </div>
          );
        })}
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenAiCopilot}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="hidden sm:inline">Gemini Co-Pilot</span>
        </button>

        <button
          onClick={onOpenAuditModal}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all cursor-pointer active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start Audit</span>
        </button>

        {/* User Badge */}
        <div className="pl-3 border-l border-slate-800 flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
            BM
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-slate-200 leading-tight">{user.name}</div>
            <div className="text-[10px] text-slate-400 leading-tight">{user.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

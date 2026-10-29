import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Cloud,
  Sparkles,
  History,
  CheckCircle2,
  FileText,
  Settings,
  GraduationCap,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'findings'
  | 'providers'
  | 'gemini'
  | 'history'
  | 'compliance'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openCriticalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  openCriticalCount,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Posture Dashboard', icon: LayoutDashboard },
    { id: 'findings', label: 'Security Findings', icon: AlertTriangle, badge: openCriticalCount },
    { id: 'providers', label: 'Cloud Providers', icon: Cloud },
    { id: 'gemini', label: 'Gemini AI Co-Pilot', icon: Sparkles },
    { id: 'compliance', label: 'Compliance Matrix', icon: CheckCircle2 },
    { id: 'history', label: 'Scan History & Drift', icon: History },
    { id: 'reports', label: 'Reports & Exports', icon: FileText },
    { id: 'settings', label: 'Settings & MCA Guide', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/40 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Assessment Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Project Viva Badge & Info */}
      <div className="p-3.5 rounded-xl bg-gradient-to-b from-slate-800/60 to-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold mb-1">
          <GraduationCap className="w-4 h-4" />
          <span>MCA Main Project</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
          Multi-Cloud Audit Engine with CIS Benchmarks & Gemini AI Assistant.
        </p>
        <button
          onClick={() => onSelectTab('settings')}
          className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium border border-slate-700 transition-colors"
        >
          View Synopsis & Windows Setup
        </button>
      </div>
    </aside>
  );
};

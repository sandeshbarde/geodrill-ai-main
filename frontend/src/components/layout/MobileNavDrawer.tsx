'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useDrillStore, SCENARIO_PRESETS, ScenarioType } from '@/store/useDrillStore';
import {
  X,
  LayoutDashboard,
  Zap,
  Map,
  Database,
  Layers,
  BarChart3,
  ShieldAlert,
  Bell,
  BookOpen,
  FileText,
  Bot,
  ClipboardList,
  ChevronDown,
  Activity,
  HardDrive,
} from 'lucide-react';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { section: 'OPERATIONS' },
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Live Operations', href: '/operations', icon: Zap },
  { label: 'Nearby Wells GIS', href: '/nearby-wells', icon: Map },
  { label: 'Well Intelligence', href: '/wells', icon: Database },
  { section: 'GEOLOGY & ANALYTICS' },
  { label: 'Stratigraphy', href: '/stratigraphy', icon: Layers },
  { label: 'Well Comparison', href: '/comparison', icon: BarChart3 },
  { section: 'RISK & PREDICTIVE' },
  { label: 'Risk Center', href: '/risk', icon: ShieldAlert },
  { label: 'Alerts', href: '/alerts', icon: Bell, badge: true },
  { label: 'Historical Intelligence', href: '/history', icon: BookOpen },
  { section: 'DATA & WORKFLOW' },
  { label: 'Documents & Downloads', href: '/documents', icon: FileText },
  { label: 'AI Copilot', href: '/copilot', icon: Bot },
  { label: 'Shift Handover', href: '/handover', icon: ClipboardList },
];

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { activeWellId, field, activeAlertCount, selectedScenario, setScenario } = useDrillStore();
  const [showScenarios, setShowScenarios] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-[300px] max-w-[85vw] h-full bg-[#080F18] border-r border-[#26333F] flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-250">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#26333F]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg overflow-hidden bg-[#4DA3FF]/10 border border-[#4DA3FF]/20 flex items-center justify-center">
              <Image
                src="/logo.jpg"
                alt="eRTMAC-NWIS"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">eRTMAC-NWIS</div>
              <div className="text-[10px] text-[#8EA3B3] font-mono">Nearby Wells Intelligence</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#14232E] border border-[#26333F] text-[#8EA3B3] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Well & Scenario Selector */}
        <div className="p-3 bg-[#0E1821] border-b border-[#26333F]">
          <div className="text-[10px] font-mono text-[#8EA3B3] uppercase">Active Well</div>
          <button
            onClick={() => setShowScenarios((s) => !s)}
            className="w-full flex items-center justify-between text-left mt-1 text-xs font-mono font-bold text-[#EAF4FA] hover:text-[#4DA3FF]"
          >
            <span>{activeWellId} ({field})</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8EA3B3]" />
          </button>

          {showScenarios && (
            <div className="mt-2 space-y-1 pt-2 border-t border-[#26333F]">
              {Object.entries(SCENARIO_PRESETS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => {
                    setScenario(key as ScenarioType);
                    setShowScenarios(false);
                  }}
                  className={`w-full text-left p-1.5 rounded text-[11px] ${
                    selectedScenario === key
                      ? 'bg-[#4DA3FF]/20 text-[#4DA3FF] font-semibold'
                      : 'text-slate-300 hover:bg-[#14232E]'
                  }`}
                >
                  <div>{item.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 nwis-scroll">
          {NAV_ITEMS.map((item, idx) => {
            if ('section' in item) {
              return (
                <div key={idx} className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider font-semibold text-[#8EA3B3]/60 font-mono">
                  {item.section}
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#14232E] text-[#EAF4FA] border-l-2 border-[#4DA3FF]'
                    : 'text-[#8EA3B3] hover:text-white hover:bg-[#0E1821]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#4DA3FF]' : ''}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && activeAlertCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#FF5964] text-white text-[9px] font-bold">
                    {activeAlertCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-[#26333F] bg-[#0E1821] text-[10px] font-mono text-[#8EA3B3] flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mobile Ready</span>
          </span>
          <span className="text-slate-500">v1.0.0</span>
        </div>
      </div>
    </div>
  );
};

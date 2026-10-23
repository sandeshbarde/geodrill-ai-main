'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useDrillStore } from '@/store/useDrillStore';
import {
  LayoutDashboard, Zap, Map, Database, Layers, BarChart3,
  ShieldAlert, Bell, BookOpen, FileText, Bot, ClipboardList,
  ChevronLeft, ChevronRight, Star, Clock, Activity,
} from 'lucide-react';

const NAV_ITEMS = [
  { section: 'OPERATIONS' },
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Live Operations', href: '/operations', icon: Zap },
  { label: 'Nearby Wells', href: '/nearby-wells', icon: Map },
  { label: 'Well Intelligence', href: '/wells', icon: Database },
  { section: 'GEOLOGY' },
  { label: 'Stratigraphy', href: '/stratigraphy', icon: Layers },
  { label: 'Well Comparison', href: '/comparison', icon: BarChart3 },
  { section: 'INTELLIGENCE' },
  { label: 'Risk Center', href: '/risk', icon: ShieldAlert },
  { label: 'Alerts', href: '/alerts', icon: Bell, badge: true },
  { label: 'Historical Intelligence', href: '/history', icon: BookOpen },
  { section: 'KNOWLEDGE' },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'AI Copilot', href: '/copilot', icon: Bot },
  { section: 'WORKFLOW' },
  { label: 'Shift Handover', href: '/handover', icon: ClipboardList },
] as const;

type NavSection = { section: string };
type NavLink = { label: string; href: string; icon: React.ComponentType<{ className?: string }>; badge?: boolean };
type NavItem = NavSection | NavLink;

function isSection(item: NavItem): item is NavSection {
  return 'section' in item;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { activeWellId, field, activeAlertCount, pinnedWells, recentActivity } = useDrillStore();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={`relative flex flex-col bg-[#080F18] border-r border-[#26333F] h-screen transition-all duration-300 ${
        collapsed ? 'w-[60px]' : 'w-[240px]'
      } flex-shrink-0`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full bg-[#14232E] border border-[#26333F] flex items-center justify-center text-[#8EA3B3] hover:text-[#EAF4FA] transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Logo */}
      <div className={`flex items-center border-b border-[#26333F] ${collapsed ? 'justify-center py-3 px-2' : 'px-3 py-2'}`}>
        {collapsed ? (
          <div className="h-9 w-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#4DA3FF]/10 border border-[#4DA3FF]/20">
            <Image
              src="/logo.jpg"
              alt="eRTMAC-NWIS"
              width={36}
              height={36}
              className="object-cover object-top scale-150 translate-y-1"
              priority
            />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <Image
              src="/logo.jpg"
              alt="eRTMAC-NWIS Nearby Wells Intelligence System"
              width={200}
              height={180}
              className="object-contain w-[180px] h-auto"
              priority
            />
          </div>
        )}
      </div>

      {/* Active Well Pill */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-[#0E1821] border border-[#26333F]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#32D296] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#32D296]" />
            </span>
            <span className="text-[10px] text-[#8EA3B3]">Active Well</span>
          </div>
          <div className="text-xs font-mono font-bold text-[#EAF4FA] mt-0.5">{activeWellId}</div>
          <div className="text-[10px] text-[#8EA3B3] truncate">{field}</div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-2 no-scrollbar">
        {(NAV_ITEMS as unknown as NavItem[]).map((item, i) => {
          if (isSection(item)) {
            if (collapsed) return null;
            return (
              <div key={i} className="px-3 pt-4 pb-1">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-[#8EA3B3]/60">
                  {item.section}
                </span>
              </div>
            );
          }
          const navItem = item as NavLink;
          const Icon = navItem.icon;
          const isActive = pathname === navItem.href || (navItem.href !== '/' && pathname.startsWith(navItem.href));
          return (
            <Link
              key={navItem.href}
              href={navItem.href}
              className={`flex items-center gap-3 mx-2 px-2.5 py-2 rounded-lg text-sm transition-all relative group ${
                isActive
                  ? 'bg-[#14232E] text-[#EAF4FA] border-l-2 border-[#4DA3FF]'
                  : 'text-[#8EA3B3] hover:text-[#EAF4FA] hover:bg-[#0E1821]'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#4DA3FF]' : ''}`} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-[13px] font-medium">{navItem.label}</span>
                  {navItem.badge && activeAlertCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#FF5964]/20 text-[#FF5964] text-[10px] font-bold border border-[#FF5964]/30">
                      {activeAlertCount}
                    </span>
                  )}
                </>
              )}
              {collapsed && navItem.badge && activeAlertCount > 0 && (
                <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-[#FF5964]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Pinned Wells */}
      {!collapsed && pinnedWells.length > 0 && (
        <div className="border-t border-[#26333F] px-3 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-3 h-3 text-[#F4B942]" />
            <span className="text-[10px] uppercase tracking-wide text-[#8EA3B3]">Pinned Wells</span>
          </div>
          {pinnedWells.slice(0, 3).map((w) => (
            <div key={w} className="text-[11px] text-[#8EA3B3] py-0.5 truncate font-mono">{w}</div>
          ))}
        </div>
      )}

      {/* Recent Activity */}
      {!collapsed && (
        <div className="border-t border-[#26333F] px-3 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-3 h-3 text-[#8EA3B3]" />
            <span className="text-[10px] uppercase tracking-wide text-[#8EA3B3]">Recent</span>
          </div>
          {recentActivity.slice(0, 3).map((a) => (
            <div key={a.id} className="flex items-start gap-2 py-0.5">
              <span className="text-[10px] font-mono text-[#8EA3B3]/60 flex-shrink-0 mt-0.5">{a.time}</span>
              <span className="text-[10px] text-[#8EA3B3] truncate">{a.description}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};

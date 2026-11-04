'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Zap, FileText, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu?: () => void;
}

const MOBILE_NAV = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'GIS Map', href: '/nearby-wells', icon: Map },
  { label: 'Live Ops', href: '/operations', icon: Zap },
  { label: 'Docs & Data', href: '/documents', icon: FileText },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#080F18]/95 backdrop-blur-md border-t border-[#26333F] h-14 flex items-center z-40 px-1 shadow-2xl">
      {MOBILE_NAV.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
              isActive ? 'text-[#4DA3FF]' : 'text-[#8EA3B3] hover:text-[#EAF4FA]'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] font-medium tracking-tight">{label}</span>
          </Link>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        onClick={onOpenMenu}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full text-[#8EA3B3] hover:text-[#EAF4FA] transition-colors"
      >
        <Menu className="w-4 h-4 text-cyan-400" />
        <span className="text-[10px] font-medium tracking-tight">All Menu</span>
      </button>
    </nav>
  );
};

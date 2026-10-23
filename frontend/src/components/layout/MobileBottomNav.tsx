'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Bell, Bot, MoreHorizontal } from 'lucide-react';

const MOBILE_NAV = [
  { label: 'Home', href: '/', icon: LayoutDashboard },
  { label: 'Map', href: '/nearby-wells', icon: Map },
  { label: 'Alerts', href: '/alerts', icon: Bell },
  { label: 'AI', href: '/copilot', icon: Bot },
  { label: 'More', href: '/risk', icon: MoreHorizontal },
];

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#080F18] border-t border-[#26333F] h-16 flex items-center z-50">
      {MOBILE_NAV.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors ${
              isActive ? 'text-[#4DA3FF]' : 'text-[#8EA3B3]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

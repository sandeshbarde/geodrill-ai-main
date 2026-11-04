'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileNavDrawer } from './MobileNavDrawer';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#071018] overflow-hidden">
      {/* Fixed sidebar — desktop only */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onToggleMobileMenu={() => setMobileMenuOpen((o) => !o)} />
        <main className="flex-1 overflow-y-auto nwis-scroll">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />

      {/* Slide-over Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
};

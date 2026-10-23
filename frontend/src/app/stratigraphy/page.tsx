'use client';
import React from 'react';
import { StratigraphicCorrelation } from '@/components/stratigraphy/StratigraphicCorrelation';
import { Layers } from 'lucide-react';

export default function StratigraphyPage() {
  return (
    <div className="p-5 space-y-5 max-w-[1600px] mx-auto pb-20 lg:pb-5 h-full flex flex-col">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-[#EAF4FA] flex items-center gap-2">
          <Layers className="w-6 h-6 text-[#F4B942]" /> Stratigraphic Correlation
        </h1>
        <p className="text-sm text-[#8EA3B3] mt-1">Active well vs offset well depth correlation</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0">
        {[
          { label: 'Overall Correlation', val: 94 },
          { label: 'Formation Match', val: 96 },
          { label: 'Depth Proximity', val: 93 },
          { label: 'Trajectory Sim', val: 94 },
          { label: 'Evidence', val: 95 }
        ].map(m => (
          <div key={m.label} className="bg-[#0E1821] border border-[#26333F] rounded-lg p-3">
            <div className="text-[10px] text-[#8EA3B3] uppercase mb-1">{m.label}</div>
            <div className="text-xl font-mono font-bold text-[#32D296] mb-2">{m.val}%</div>
            <div className="h-1 w-full bg-[#26333F] rounded-full overflow-hidden">
              <div className="h-full bg-[#32D296]" style={{ width: `${m.val}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-[600px] rounded-xl border border-[#26333F] overflow-hidden bg-[#0E1821]">
        <StratigraphicCorrelation />
      </div>
    </div>
  );
}

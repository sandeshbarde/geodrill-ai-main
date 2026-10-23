'use client';
import React from 'react';
import { ClipboardList, Download, Share2 } from 'lucide-react';
import { useDrillStore } from '@/store/useDrillStore';

export default function HandoverPage() {
  const { activeWellId, telemetry, risk } = useDrillStore();

  return (
    <div className="p-5 space-y-5 max-w-[1200px] mx-auto pb-20 lg:pb-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#EAF4FA] flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#4DA3FF]" /> SHIFT HANDOVER
          </h1>
          <p className="text-sm text-[#8EA3B3] mt-1">Well: {activeWellId} • Shift: Night → Morning</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#14232E] hover:bg-[#26333F] text-[#EAF4FA] text-xs font-semibold rounded transition-colors border border-[#26333F]">
            <Share2 className="w-4 h-4" /> SHARE
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#4DA3FF] hover:bg-[#4DA3FF]/90 text-[#071018] text-xs font-semibold rounded transition-colors">
            <Download className="w-4 h-4" /> EXPORT PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0E1821] border border-[#26333F] rounded-xl p-4">
          <div className="text-[10px] text-[#8EA3B3] uppercase mb-1">Depth</div>
          <div className="font-mono text-xl font-bold text-[#EAF4FA]">{telemetry.measuredDepthM.toFixed(1)}m MD</div>
        </div>
        <div className="bg-[#0E1821] border border-[#26333F] rounded-xl p-4">
          <div className="text-[10px] text-[#8EA3B3] uppercase mb-1">Formation</div>
          <div className="text-xl font-bold text-[#F4B942]">{telemetry.currentFormation}</div>
        </div>
        <div className="bg-[#0E1821] border border-[#26333F] rounded-xl p-4">
          <div className="text-[10px] text-[#8EA3B3] uppercase mb-1">Risk Level</div>
          <div className={`text-xl font-bold uppercase ${risk.riskLevel === 'critical' ? 'text-[#FF5964]' : risk.riskLevel === 'high' ? 'text-orange-400' : 'text-[#32D296]'}`}>{risk.riskLevel}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0E1821] border border-[#26333F] rounded-xl p-5">
          <h2 className="font-bold text-[#EAF4FA] mb-4">Key Events This Shift</h2>
          <ul className="space-y-3 text-sm text-[#EAF4FA]">
            <li className="flex gap-2 items-start"><input type="checkbox" defaultChecked className="mt-1" /> Torque increased from 14.2 to 16.4 kft-lb</li>
            <li className="flex gap-2 items-start"><input type="checkbox" defaultChecked className="mt-1" /> SPP stable at 3100 psi</li>
            <li className="flex gap-2 items-start"><input type="checkbox" defaultChecked className="mt-1" /> Approaching historical loss zone</li>
            <li className="flex gap-2 items-start"><input type="checkbox" defaultChecked className="mt-1" /> Risk score elevated to 78/100 HIGH</li>
          </ul>
        </div>
        
        <div className="bg-[#0E1821] border border-[#26333F] rounded-xl p-5">
          <h2 className="font-bold text-[#EAF4FA] mb-4">Recommended Actions</h2>
          <ul className="space-y-3 text-sm text-[#EAF4FA] list-decimal pl-5">
            <li>Stage 50 bbl LCM pill (40 ppb blend) before drilling ahead</li>
            <li>Monitor return pit volume continuously</li>
            <li>Review KG-07 WCR page 18 for mitigation details</li>
            <li>Maintain 1.45 SG mud weight</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

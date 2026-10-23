'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useDrillStore } from '@/store/useDrillStore';
import { KG_BASIN_WELLS } from '@/constants/wells';
import { MapPin, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function WellPage() {
  const params = useParams();
  const wellId = params.wellId as string;
  const well = KG_BASIN_WELLS.find(w => w.id === wellId) || KG_BASIN_WELLS[0];

  return (
    <div className="p-5 space-y-5 max-w-[1200px] mx-auto pb-20 lg:pb-5">
      <Link href="/nearby-wells" className="text-[#4DA3FF] text-sm hover:underline">← Back to Nearby Wells</Link>
      
      <div className="bg-[#0E1821] border border-[#26333F] rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#EAF4FA] font-mono">{well.name}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-[#8EA3B3]">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {well.distanceKm} km offset</span>
              <span>{well.formation}</span>
              <span className="font-mono">{well.totalDepthM}m TD</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${well.status === 'critical' ? 'bg-[#FF5964]/10 text-[#FF5964]' : well.status === 'warning' ? 'bg-[#F4B942]/10 text-[#F4B942]' : 'bg-[#32D296]/10 text-[#32D296]'}`}>
            {well.status} RISK
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0E1821] border border-[#26333F] rounded-xl p-5">
          <h3 className="font-bold text-[#EAF4FA] mb-4">Historical Events</h3>
          <div className="bg-[#14232E] rounded-lg p-3 text-sm text-[#EAF4FA] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF5964] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">{well.hazard}</div>
              <div className="text-xs text-[#8EA3B3] font-mono mt-1">Impact: {well.nptHours} hrs NPT</div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#0E1821] border border-[#26333F] rounded-xl p-5">
          <h3 className="font-bold text-[#EAF4FA] mb-4">Operations Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-[#26333F] pb-2">
              <span className="text-[#8EA3B3]">Target TD</span><span className="font-mono text-[#EAF4FA]">{well.totalDepthM}m</span>
            </div>
            <div className="flex justify-between border-b border-[#26333F] pb-2 pt-1">
              <span className="text-[#8EA3B3]">Formation at TD</span><span className="text-[#EAF4FA]">{well.formation}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#8EA3B3]">Overall Risk Score</span><span className="font-mono font-bold text-[#FF5964]">{well.riskScore}/100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

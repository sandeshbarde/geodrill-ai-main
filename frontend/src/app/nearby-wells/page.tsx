'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useDrillStore } from '@/store/useDrillStore';
import { WellDetailDrawer } from '@/components/wells/WellDetailDrawer';
import { EvidenceViewer } from '@/components/evidence/EvidenceViewer';
import { Map, Filter, Search, ArrowUpDown, MapPin } from 'lucide-react';

const DynamicWellMap = dynamic(
  () => import('@/components/geospatial/WellMap').then(m => m.WellMap),
  { ssr: false, loading: () => <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#071018] text-[#8EA3B3] text-sm">Loading GIS map...</div> }
);

import { KG_BASIN_WELLS } from '@/constants/wells';

export default function NearbyWellsPage() {
  const { activeWellId, selectedWell, setSelectedWell, nearbyRadius, setNearbyRadius } = useDrillStore();
  const [search, setSearch] = useState('');

  const filteredWells = KG_BASIN_WELLS.filter(w => w.distanceKm <= nearbyRadius && w.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-5 space-y-5 max-w-[1600px] mx-auto pb-20 lg:pb-5 h-full flex flex-col">
      <div className="flex items-start justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#EAF4FA] flex items-center gap-2">
            <Map className="w-6 h-6 text-[#4DA3FF]" /> Nearby Wells Intelligence
          </h1>
          <p className="text-sm text-[#8EA3B3] mt-1">Offset wells within {nearbyRadius}km of active well {activeWellId}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-[#0E1821] p-3 rounded-lg border border-[#26333F] shrink-0">
        <div className="flex bg-[#14232E] rounded border border-[#26333F]">
          {[5, 10, 15, 25].map(r => (
            <button key={r} onClick={() => setNearbyRadius(r)} className={`px-3 py-1 text-xs font-mono border-r border-[#26333F] last:border-0 ${nearbyRadius === r ? 'bg-[#4DA3FF]/20 text-[#4DA3FF]' : 'text-[#8EA3B3] hover:text-[#EAF4FA]'}`}>
              {r}km
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-2.5 top-2 w-4 h-4 text-[#8EA3B3]" />
          <input 
            type="text" placeholder="Search wells..." 
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-[#14232E] border border-[#26333F] rounded pl-9 pr-3 py-1.5 text-sm text-[#EAF4FA] focus:outline-none focus:border-[#4DA3FF]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-[500px]">
        <div className="lg:col-span-2 rounded-xl overflow-hidden border border-[#26333F] relative">
          <DynamicWellMap />
        </div>
        <div className="lg:col-span-1 rounded-xl overflow-hidden border border-[#26333F] bg-[#0E1821]">
          {selectedWell ? (
            <WellDetailDrawer well={selectedWell} onClose={() => setSelectedWell(null)} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#8EA3B3] p-6 text-center">
              <MapPin className="w-12 h-12 mb-3 opacity-20" />
              <p>Select a well on the map or in the table below to view details.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0E1821] border border-[#26333F] rounded-xl overflow-hidden shrink-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#14232E] text-[#8EA3B3] text-[11px] uppercase border-b border-[#26333F]">
              <tr>
                <th className="px-4 py-3 font-semibold">Well</th>
                <th className="px-4 py-3 font-semibold">Distance</th>
                <th className="px-4 py-3 font-semibold">Formation</th>
                <th className="px-4 py-3 font-semibold">Nearest Incident</th>
                <th className="px-4 py-3 font-semibold">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26333F]">
              {filteredWells.map(w => (
                <tr 
                  key={w.id} 
                  onClick={() => setSelectedWell(w)}
                  className={`hover:bg-[#14232E]/50 cursor-pointer transition-colors ${selectedWell?.id === w.id ? 'bg-[#14232E] ring-1 ring-[#4DA3FF] ring-inset' : ''}`}
                >
                  <td className="px-4 py-3 text-[#EAF4FA] font-mono font-bold flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${w.status === 'critical' ? 'bg-[#FF5964]' : w.status === 'warning' ? 'bg-[#F4B942]' : 'bg-[#32D296]'}`} />
                    {w.name}
                  </td>
                  <td className="px-4 py-3 text-[#8EA3B3] font-mono">{w.distanceKm.toFixed(1)} km</td>
                  <td className="px-4 py-3 text-[#F4B942]">{w.formation}</td>
                  <td className="px-4 py-3 text-[#EAF4FA]">{w.hazard}</td>
                  <td className={`px-4 py-3 font-mono font-bold ${w.riskScore && w.riskScore > 75 ? 'text-[#FF5964]' : w.riskScore && w.riskScore > 50 ? 'text-[#F4B942]' : 'text-[#32D296]'}`}>
                    {w.riskScore}/100
                  </td>
                </tr>
              ))}
              {filteredWells.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#8EA3B3]">No wells found in this radius.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <EvidenceViewer />
    </div>
  );
}

'use client';
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { EvidenceViewer } from '@/components/evidence/EvidenceViewer';
import { useDrillStore } from '@/store/useDrillStore';

export default function ComparisonPage() {
  const { setEvidenceViewerOpen, setSelectedEvidence } = useDrillStore();

  const handleEv = () => {
    setSelectedEvidence({ id: 'ev', sourceDoc: 'WCR', wellId: 'KG-07', incidentType: 'Mud Loss', depthM: 3180 });
    setEvidenceViewerOpen(true);
  };

  return (
    <div className="p-5 space-y-5 max-w-[1600px] mx-auto pb-20 lg:pb-5">
      <h1 className="text-2xl font-bold text-[#EAF4FA] flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-[#4DA3FF]" /> Well Comparison
      </h1>

      <div className="bg-[#0E1821] border border-[#26333F] rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#14232E] text-[#8EA3B3] text-xs uppercase border-b border-[#26333F]">
            <tr>
              <th className="px-4 py-3 font-semibold sticky left-0 bg-[#14232E] z-10 border-r border-[#26333F]">Parameter</th>
              <th className="px-4 py-3 font-semibold text-[#4DA3FF]">Active Well</th>
              <th className="px-4 py-3 font-semibold">KG-07-ALOK</th>
              <th className="px-4 py-3 font-semibold">KG-12-BRAVO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#26333F]">
            <tr>
              <td className="px-4 py-3 text-[#8EA3B3] sticky left-0 bg-[#0E1821] border-r border-[#26333F]">Formation</td>
              <td className="px-4 py-3 text-[#F4B942]">Hugin</td>
              <td className="px-4 py-3 text-[#F4B942]">Hugin</td>
              <td className="px-4 py-3 text-[#F4B942]">Hugin</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-[#8EA3B3] sticky left-0 bg-[#0E1821] border-r border-[#26333F]">Total Depth</td>
              <td className="px-4 py-3 font-mono text-[#EAF4FA]">3200m Target</td>
              <td className="px-4 py-3 font-mono text-[#EAF4FA]">3450m TD</td>
              <td className="px-4 py-3 font-mono text-[#EAF4FA]">3520m TD</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-[#8EA3B3] sticky left-0 bg-[#0E1821] border-r border-[#26333F]">Mud Loss</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3"><button onClick={handleEv} className="px-2 py-0.5 bg-[#FF5964]/10 text-[#FF5964] text-[10px] font-bold rounded">YES</button></td>
              <td className="px-4 py-3">—</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-[#8EA3B3] sticky left-0 bg-[#0E1821] border-r border-[#26333F]">Gas Kick</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3">—</td>
              <td className="px-4 py-3"><button onClick={handleEv} className="px-2 py-0.5 bg-[#FF5964]/10 text-[#FF5964] text-[10px] font-bold rounded">YES</button></td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-[#8EA3B3] sticky left-0 bg-[#0E1821] border-r border-[#26333F]">Max Torque</td>
              <td className="px-4 py-3 font-mono">16.4 kft-lb</td>
              <td className="px-4 py-3 font-mono">18.1 kft-lb</td>
              <td className="px-4 py-3 font-mono">17.5 kft-lb</td>
            </tr>
          </tbody>
        </table>
      </div>
      <EvidenceViewer />
    </div>
  );
}

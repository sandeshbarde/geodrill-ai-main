'use client';
import React from 'react';
import { useDrillStore } from '@/store/useDrillStore';
import { Search, Filter, BookOpen } from 'lucide-react';
import { EvidenceViewer } from '@/components/evidence/EvidenceViewer';

const DEMO_INCIDENTS = [
  { id: 1, wellId: 'KG-07-ALOK', depthM: 3180, formation: 'Hugin', eventType: 'Mud Loss', severity: 'Severe', description: 'Total mud loss of 65 bbl/hr at permeable sandstone layer.', mitigation: 'Spotted 40 bbl LCM pill. Reduced flow rate to 400 gpm.', sourceDoc: 'WCR_KG07_ALOK.pdf', sourcePage: 18, date: '2019-03-14', confidence: 94 },
  { id: 2, wellId: 'KG-12-BRAVO', depthM: 3210, formation: 'Hugin', eventType: 'Partial Loss', severity: 'Moderate', description: 'Partial mud losses 15-25 bbl/hr during RIH.', mitigation: 'Reduced flow rate and rotary speed.', sourceDoc: 'DDR_KG12_BRAVO.pdf', sourcePage: 42, date: '2020-07-22', confidence: 88 },
];

export default function HistoryPage() {
  const { setSelectedEvidence, setEvidenceViewerOpen } = useDrillStore();

  const handleOpen = (inc: any) => {
    setSelectedEvidence({
      id: inc.id.toString(), wellId: inc.wellId, sourceDoc: inc.sourceDoc,
      sourcePage: inc.sourcePage, incidentType: inc.eventType, depthM: inc.depthM,
      formation: inc.formation, severity: inc.severity, mitigation: inc.mitigation,
      confidence: inc.confidence
    });
    setEvidenceViewerOpen(true);
  };

  return (
    <div className="p-5 space-y-5 max-w-[1200px] mx-auto pb-20 lg:pb-5">
      <h1 className="text-2xl font-bold text-[#EAF4FA] flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-purple-400" /> Historical Intelligence
      </h1>

      <div className="bg-[#0E1821] border border-[#26333F] rounded-lg p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-[#8EA3B3]" />
          <input type="text" placeholder="Search drilling history..." className="w-full bg-[#14232E] border border-[#26333F] rounded-md pl-10 pr-4 py-2 text-[#EAF4FA] focus:outline-none focus:border-[#4DA3FF]" />
        </div>
        <div className="flex gap-3 text-sm">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#14232E] border border-[#26333F] text-[#EAF4FA]"><Filter className="w-4 h-4"/> Filter</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {DEMO_INCIDENTS.map(inc => (
          <div key={inc.id} className="bg-[#0E1821] border border-[#26333F] rounded-lg p-5">
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${inc.severity === 'Severe' ? 'bg-[#FF5964]/10 text-[#FF5964]' : 'bg-[#F4B942]/10 text-[#F4B942]'}`}>{inc.severity}</span>
              <span className="text-xs text-[#8EA3B3]">{inc.date}</span>
            </div>
            <h3 className="text-lg font-bold text-[#EAF4FA] mb-1">{inc.eventType}</h3>
            <div className="text-xs font-mono text-[#8EA3B3] mb-3">{inc.wellId} • {inc.depthM}m MD • {inc.formation}</div>
            <p className="text-sm text-[#EAF4FA] mb-3">{inc.description}</p>
            <div className="bg-[#14232E] rounded p-3 text-xs text-[#8EA3B3] mb-4">
              <span className="font-semibold text-[#F4B942]">Mitigation: </span>{inc.mitigation}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-[#26333F]">
              <span className="text-[10px] text-[#8EA3B3] flex items-center gap-1"><BookOpen className="w-3 h-3"/> {inc.sourceDoc} (p.{inc.sourcePage})</span>
              <button onClick={() => handleOpen(inc)} className="text-xs font-semibold text-[#4DA3FF] hover:underline">OPEN SOURCE</button>
            </div>
          </div>
        ))}
      </div>
      <EvidenceViewer />
    </div>
  );
}

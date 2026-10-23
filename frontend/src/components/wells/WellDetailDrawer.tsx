'use client';
import React from 'react';
import { X, MapPin, AlertTriangle, BookOpen, BarChart3, Clock, ExternalLink } from 'lucide-react';
import { useDrillStore, OffsetWellItem } from '@/store/useDrillStore';
import Link from 'next/link';

interface WellDetailDrawerProps {
  well: OffsetWellItem;
  onClose: () => void;
}

export const WellDetailDrawer: React.FC<WellDetailDrawerProps> = ({ well, onClose }) => {
  const { setSelectedEvidence, setEvidenceViewerOpen } = useDrillStore();

  const handleEvidence = () => {
    setSelectedEvidence({
      id: `ev-${well.id}`,
      sourceDoc: `WCR_${well.id}.pdf`,
      wellId: well.id,
      incidentType: well.hazard,
      depthM: well.totalDepthM || 3000,
      mitigation: 'Standard mitigation applied based on historical records.',
    });
    setEvidenceViewerOpen(true);
  };

  return (
    <div className="w-[350px] bg-[#0E1821] border-l border-[#26333F] h-full flex flex-col shadow-xl">
      <div className="flex items-center justify-between p-4 border-b border-[#26333F]">
        <h2 className="text-lg font-bold text-[#EAF4FA]">{well.name}</h2>
        <button onClick={onClose} className="p-1 text-[#8EA3B3] hover:text-[#EAF4FA] rounded">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 rounded bg-[#4DA3FF]/10 text-[#4DA3FF] text-[10px] font-bold border border-[#4DA3FF]/30">
            {well.distanceKm.toFixed(1)} km OFFSET
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
            well.status === 'critical' ? 'bg-[#FF5964]/10 text-[#FF5964] border-[#FF5964]/30' :
            well.status === 'warning' ? 'bg-[#F4B942]/10 text-[#F4B942] border-[#F4B942]/30' :
            'bg-[#32D296]/10 text-[#32D296] border-[#32D296]/30'
          }`}>
            {well.status} RISK
          </span>
        </div>

        <div className="space-y-3 mb-6 bg-[#14232E] rounded-lg p-3 border border-[#26333F]">
          <div className="flex justify-between text-xs">
            <span className="text-[#8EA3B3]">Formation</span>
            <span className="text-[#F4B942]">{well.formation}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#8EA3B3]">Total Depth</span>
            <span className="font-mono text-[#EAF4FA]">{well.totalDepthM}m TD</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#8EA3B3]">Risk Score</span>
            <span className="font-mono text-[#FF5964]">{well.riskScore}/100</span>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-[#EAF4FA] mb-3">Historical Events</h3>
        <div className="bg-[#071018] rounded border border-[#26333F] p-3 mb-6">
          <div className="text-xs text-[#EAF4FA] font-medium mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF5964]" /> {well.hazard}
          </div>
          <div className="text-[10px] text-[#8EA3B3] font-mono">NPT: {well.nptHours} hours</div>
        </div>

        <div className="space-y-2">
          <Link href={`/wells/${well.id}`} className="w-full flex items-center justify-center gap-2 py-2 bg-[#4DA3FF] hover:bg-[#4DA3FF]/90 text-[#071018] text-sm font-semibold rounded-lg transition-colors">
            OPEN WELL 360 <ExternalLink className="w-4 h-4" />
          </Link>
          <button onClick={handleEvidence} className="w-full flex items-center justify-center gap-2 py-2 bg-[#26333F] hover:bg-[#1A2E3D] text-[#EAF4FA] text-sm font-semibold rounded-lg transition-colors">
            <BookOpen className="w-4 h-4" /> VIEW EVIDENCE
          </button>
        </div>
      </div>
    </div>
  );
};

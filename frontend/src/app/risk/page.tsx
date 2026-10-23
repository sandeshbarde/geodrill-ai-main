'use client';
import React from 'react';
import { useDrillStore } from '@/store/useDrillStore';
import { ShieldAlert, BookOpen, ExternalLink, MapPin } from 'lucide-react';
import Link from 'next/link';
import { EvidenceViewer } from '@/components/evidence/EvidenceViewer';

export default function RiskPage() {
  const { telemetry, risk, setEvidenceViewerOpen, setSelectedEvidence, backendStatus } = useDrillStore();

  const handleOpenEvidence = () => {
    setSelectedEvidence({
      id: 'ev-1',
      sourceDoc: risk.offsetWellCitation.includes('WCR') ? 'WCR_15_9_F_11B.pdf' : 'DDR_15_9_F_12.pdf',
      wellId: risk.offsetWellCitation.includes('11B') ? '15/9-F-11B' : '15/9-F-12',
      incidentType: risk.predictedHazard,
      depthM: telemetry.measuredDepthM,
      mitigation: risk.immediateAction,
      confidence: risk.riskScore > 80 ? 94 : 82,
    });
    setEvidenceViewerOpen(true);
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (risk.riskScore / 100) * circumference;
  const riskColor = risk.riskLevel === 'critical' ? '#FF5964' : risk.riskLevel === 'high' ? '#FB923C' : risk.riskLevel === 'medium' ? '#F4B942' : '#32D296';

  const hazards = [
    { name: 'Mud Loss', prob: 82, level: 'HIGH' },
    { name: 'Stuck Pipe', prob: 34, level: 'MEDIUM' },
    { name: 'Kick/Influx', prob: 19, level: 'LOW' },
    { name: 'Overpressure', prob: 61, level: 'HIGH' },
    { name: 'Torque Spike', prob: 73, level: 'HIGH' },
    { name: 'Cementing Issue', prob: 24, level: 'LOW' },
  ];

  return (
    <div className="p-5 space-y-5 max-w-[1600px] mx-auto pb-20 lg:pb-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#EAF4FA]">Predictive Risk Center</h1>
          <p className="text-sm text-[#8EA3B3] mt-1">
            Formation: <span className="text-[#F4B942]">{telemetry.currentFormation}</span> • 
            Depth: <span className="font-mono text-[#EAF4FA]">{telemetry.measuredDepthM.toFixed(1)}m MD</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Overall Risk */}
        <div className="lg:col-span-2 bg-[#0E1821] border border-[#26333F] rounded-xl p-6 flex flex-col items-center text-center">
          <div className="relative w-40 h-40 mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="40" fill="none" stroke="#26333F" strokeWidth="8" />
              <circle cx="80" cy="80" r="40" fill="none" stroke={riskColor} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-mono text-[#EAF4FA]">{risk.riskScore}</span>
              <span className="text-[10px] text-[#8EA3B3] uppercase">Score</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-wide mb-1" style={{ color: riskColor }}>
            {risk.riskLevel} RISK
          </h2>
          <p className="text-sm text-[#8EA3B3] mb-4">
            {telemetry.currentFormation} • {telemetry.nextFormationDepthM - telemetry.measuredDepthM > 0 ? (telemetry.nextFormationDepthM - telemetry.measuredDepthM).toFixed(0) : 0}m MD ahead
          </p>
        </div>

        {/* Risk Drivers */}
        <div className="lg:col-span-3 bg-[#0E1821] border border-[#26333F] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-[#EAF4FA] mb-5">Risk Drivers</h3>
          <div className="space-y-4">
            {[
              { label: 'CURRENT DEPTH', val: 95, color: 'bg-[#FF5964]' },
              { label: 'FORMATION MATCH', val: 91, color: 'bg-orange-400' },
              { label: 'OFFSET EVIDENCE', val: 86, color: 'bg-orange-400' },
              { label: 'TELEMETRY ANOMALY', val: 61, color: 'bg-[#F4B942]' },
            ].map(d => (
              <div key={d.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#8EA3B3] font-medium">{d.label}</span>
                  <span className="font-mono text-[#EAF4FA]">{d.val}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#26333F] rounded-full overflow-hidden">
                  <div className={`h-full ${d.color}`} style={{ width: `${d.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hazard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {hazards.map(h => (
          <div key={h.name} className="bg-[#0E1821] border border-[#26333F] rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-[#EAF4FA]">{h.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${h.level === 'HIGH' ? 'bg-[#FF5964]/10 text-[#FF5964]' : h.level === 'MEDIUM' ? 'bg-[#F4B942]/10 text-[#F4B942]' : 'bg-[#32D296]/10 text-[#32D296]'}`}>
                {h.level}
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-[#EAF4FA] mb-2">{h.prob}%</div>
            <div className="h-1 w-full bg-[#26333F] rounded-full overflow-hidden mb-4">
              <div className={`h-full ${h.level === 'HIGH' ? 'bg-[#FF5964]' : h.level === 'MEDIUM' ? 'bg-[#F4B942]' : 'bg-[#32D296]'}`} style={{ width: `${h.prob}%` }} />
            </div>
            <button onClick={handleOpenEvidence} className="text-[11px] text-[#4DA3FF] hover:underline flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> WHY THIS RISK?
            </button>
          </div>
        ))}
      </div>

      <EvidenceViewer />
    </div>
  );
}

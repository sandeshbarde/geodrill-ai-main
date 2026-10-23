'use client';
import React, { useState } from 'react';
import { useDrillStore } from '@/store/useDrillStore';
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, Clock, Filter, Search } from 'lucide-react';
import { EvidenceViewer } from '@/components/evidence/EvidenceViewer';

const DEMO_ALERTS = [
  { id: 'a1', severity: 'critical', hazard: 'Mud Loss Risk', depth: 2450, formation: 'Hugin', conf: 94, status: 'active', time: '15:38', text: 'Approaching predicted loss horizon at 2450m.' },
  { id: 'a2', severity: 'high', hazard: 'Torque Anomaly', depth: 2445, formation: 'Hugin', conf: 78, status: 'active', time: '15:40', text: 'Torque trending 12% above baseline.' },
  { id: 'a3', severity: 'high', hazard: 'Formation Transition', depth: 2420, formation: 'Hugin Top', conf: 88, status: 'acknowledged', time: '15:20', text: 'Entering Hugin sandstone top.' },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(DEMO_ALERTS);
  const { setEvidenceViewerOpen, setSelectedEvidence } = useDrillStore();

  const handleAck = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
  };

  const counts = {
    active: alerts.filter(a => a.status === 'active').length,
    ack: alerts.filter(a => a.status === 'acknowledged').length
  };

  return (
    <div className="p-5 space-y-5 max-w-[1200px] mx-auto pb-20 lg:pb-5">
      <h1 className="text-2xl font-bold text-[#EAF4FA] flex items-center gap-2">
        <Bell className="w-6 h-6 text-[#4DA3FF]" /> Alert Center
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0E1821] border border-[#26333F] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#8EA3B3] uppercase">Active Alerts</div>
            <div className="text-2xl font-mono font-bold text-[#FF5964]">{counts.active}</div>
          </div>
          <AlertCircle className="w-8 h-8 text-[#FF5964]/20" />
        </div>
        <div className="bg-[#0E1821] border border-[#26333F] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#8EA3B3] uppercase">Acknowledged</div>
            <div className="text-2xl font-mono font-bold text-[#F4B942]">{counts.ack}</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-[#F4B942]/20" />
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map(a => (
          <div key={a.id} className="bg-[#0E1821] border border-[#26333F] rounded-lg overflow-hidden flex">
            <div className={`w-1.5 ${a.severity === 'critical' ? 'bg-[#FF5964]' : 'bg-orange-400'}`} />
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-[#EAF4FA] text-lg">{a.hazard}</h3>
                  <div className="flex gap-3 text-[11px] font-mono text-[#8EA3B3] mt-1">
                    <span>{a.depth}m MD</span>
                    <span>•</span>
                    <span>{a.formation}</span>
                    <span>•</span>
                    <span className="text-[#32D296]">Conf {a.conf}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] text-[#8EA3B3] flex items-center gap-1"><Clock className="w-3 h-3"/> {a.time}</span>
                  {a.status === 'acknowledged' ? (
                    <span className="px-2 py-0.5 rounded bg-[#32D296]/10 text-[#32D296] text-[10px] font-bold border border-[#32D296]/30">ACKNOWLEDGED</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-[#FF5964]/10 text-[#FF5964] text-[10px] font-bold border border-[#FF5964]/30">ACTIVE</span>
                  )}
                </div>
              </div>
              <div className="bg-[#14232E] rounded p-3 text-sm text-[#EAF4FA] mb-3">
                {a.text}
              </div>
              <div className="flex gap-2">
                {a.status === 'active' && (
                  <button onClick={() => handleAck(a.id)} className="px-3 py-1.5 bg-[#32D296]/10 text-[#32D296] hover:bg-[#32D296]/20 text-xs font-semibold rounded transition-colors">
                    ACKNOWLEDGE
                  </button>
                )}
                <button 
                  onClick={() => {
                    setSelectedEvidence({ id: 'a', sourceDoc: 'Historical Baseline', wellId: 'System', incidentType: a.hazard, depthM: a.depth, confidence: a.conf });
                    setEvidenceViewerOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#26333F] text-[#EAF4FA] hover:bg-[#1A2E3D] text-xs font-semibold rounded transition-colors"
                >
                  VIEW EVIDENCE
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <EvidenceViewer />
    </div>
  );
}

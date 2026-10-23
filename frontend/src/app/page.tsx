'use client';
import React from 'react';
import Link from 'next/link';
import { useDrillStore } from '@/store/useDrillStore';
import { TriageHero } from '@/components/triage/TriageHero';
import { TelemetryGauges } from '@/components/telemetry/TelemetryGauges';
import {
  Crosshair, Layers, MapPin, AlertTriangle, BookOpen,
  Activity, Clock, ArrowRight, ShieldAlert, CheckCircle2,
} from 'lucide-react';

const RISK_COLORS: Record<string, string> = {
  low: 'text-[#32D296] bg-[#32D296]/10 border-[#32D296]/30',
  medium: 'text-[#F4B942] bg-[#F4B942]/10 border-[#F4B942]/30',
  high: 'text-orange-400 bg-orange-900/20 border-orange-500/30',
  critical: 'text-[#FF5964] bg-[#FF5964]/10 border-[#FF5964]/30',
};

const KPI_RISK_COLOR = (score: number) =>
  score >= 75 ? 'text-[#FF5964]' : score >= 50 ? 'text-orange-400' : score >= 25 ? 'text-[#F4B942]' : 'text-[#32D296]';

export default function OverviewPage() {
  const { telemetry, risk, activeWellId, field, operator, backendStatus } = useDrillStore();
  const t = telemetry;

  const KPI_ITEMS = [
    { label: 'DEPTH', value: t.measuredDepthM.toFixed(1), unit: 'm MD', sub: `${t.trueVerticalDepthM.toFixed(1)} TVD`, color: 'text-[#EAF4FA]' },
    { label: 'ROP', value: t.rop.toFixed(1), unit: 'm/hr', color: t.rop > 20 ? 'text-[#32D296]' : t.rop > 10 ? 'text-[#F4B942]' : 'text-[#FF5964]' },
    { label: 'WOB', value: t.wob.toFixed(1), unit: 'klbs', color: 'text-[#4DA3FF]' },
    { label: 'TORQUE', value: t.torque.toFixed(1), unit: 'kft-lb', color: 'text-purple-400' },
    { label: 'SPP', value: t.standpipePressure.toFixed(0), unit: 'psi', color: 'text-[#EAF4FA]' },
    { label: 'FLOW', value: t.flowRate.toFixed(0), unit: 'gpm', color: 'text-[#4DA3FF]' },
    { label: 'MUD WT', value: t.mudWeightSg.toFixed(2), unit: 'SG', color: 'text-[#F4B942]' },
    { label: 'RISK', value: `${risk.riskScore}`, unit: '/100', color: KPI_RISK_COLOR(risk.riskScore) },
  ];

  const NEARBY_WELLS = [
    { name: 'KG-07-ALOK', dist: '2.4 km', risk: 'CRITICAL', color: 'text-[#FF5964]', dot: 'bg-[#FF5964]' },
    { name: 'KG-12-BRAVO', dist: '5.1 km', risk: 'HIGH', color: 'text-orange-400', dot: 'bg-orange-400' },
    { name: 'KG-04-DELTA', dist: '8.3 km', risk: 'MED', color: 'text-[#F4B942]', dot: 'bg-[#F4B942]' },
  ];

  const EVIDENCE_ITEMS = [
    { well: 'KG-07-ALOK', depth: '3180m', type: 'Mud Loss', sev: 'SEVERE', src: 'WCR p.18' },
    { well: 'KG-12-BRAVO', depth: '3210m', type: 'Partial Loss', sev: 'MODERATE', src: 'DDR p.42' },
  ];

  return (
    <div className="p-5 space-y-5 max-w-[1600px] mx-auto pb-20 lg:pb-5">

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#EAF4FA]">Operational Overview</h1>
          <p className="text-sm text-[#8EA3B3] mt-1">
            Active Well: <span className="text-[#EAF4FA] font-mono">{activeWellId}</span>
            {' '}·{' '}{field}
            {' '}·{' '}<span className="text-[#32D296]">Status: Drilling Active</span>
          </p>
        </div>
        {backendStatus !== 'online' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F4B942]/10 border border-[#F4B942]/30 text-[#F4B942] text-[11px] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F4B942]" />
            DEMO MODE — Simulation data
          </div>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
        {KPI_ITEMS.map((kpi) => (
          <div key={kpi.label} className="bg-[#0E1821] border border-[#26333F] rounded-lg px-3 py-2.5">
            <div className="text-[10px] text-[#8EA3B3] uppercase tracking-wider font-medium">{kpi.label}</div>
            <div className={`font-mono font-bold text-lg leading-tight mt-0.5 ${kpi.color}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {kpi.value}<span className="text-[10px] text-[#8EA3B3] font-normal ml-0.5">{kpi.unit}</span>
            </div>
            {kpi.sub && <div className="text-[10px] text-[#8EA3B3] font-mono">{kpi.sub}</div>}
          </div>
        ))}
      </div>

      {/* Triage Hero */}
      <TriageHero />

      {/* Main 2-column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Active Well Status */}
        <div className="lg:col-span-2 bg-[#0E1821] border border-[#26333F] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#26333F]">
            <div className="p-1.5 rounded-lg bg-[#4DA3FF]/10 border border-[#4DA3FF]/20">
              <Crosshair className="w-4 h-4 text-[#4DA3FF]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#EAF4FA]">Active Well Status</h2>
              <p className="text-[10px] text-[#8EA3B3] font-mono">{activeWellId}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-[#32D296]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#32D296] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#32D296]" />
              </span>
              DRILLING ACTIVE
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-[#8EA3B3] uppercase">Measured Depth</div>
                <div className="font-mono font-bold text-xl text-[#EAF4FA]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {t.measuredDepthM.toFixed(1)}<span className="text-xs text-[#8EA3B3] ml-1">m MD</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#8EA3B3] uppercase">True Vertical</div>
                <div className="font-mono font-bold text-xl text-[#8EA3B3]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {t.trueVerticalDepthM.toFixed(1)}<span className="text-xs text-[#8EA3B3]/60 ml-1">m TVD</span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-[#26333F] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8EA3B3]">Formation</span>
                <span className="text-[#F4B942] font-medium flex items-center gap-1"><Layers className="w-3 h-3" />{t.currentFormation}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8EA3B3]">Next Formation</span>
                <span className="text-[#EAF4FA] font-mono text-[11px]">{t.nextFormation} @ {t.nextFormationDepthM.toFixed(0)}m</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8EA3B3]">Field</span>
                <span className="text-[#EAF4FA]">{field}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8EA3B3]">Operator</span>
                <span className="text-[#EAF4FA]">{operator}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8EA3B3]">Drilling Phase</span>
                <span className="px-2 py-0.5 rounded bg-[#4DA3FF]/10 border border-[#4DA3FF]/20 text-[#4DA3FF] text-[10px] font-mono uppercase">Production Drilling</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8EA3B3]">Inclination</span>
                <span className="text-[#EAF4FA] font-mono">24.5°</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8EA3B3]">Azimuth</span>
                <span className="text-[#EAF4FA] font-mono">187.3°</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk & Recommendation */}
        <div className={`lg:col-span-3 rounded-xl p-5 border ${RISK_COLORS[risk.riskLevel]}`}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-current/20">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <h2 className="text-sm font-semibold">Risk & Recommended Action</h2>
            </div>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${RISK_COLORS[risk.riskLevel]}`}>
              {risk.riskLevel.toUpperCase()} RISK
            </span>
          </div>
          <div className="mb-4">
            <div className="text-sm font-semibold text-[#EAF4FA] mb-1">{risk.predictedHazard}</div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="text-center">
                <div className="text-[10px] text-[#8EA3B3] uppercase">Historical Matches</div>
                <div className="font-mono font-bold text-lg text-[#EAF4FA]">3</div>
                <div className="text-[10px] text-[#8EA3B3]">offset wells</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-[#8EA3B3] uppercase">Confidence</div>
                <div className="font-mono font-bold text-lg text-[#32D296]">94.2%</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-[#8EA3B3] uppercase">Risk Score</div>
                <div className={`font-mono font-bold text-lg ${KPI_RISK_COLOR(risk.riskScore)}`}>{risk.riskScore}/100</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg p-3 bg-black/20 border border-current/20 mb-4">
            <div className="text-[10px] text-[#8EA3B3] uppercase mb-1">Recommended Action</div>
            <p className="text-sm text-[#EAF4FA] leading-relaxed">{risk.immediateAction}</p>
          </div>
          <div className="rounded-lg p-2.5 bg-black/10 border border-[#26333F] mb-4 flex items-start gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#8EA3B3] mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-[#8EA3B3] italic">{risk.offsetWellCitation}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/nearby-wells" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4DA3FF]/10 border border-[#4DA3FF]/30 text-[#4DA3FF] text-xs font-medium hover:bg-[#4DA3FF]/20 transition-colors">
              <MapPin className="w-3.5 h-3.5" /> VIEW OFFSET WELLS
            </Link>
            <Link href="/risk" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#26333F] border border-[#26333F] text-[#EAF4FA] text-xs font-medium hover:bg-[#14232E] transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" /> VIEW EVIDENCE
            </Link>
            <Link href="/alerts" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#32D296]/10 border border-[#32D296]/30 text-[#32D296] text-xs font-medium hover:bg-[#32D296]/20 transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" /> ACKNOWLEDGE
            </Link>
          </div>
        </div>
      </div>

      {/* Lower 4-column summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nearby Wells Summary */}
        <div className="bg-[#0E1821] border border-[#26333F] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#EAF4FA] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#4DA3FF]" /> Nearby Wells
            </h3>
            <Link href="/nearby-wells" className="text-[11px] text-[#4DA3FF] hover:underline flex items-center gap-0.5">
              VIEW ALL <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {NEARBY_WELLS.map((w) => (
              <div key={w.name} className="flex items-center gap-2 py-1">
                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${w.dot}`} />
                <span className="text-xs font-mono text-[#EAF4FA] flex-1 truncate">{w.name}</span>
                <span className="text-[10px] text-[#8EA3B3]">{w.dist}</span>
                <span className={`text-[10px] font-bold ${w.color}`}>{w.risk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Telemetry */}
        <div className="bg-[#0E1821] border border-[#26333F] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#EAF4FA] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#32D296]" /> Live Telemetry
            </h3>
            <Link href="/operations" className="text-[11px] text-[#4DA3FF] hover:underline flex items-center gap-0.5">
              FULL VIEW <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <TelemetryGauges />
        </div>

        {/* Historical Evidence */}
        <div className="bg-[#0E1821] border border-[#26333F] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#EAF4FA] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" /> Historical Evidence
            </h3>
            <Link href="/history" className="text-[11px] text-[#4DA3FF] hover:underline flex items-center gap-0.5">
              VIEW ALL <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {EVIDENCE_ITEMS.map((e) => (
              <div key={e.well} className="rounded-lg bg-[#14232E] p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-[#EAF4FA]">{e.well}</span>
                  <span className="text-[10px] text-[#FF5964] font-bold">{e.sev}</span>
                </div>
                <div className="text-[11px] text-[#EAF4FA]">{e.type}</div>
                <div className="text-[10px] text-[#8EA3B3] font-mono">{e.depth} · {e.src}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-[#0E1821] border border-[#26333F] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#EAF4FA] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF5964]" /> Active Alerts
            </h3>
            <Link href="/alerts" className="text-[11px] text-[#4DA3FF] hover:underline flex items-center gap-0.5">
              MANAGE <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-center">
              <div className="text-xl font-bold text-[#FF5964] font-mono">1</div>
              <div className="text-[10px] text-[#8EA3B3]">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400 font-mono">2</div>
              <div className="text-[10px] text-[#8EA3B3]">High</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#F4B942] font-mono">1</div>
              <div className="text-[10px] text-[#8EA3B3]">Medium</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="rounded-lg bg-[#FF5964]/10 border border-[#FF5964]/20 p-2.5 text-xs">
              <div className="font-semibold text-[#FF5964] uppercase text-[10px]">CRITICAL</div>
              <div className="text-[#EAF4FA] mt-0.5">Mud Loss Risk · 2450m</div>
              <div className="text-[#8EA3B3] text-[10px]">Confidence 94.2%</div>
            </div>
            <div className="rounded-lg bg-orange-900/20 border border-orange-500/20 p-2.5 text-xs">
              <div className="font-semibold text-orange-400 uppercase text-[10px]">HIGH</div>
              <div className="text-[#EAF4FA] mt-0.5">Torque Anomaly · 2445m</div>
              <div className="text-[#8EA3B3] text-[10px]">Confidence 78.5%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

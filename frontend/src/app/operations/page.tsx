'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDrillStore } from '@/store/useDrillStore';
import {
  Activity, Play, Pause, RotateCcw, ChevronDown,
  Gauge, Droplets, Weight, RotateCw, ArrowDown,
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const THRESHOLDS = {
  rop:   { warn: 25, crit: 35, unit: 'm/hr', label: 'ROP', color: '#32D296' },
  wob:   { warn: 35, crit: 45, unit: 'klbs', label: 'WOB', color: '#4DA3FF' },
  torque: { warn: 20, crit: 28, unit: 'kft-lb', label: 'TORQUE', color: '#8B5CF6' },
  spp:   { warn: 3500, crit: 4000, unit: 'psi', label: 'SPP', color: '#06B6D4' },
  flow:  { warn: 550, crit: 500, unit: 'gpm', label: 'FLOW', color: '#4DA3FF' },
  mud:   { warn: 1.55, crit: 1.65, unit: 'SG', label: 'MUD WT', color: '#F4B942' },
};

const MAX_POINTS = 80;
const REPLAY_RANGES = ['Last 5 min', 'Last 30 min', 'Last 1 hr', 'Last 6 hr'];

function MiniChart({ data, color, warnVal, critVal, label, unit }: {
  data: number[]; color: string; warnVal: number; critVal: number; label: string; unit: string;
}) {
  const labels = data.map((_, i) => '');
  const chartData = {
    labels,
    datasets: [{
      data,
      borderColor: color,
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.3,
      fill: true,
      backgroundColor: `${color}15`,
    }],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: {
        display: false,
        suggestedMax: critVal * 1.1,
        suggestedMin: 0,
      },
    },
  };
  return <Line data={chartData} options={options} />;
}

export default function LiveOperationsPage() {
  const telemetry = useDrillStore((s) => s.telemetry);
  const isSimulating = useDrillStore((s) => s.isSimulating);
  const toggleSimulation = useDrillStore((s) => s.toggleSimulation);
  const backendStatus = useDrillStore((s) => s.backendStatus);

  const [mode, setMode] = useState<'live' | 'paused' | 'replay'>('live');
  const [replayRange, setReplayRange] = useState('Last 30 min');
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  // History buffers — use refs to avoid re-renders
  const historyRef = useRef<Record<string, number[]>>({
    rop: [], wob: [], torque: [], spp: [], flow: [], mud: [],
  });
  const [tick, setTick] = useState(0);

  // Sample telemetry into history
  useEffect(() => {
    const h = historyRef.current;
    const push = (key: string, val: number) => {
      h[key] = [...h[key], val].slice(-MAX_POINTS);
    };
    push('rop', telemetry.rop);
    push('wob', telemetry.wob);
    push('torque', telemetry.torque);
    push('spp', telemetry.standpipePressure);
    push('flow', telemetry.flowRate);
    push('mud', telemetry.mudWeightSg);
    setLastUpdate(new Date().toLocaleTimeString());
    setTick((t) => t + 1); // trigger rerender every 10 samples
  }, [telemetry]);

  const kpis = [
    { label: 'ROP', value: telemetry.rop.toFixed(1), unit: 'm/hr', icon: Activity, color: '#32D296' },
    { label: 'WOB', value: telemetry.wob.toFixed(1), unit: 'klbs', icon: Weight, color: '#4DA3FF' },
    { label: 'RPM', value: '120', unit: 'rpm', icon: RotateCw, color: '#8B5CF6' },
    { label: 'TORQUE', value: telemetry.torque.toFixed(1), unit: 'kft-lb', icon: Gauge, color: '#8B5CF6' },
    { label: 'SPP', value: telemetry.standpipePressure.toFixed(0), unit: 'psi', icon: Gauge, color: '#06B6D4' },
    { label: 'FLOW', value: telemetry.flowRate.toFixed(0), unit: 'gpm', icon: Droplets, color: '#4DA3FF' },
    { label: 'MUD WEIGHT', value: telemetry.mudWeightSg.toFixed(2), unit: 'SG', icon: Droplets, color: '#F4B942' },
    { label: 'DEPTH', value: telemetry.measuredDepthM.toFixed(1), unit: 'm MD', icon: ArrowDown, color: '#EAF4FA' },
  ];

  const chartConfigs = [
    { key: 'rop', current: telemetry.rop, ...THRESHOLDS.rop },
    { key: 'wob', current: telemetry.wob, ...THRESHOLDS.wob },
    { key: 'torque', current: telemetry.torque, ...THRESHOLDS.torque },
    { key: 'spp', current: telemetry.standpipePressure, ...THRESHOLDS.spp },
    { key: 'flow', current: telemetry.flowRate, ...THRESHOLDS.flow },
    { key: 'mud', current: telemetry.mudWeightSg, ...THRESHOLDS.mud },
  ];

  return (
    <div className="p-5 space-y-5 max-w-[1600px] mx-auto pb-20 lg:pb-5">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#EAF4FA] flex items-center gap-3">
            <Activity className="w-6 h-6 text-[#32D296]" />
            LIVE OPERATIONS
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="relative flex h-2 w-2">
                {mode === 'live' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#32D296] opacity-75" />}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${mode === 'live' ? 'bg-[#32D296]' : 'bg-[#8EA3B3]'}`} />
              </span>
              <span className={`font-mono text-xs font-bold ${mode === 'live' ? 'text-[#32D296]' : 'text-[#8EA3B3]'}`}>
                {mode === 'live' ? 'STREAMING 10Hz' : mode === 'paused' ? 'PAUSED' : 'REPLAY'}
              </span>
            </div>
            <span className="text-[11px] text-[#8EA3B3] font-mono">Last update: {lastUpdate}</span>
            {backendStatus !== 'online' && (
              <span className="px-2 py-0.5 rounded bg-[#F4B942]/10 border border-[#F4B942]/20 text-[#F4B942] text-[10px] font-mono">DEMO MODE</span>
            )}
          </div>
        </div>

        {/* Mode controls */}
        <div className="flex items-center gap-2">
          {(['live', 'paused', 'replay'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                if (m === 'paused') toggleSimulation();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase border transition-all ${
                mode === m
                  ? 'bg-[#4DA3FF]/20 border-[#4DA3FF]/50 text-[#4DA3FF]'
                  : 'bg-[#0E1821] border-[#26333F] text-[#8EA3B3] hover:text-[#EAF4FA]'
              }`}
            >
              {m === 'live' ? <><span className="mr-1">●</span>LIVE</> : m === 'paused' ? 'PAUSE' : 'REPLAY'}
            </button>
          ))}
          {mode === 'replay' && (
            <div className="flex items-center gap-1">
              {REPLAY_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setReplayRange(r)}
                  className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                    replayRange === r
                      ? 'bg-[#14232E] border-[#4DA3FF]/40 text-[#4DA3FF]'
                      : 'border-[#26333F] text-[#8EA3B3] hover:text-[#EAF4FA]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {kpis.map(({ label, value, unit, icon: Icon, color }) => (
          <div key={label} className="bg-[#0E1821] border border-[#26333F] rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className="w-3.5 h-3.5" style={{ color }} />
              <span className="text-[10px] text-[#8EA3B3] uppercase tracking-wide">{label}</span>
            </div>
            <div className="font-mono font-bold text-xl" style={{ color, fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </div>
            <div className="text-[10px] text-[#8EA3B3] font-mono mt-0.5">{unit}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div>
        <h2 className="text-sm font-semibold text-[#EAF4FA] mb-3">Real-Time Telemetry Traces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {chartConfigs.map(({ key, current, warn, crit, unit, label, color }) => {
            const history = historyRef.current[key] || [];
            const isWarn = current > warn;
            const isCrit = current > crit;
            const displayColor = isCrit ? '#FF5964' : isWarn ? '#F4B942' : color;
            return (
              <div key={key} className="bg-[#0E1821] border border-[#26333F] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#8EA3B3] uppercase tracking-wide">{label}</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-lg" style={{ color: displayColor, fontVariantNumeric: 'tabular-nums' }}>
                      {current.toFixed(key === 'mud' ? 2 : key === 'rop' || key === 'wob' || key === 'torque' ? 1 : 0)}
                    </span>
                    <span className="text-[10px] text-[#8EA3B3] ml-1">{unit}</span>
                  </div>
                </div>
                <div className="h-28">
                  {history.length > 2 ? (
                    <MiniChart data={history} color={displayColor} warnVal={warn} critVal={crit} label={label} unit={unit} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#8EA3B3] text-xs">Collecting data...</div>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#26333F]">
                  <span className="flex items-center gap-1 text-[10px] text-[#8EA3B3]">
                    <span className="h-px w-3 bg-[#F4B942] block" /> Warn: {warn}{unit}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[#8EA3B3]">
                    <span className="h-px w-3 bg-[#FF5964] block" /> Crit: {crit}{unit}
                  </span>
                  {isCrit && <span className="text-[10px] font-bold text-[#FF5964] ml-auto">⚠ CRITICAL</span>}
                  {isWarn && !isCrit && <span className="text-[10px] font-bold text-[#F4B942] ml-auto">⚠ WARNING</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

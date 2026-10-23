'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useDrillStore, SCENARIO_PRESETS, ScenarioType } from '@/store/useDrillStore';
import { apiClient, toTelemetryPoint } from '@/lib/api';
import { Bell, Search, SlidersHorizontal, Play, Pause, Layers, ChevronDown, Activity } from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    activeWellId, field, telemetry, risk, isSimulating, isStreaming10Hz,
    selectedScenario, setScenario, toggleSimulation, toggle10HzStream,
    stepSimulation, setRisk, setBackendStatus, backendStatus,
    activeAlertCount, toggleGlobalSearch,
  } = useDrillStore();
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  // 10Hz live simulation ticker
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => { stepSimulation(); }, 100);
    return () => clearInterval(interval);
  }, [isSimulating, stepSimulation]);

  // API streaming interval
  useEffect(() => {
    if (!isStreaming10Hz) return;
    let busy = false;
    let ticks = 0;
    const interval = setInterval(async () => {
      if (busy) return;
      busy = true;
      const state = useDrillStore.getState();
      const point = toTelemetryPoint(state.activeWellId, state.telemetry);
      setLastUpdate(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      try {
        await apiClient.ingestTelemetry([point]);
        if (++ticks % 10 === 0) {
          const [prediction, alerts] = await Promise.all([
            apiClient.predictRisk(point, state.telemetry.currentFormation),
            apiClient.evaluateAlerts(point, state.telemetry.currentFormation),
          ]);
          const hasHistoricalEvidence = Object.values(prediction.hazards).some(
            (hazard) => (hazard.evidence?.length || 0) > 0
          );
          if (!hasHistoricalEvidence) { setBackendStatus('online'); return; }
          const ranked = Object.entries(prediction.hazards).sort((a, b) => b[1].probability - a[1].probability)[0];
          const alert = alerts.alerts[0];
          if (ranked) {
            const level = ranked[1].risk_level;
            const riskLevel = level === 'high' && alert?.severity === 'critical' ? 'critical' : level;
            setRisk({
              riskLevel: riskLevel as 'low' | 'medium' | 'high' | 'critical',
              riskScore: Math.round(ranked[1].probability * 100),
              predictedHazard: alert?.hazard || ranked[0].replace(/_/g, ' '),
              immediateAction: alerts.recommendations[0]?.action || 'Continue surveillance.',
              offsetWellCitation: ranked[1].evidence?.[0]?.source_doc || 'Backend predictive-risk baseline.',
              alertId: alert?.alert_id,
            });
          }
        }
        setBackendStatus('online');
      } catch {
        setBackendStatus('unavailable');
      } finally {
        busy = false;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isStreaming10Hz, setRisk, setBackendStatus]);

  const riskColors: Record<string, string> = {
    low: 'text-[#32D296]', medium: 'text-[#F4B942]', high: 'text-orange-400', critical: 'text-[#FF5964]',
  };

  return (
    <header className="bg-[#080F18] border-b border-[#26333F] h-11 flex items-center px-4 gap-0 sticky top-0 z-40 select-none flex-shrink-0">
      {/* Logo — mobile only (sidebar hidden on mobile) */}
      <div className="lg:hidden flex items-center pr-3 border-r border-[#26333F] mr-3">
        <Image
          src="/logo.jpg"
          alt="eRTMAC-NWIS"
          width={28}
          height={28}
          className="object-cover object-top rounded"
          priority
        />
      </div>

      {/* Active Well */}
      <div className="relative flex items-center gap-2 pr-4 border-r border-[#26333F]">
        <span className="text-[10px] text-[#8EA3B3] uppercase tracking-wide">Active Well</span>
        <button
          onClick={() => setShowScenarioMenu((s) => !s)}
          className="flex items-center gap-1 text-[#EAF4FA] font-mono text-xs font-bold hover:text-[#4DA3FF] transition-colors"
        >
          {activeWellId}
          <ChevronDown className="w-3 h-3 text-[#8EA3B3]" />
        </button>
        {showScenarioMenu && (
          <div className="absolute top-full left-0 mt-1 bg-[#0E1821] border border-[#26333F] rounded-lg shadow-2xl z-50 min-w-[260px] py-1">
            {Object.entries(SCENARIO_PRESETS).map(([key, item]) => (
              <button
                key={key}
                onClick={() => { setScenario(key as ScenarioType); setShowScenarioMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-[#14232E] transition-colors ${selectedScenario === key ? 'text-[#4DA3FF]' : 'text-[#EAF4FA]'}`}
              >
                <div className="font-medium">{item.name}</div>
                <div className="text-[10px] text-[#8EA3B3] mt-0.5 truncate">{item.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Depth */}
      <div className="flex items-center gap-2 px-4 border-r border-[#26333F]">
        <span className="text-[10px] text-[#8EA3B3] uppercase">Depth</span>
        <span className="font-mono text-xs font-bold text-[#EAF4FA]" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {telemetry.measuredDepthM.toFixed(1)}
          <span className="text-[10px] text-[#8EA3B3] font-normal ml-0.5">m MD</span>
        </span>
        <span className="text-[#26333F]">/</span>
        <span className="font-mono text-xs text-[#8EA3B3]" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {telemetry.trueVerticalDepthM.toFixed(1)}
          <span className="text-[10px] ml-0.5">m TVD</span>
        </span>
      </div>

      {/* Formation */}
      <div className="hidden md:flex items-center gap-2 px-4 border-r border-[#26333F]">
        <Layers className="w-3.5 h-3.5 text-[#F4B942]" />
        <span className="text-xs font-medium text-[#F4B942]">{telemetry.currentFormation}</span>
      </div>

      {/* Risk */}
      <div className="hidden lg:flex items-center gap-2 px-4 border-r border-[#26333F]">
        <span className="text-[10px] text-[#8EA3B3] uppercase">Risk</span>
        <span className={`font-mono text-xs font-bold ${riskColors[risk.riskLevel]}`}>
          {risk.riskScore}<span className="text-[10px] font-normal text-[#8EA3B3]">/100</span>
        </span>
        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
          risk.riskLevel === 'critical' ? 'bg-[#FF5964]/10 text-[#FF5964]' :
          risk.riskLevel === 'high' ? 'bg-orange-900/30 text-orange-400' :
          risk.riskLevel === 'medium' ? 'bg-[#F4B942]/10 text-[#F4B942]' : 'bg-[#32D296]/10 text-[#32D296]'
        }`}>
          {risk.riskLevel.toUpperCase()}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status */}
      <div className="flex items-center gap-3 pl-3">
        {/* Connection status */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono">
          <span className="relative flex h-1.5 w-1.5">
            {isStreaming10Hz && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#32D296] opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isStreaming10Hz ? 'bg-[#32D296]' : 'bg-[#8EA3B3]'}`} />
          </span>
          <span className={isStreaming10Hz ? 'text-[#32D296]' : 'text-[#8EA3B3]'}>
            {backendStatus === 'online' ? 'LIVE' : backendStatus === 'unavailable' ? 'DEMO' : 'DEMO'}
          </span>
          {lastUpdate && <span className="text-[#8EA3B3]/60 hidden lg:inline">{lastUpdate}</span>}
        </div>

        {/* Simulate toggle */}
        <button
          onClick={toggleSimulation}
          title={isSimulating ? 'Pause simulation' : 'Start 10Hz simulation'}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono transition-all ${
            isSimulating
              ? 'bg-[#F4B942]/10 text-[#F4B942] border border-[#F4B942]/30'
              : 'bg-[#4DA3FF]/10 text-[#4DA3FF] border border-[#4DA3FF]/30 hover:bg-[#4DA3FF]/20'
          }`}
        >
          {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span className="hidden md:inline">{isSimulating ? 'Pause' : 'Simulate'}</span>
        </button>

        {/* Alert bell */}
        <button className="relative p-1.5 text-[#8EA3B3] hover:text-[#EAF4FA] transition-colors">
          <Bell className="w-4 h-4" />
          {activeAlertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#FF5964] text-white text-[9px] font-bold flex items-center justify-center">
              {activeAlertCount}
            </span>
          )}
        </button>

        {/* Search */}
        <button
          onClick={toggleGlobalSearch}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0E1821] border border-[#26333F] text-[11px] text-[#8EA3B3] hover:text-[#EAF4FA] hover:border-[#4DA3FF]/50 transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Search</span>
          <kbd className="hidden lg:inline text-[9px] px-1 rounded bg-[#26333F]">⌘K</kbd>
        </button>
      </div>
    </header>
  );
};

'use client';
import React from 'react';
import { GeminiChat } from '@/components/ai/GeminiChat';
import { Bot } from 'lucide-react';
import { useDrillStore } from '@/store/useDrillStore';

export default function CopilotPage() {
  const { activeWellId, telemetry } = useDrillStore();

  return (
    <div className="p-5 space-y-5 max-w-[1600px] mx-auto pb-20 lg:pb-5 h-full flex flex-col">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-[#EAF4FA] flex items-center gap-2">
          <Bot className="w-6 h-6 text-[#4DA3FF]" /> AI DRILLING COPILOT
        </h1>
        <p className="text-sm text-[#8EA3B3] mt-1">Context: Active Well {activeWellId} • Formation: {telemetry.currentFormation} • Depth: {telemetry.measuredDepthM.toFixed(1)}m</p>
      </div>

      <div className="flex-1 rounded-xl border border-[#26333F] overflow-hidden bg-[#0E1821] min-h-[500px]">
        <GeminiChat />
      </div>
    </div>
  );
}

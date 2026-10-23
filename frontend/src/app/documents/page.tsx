'use client';
import React from 'react';
import { SmartIngestionStudio } from '@/components/ai/SmartIngestionStudio';
import { FileText } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div className="p-5 space-y-5 max-w-[1600px] mx-auto pb-20 lg:pb-5">
      <div>
        <h1 className="text-2xl font-bold text-[#EAF4FA] flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#4DA3FF]" /> Document Intelligence
        </h1>
        <p className="text-sm text-[#8EA3B3] mt-1">Upload and process WCR, DDR, LAS, and WITSML files</p>
      </div>
      <div className="bg-[#0E1821] rounded-xl border border-[#26333F] overflow-hidden">
        <SmartIngestionStudio />
      </div>
    </div>
  );
}

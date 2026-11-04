'use client';

import React, { useState } from 'react';
import { SmartIngestionStudio } from '@/components/ai/SmartIngestionStudio';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Database,
  Layers,
  ShieldAlert,
  HardDrive,
  FileCode,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface ExportFileItem {
  id: string;
  name: string;
  description: string;
  filename: string;
  type: 'csv' | 'json';
  category: 'wells' | 'geology' | 'drilling' | 'raw';
  sizeEstimate: string;
}

const EXPORTABLE_FILES: ExportFileItem[] = [
  {
    id: 'extracted-reports-json',
    name: 'Extracted Reports Master (Full JSON)',
    description: 'Complete multi-well extraction payload with headers, events, tops, and casing.',
    filename: 'extracted_reports.json',
    type: 'json',
    category: 'raw',
    sizeEstimate: '6.2 KB',
  },
  {
    id: 'wells-csv',
    name: 'Wells Master Catalog (CSV)',
    description: 'Well metadata including operators, fields, spud dates, TD, and coordinates.',
    filename: 'wells.csv',
    type: 'csv',
    category: 'wells',
    sizeEstimate: '1.2 KB',
  },
  {
    id: 'events-csv',
    name: 'Drilling Events & Hazards (CSV)',
    description: 'Mud losses, kicks, stuck pipe incidents with verbatim source citations & depths.',
    filename: 'events.csv',
    type: 'csv',
    category: 'drilling',
    sizeEstimate: '3.3 KB',
  },
  {
    id: 'formation-tops-csv',
    name: 'Geological Formation Tops (CSV)',
    description: 'Stratigraphic boundaries, top/base depths, and lithology descriptions.',
    filename: 'formation_tops.csv',
    type: 'csv',
    category: 'geology',
    sizeEstimate: '1.6 KB',
  },
  {
    id: 'casing-program-csv',
    name: 'Casing Program Records (CSV)',
    description: 'Conductor, surface, intermediate, and production casing sizes & depths.',
    filename: 'casing_program.csv',
    type: 'csv',
    category: 'drilling',
    sizeEstimate: '1.1 KB',
  },
  {
    id: 'mud-program-csv',
    name: 'Mud Program & Hydraulics (CSV)',
    description: 'Depth intervals, mud types, specific gravity (SG), and observed fluid losses.',
    filename: 'mud_program.csv',
    type: 'csv',
    category: 'drilling',
    sizeEstimate: '1.0 KB',
  },
  {
    id: 'cementing-records-csv',
    name: 'Cementing Job Logs (CSV)',
    description: 'Cement stages, slurries, pump volumes (bbl), top of cement, and issues noted.',
    filename: 'cementing_records.csv',
    type: 'csv',
    category: 'drilling',
    sizeEstimate: '850 B',
  },
  {
    id: 'documents-csv',
    name: 'Processed Documents Index (CSV)',
    description: 'Provenance registry with MD5 hashes, OCR statuses, and extraction metadata.',
    filename: 'documents.csv',
    type: 'csv',
    category: 'raw',
    sizeEstimate: '400 B',
  },
];

export default function DocumentsPage() {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownload = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/data/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadAll = () => {
    EXPORTABLE_FILES.forEach((f, idx) => {
      setTimeout(() => {
        handleDownload(f.filename);
      }, idx * 250);
    });
  };

  return (
    <div className="p-3 sm:p-5 space-y-6 max-w-[1600px] mx-auto pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#EAF4FA] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#4DA3FF]" /> Document Intelligence & Data Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#8EA3B3] mt-1">
            Upload drilling records (WCR/DDR/LAS) or download structured operational datasets
          </p>
        </div>

        <button
          onClick={handleDownloadAll}
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#4DA3FF] hover:bg-[#3D8BE6] text-white text-xs font-semibold font-mono shadow-lg transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Download All Data Files</span>
        </button>
      </div>

      {/* Download Alert Toast */}
      {downloadSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-mono shadow-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Successfully initiated download for: <strong>{downloadSuccess}</strong></span>
        </div>
      )}

      {/* Section 1: Ingestion & Upload Studio */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> 1. Upload & Ingest Documents
          </h2>
          <span className="text-[11px] font-mono text-slate-400">PDF • DOCX • LAS • WITSML</span>
        </div>
        <div className="bg-[#0E1821] rounded-xl border border-[#26333F] overflow-hidden p-1 shadow-lg">
          <SmartIngestionStudio />
        </div>
      </div>

      {/* Section 2: Data Download & Export Center */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#32D296]" /> 2. Data Download & Export Hub
            </h2>
            <p className="text-[11px] text-[#8EA3B3] mt-0.5">
              Verified ground-truth extracted datasets from Krishna-Godavari & Volve drilling operations
            </p>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-[#14232E] border border-[#26333F] text-[11px] font-mono text-cyan-400">
            {EXPORTABLE_FILES.length} Files Ready
          </span>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {EXPORTABLE_FILES.map((file) => (
            <div
              key={file.id}
              className="bg-[#0E1821] border border-[#26333F] hover:border-[#4DA3FF]/50 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-xl group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-[#14232E] border border-[#26333F] text-[#4DA3FF] group-hover:scale-105 transition-transform">
                    {file.type === 'csv' ? (
                      <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <FileCode className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#14232E] text-slate-300 border border-slate-700">
                    {file.type}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-white group-hover:text-[#4DA3FF] transition-colors">
                  {file.name}
                </h3>
                <p className="text-[11px] text-[#8EA3B3] mt-1 line-clamp-2 leading-relaxed">
                  {file.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#26333F] flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">{file.sizeEstimate}</span>
                <button
                  onClick={() => handleDownload(file.filename)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14232E] hover:bg-[#4DA3FF] text-[#EAF4FA] text-xs font-semibold font-mono border border-[#26333F] hover:border-[#4DA3FF] transition-all shadow-sm active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

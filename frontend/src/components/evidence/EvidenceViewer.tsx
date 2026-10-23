'use client';
import React from 'react';
import { X, FileText, ChevronLeft, ChevronRight, ExternalLink, BookOpen } from 'lucide-react';
import { useDrillStore, EvidenceItem } from '@/store/useDrillStore';
import Link from 'next/link';

export const EvidenceViewer: React.FC = () => {
  const { selectedEvidence, evidenceViewerOpen, setEvidenceViewerOpen } = useDrillStore();

  if (!evidenceViewerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setEvidenceViewerOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-[420px] bg-[#0E1821] border-l border-[#26333F] h-full flex flex-col shadow-2xl animate-in slide-in-from-right-full duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#26333F]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#4DA3FF]" />
            <h2 className="text-lg font-bold text-[#EAF4FA]">Evidence Viewer</h2>
          </div>
          <button 
            onClick={() => setEvidenceViewerOpen(false)}
            className="p-1 text-[#8EA3B3] hover:text-[#EAF4FA] rounded-md hover:bg-[#14232E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!selectedEvidence ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#8EA3B3] p-6 text-center">
            <BookOpen className="w-12 h-12 mb-3 opacity-20" />
            <p>Select evidence from risks, alerts, or historical data to view details here.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto nwis-scroll p-4 space-y-6">
            
            {/* Document Preview */}
            <div className="rounded-lg border border-[#26333F] bg-[#071018] overflow-hidden flex flex-col h-64 relative group">
              <div className="absolute inset-0 flex items-center justify-center flex-col p-6 text-center">
                <FileText className="w-10 h-10 text-[#26333F] mb-2" />
                <div className="text-sm font-semibold text-[#8EA3B3]">{selectedEvidence.sourceDoc}</div>
                <div className="text-[10px] text-[#8EA3B3]/60 mt-1">Page {selectedEvidence.sourcePage}</div>
                <div className="text-[10px] text-[#4DA3FF] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  PDF preview available in full document view
                </div>
              </div>
              <div className="mt-auto p-2 bg-[#14232E]/80 backdrop-blur border-t border-[#26333F] flex justify-end z-10">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4DA3FF]/10 hover:bg-[#4DA3FF]/20 text-[#4DA3FF] text-[11px] font-medium rounded transition-colors">
                  <ExternalLink className="w-3 h-3" /> OPEN DOCUMENT
                </button>
              </div>
            </div>

            {/* Extracted Info */}
            <div>
              <h3 className="text-sm font-semibold text-[#EAF4FA] mb-3 uppercase tracking-wider text-[11px]">Extracted Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#8EA3B3]">Well</span>
                  <Link href={`/wells/${selectedEvidence.wellId}`} className="text-sm font-mono text-[#4DA3FF] hover:underline">
                    {selectedEvidence.wellId}
                  </Link>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#8EA3B3]">Incident Type</span>
                  <span className="px-2 py-0.5 rounded bg-[#26333F] text-[#EAF4FA] text-xs">
                    {selectedEvidence.incidentType}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#8EA3B3]">Depth</span>
                  <span className="text-sm font-mono text-[#EAF4FA]">{selectedEvidence.depthM}m MD</span>
                </div>

                {selectedEvidence.formation && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#8EA3B3]">Formation</span>
                    <span className="text-sm text-[#F4B942]">{selectedEvidence.formation}</span>
                  </div>
                )}

                {selectedEvidence.severity && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#8EA3B3]">Severity</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedEvidence.severity.toLowerCase() === 'severe' ? 'bg-[#FF5964]/10 text-[#FF5964]' :
                      selectedEvidence.severity.toLowerCase() === 'moderate' ? 'bg-[#F4B942]/10 text-[#F4B942]' :
                      'bg-[#32D296]/10 text-[#32D296]'
                    }`}>
                      {selectedEvidence.severity}
                    </span>
                  </div>
                )}

                {selectedEvidence.confidence && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#8EA3B3]">AI Confidence</span>
                    <span className={`text-sm font-bold font-mono ${
                      selectedEvidence.confidence > 85 ? 'text-[#32D296]' :
                      selectedEvidence.confidence > 70 ? 'text-[#F4B942]' : 'text-[#8EA3B3]'
                    }`}>
                      {selectedEvidence.confidence}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Mitigation / Snippet */}
            {selectedEvidence.mitigation && (
              <div>
                <h3 className="text-[11px] font-semibold text-[#8EA3B3] mb-2 uppercase tracking-wider">Mitigation Action Taken</h3>
                <div className="bg-[#14232E] border border-[#26333F] rounded-lg p-3 text-sm text-[#EAF4FA] leading-relaxed">
                  {selectedEvidence.mitigation}
                </div>
              </div>
            )}

            {selectedEvidence.snippet && (
              <div>
                <h3 className="text-[11px] font-semibold text-[#8EA3B3] mb-2 uppercase tracking-wider">Source Text Snippet</h3>
                <div className="bg-[#071018] border border-[#26333F] rounded-lg p-3 text-xs text-[#8EA3B3] italic font-mono leading-relaxed">
                  "{selectedEvidence.snippet}"
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        {selectedEvidence && (
          <div className="p-4 border-t border-[#26333F] flex items-center justify-between bg-[#080F18]">
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded bg-[#14232E] text-[#8EA3B3] hover:text-[#EAF4FA] transition-colors" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded bg-[#14232E] text-[#8EA3B3] hover:text-[#EAF4FA] transition-colors" disabled>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Link 
              href={`/wells/${selectedEvidence.wellId}`}
              onClick={() => setEvidenceViewerOpen(false)}
              className="px-4 py-2 bg-[#4DA3FF] text-[#071018] text-sm font-semibold rounded-lg hover:bg-[#4DA3FF]/90 transition-colors"
            >
              OPEN WELL
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Tooltip, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OffsetWellItem, OFFSET_WELLS } from './OffsetRadarTable';
import {
  Layers,
  Crosshair,
  Maximize2,
  Minimize2,
  Compass,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Shield,
  Eye,
  Info,
} from 'lucide-react';

const ACTIVE_RIG_COORDS: [number, number] = [16.245, 82.352];

// Map Layer Presets (Google Maps style)
export type MapType = 'hybrid' | 'satellite' | 'streets' | 'terrain' | 'dark';

interface MapLayerConfig {
  id: MapType;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  previewColor: string;
}

const MAP_LAYERS: Record<MapType, MapLayerConfig> = {
  hybrid: {
    id: 'hybrid',
    name: 'Satellite (Labels)',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Satellite Imagery',
    maxZoom: 20,
    previewColor: '#1d4ed8',
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite (Raw)',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Imagery',
    maxZoom: 20,
    previewColor: '#047857',
  },
  streets: {
    id: 'streets',
    name: 'Google Streets',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Roadmap',
    maxZoom: 20,
    previewColor: '#f59e0b',
  },
  terrain: {
    id: 'terrain',
    name: 'Google Terrain',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Topo Terrain',
    maxZoom: 18,
    previewColor: '#84cc16',
  },
  dark: {
    id: 'dark',
    name: 'Tactical Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap',
    maxZoom: 19,
    previewColor: '#0f172a',
  },
};

// Helper component for map camera controls
function MapController({
  targetCoords,
  zoom,
}: {
  targetCoords: [number, number] | null;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, zoom || map.getZoom(), {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [map, targetCoords, zoom]);

  return null;
}

// Generate Google-style custom DivIcons
function createRigIcon() {
  return L.divIcon({
    className: 'custom-rig-marker',
    html: `
      <div class="radar-beacon" style="width: 44px; height: 44px;">
        <div style="
          width: 34px;
          height: 34px;
          background: radial-gradient(circle, #0284C7 0%, #0369A1 70%, #0B1120 100%);
          border: 2.5px solid #38BDF8;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px #0284C7, 0 4px 10px rgba(0,0,0,0.6);
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 2 22 22 22 12 2"></polygon>
            <line x1="12" y1="2" x2="12" y2="22"></line>
            <line x1="7" y1="12" x2="17" y2="12"></line>
            <line x1="5" y1="17" x2="19" y2="17"></line>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
}

function createWellIcon(status: 'critical' | 'warning' | 'safe', isSelected: boolean) {
  const colors = {
    critical: {
      fill: '#EF4444',
      border: '#B91C1C',
      shadow: 'rgba(239, 68, 68, 0.5)',
      badge: '#991B1B',
      icon: '!',
    },
    warning: {
      fill: '#F59E0B',
      border: '#D97706',
      shadow: 'rgba(245, 158, 11, 0.5)',
      badge: '#92400E',
      icon: '▲',
    },
    safe: {
      fill: '#10B981',
      border: '#059669',
      shadow: 'rgba(16, 185, 129, 0.5)',
      badge: '#065F46',
      icon: '✓',
    },
  }[status];

  const size = isSelected ? 36 : 30;
  const height = isSelected ? 48 : 40;

  return L.divIcon({
    className: 'gmap-marker-pin',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${height}px;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.45));
        ${isSelected ? 'transform: scale(1.15);' : ''}
      ">
        <svg width="${size}" height="${height}" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 41C16 41 30 26.5 30 15.5C30 7.49187 23.732 1 16 1C8.26801 1 2 7.49187 2 15.5C2 26.5 16 41 16 41Z"
            fill="${colors.fill}"
            stroke="${isSelected ? '#FFFFFF' : colors.border}"
            stroke-width="${isSelected ? 2.5 : 1.5}"
          />
          <circle cx="16" cy="15" r="7.5" fill="#FFFFFF"/>
          <text x="16" y="19" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="${colors.badge}" text-anchor="middle">
            ${colors.icon}
          </text>
        </svg>
      </div>
    `,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height],
  });
}

interface WellMapProps {
  selectedWell?: OffsetWellItem | null;
  wells?: OffsetWellItem[];
  onSelectWell?: (well: OffsetWellItem) => void;
  heightClass?: string;
}

export const WellMap: React.FC<WellMapProps> = ({
  selectedWell,
  wells = OFFSET_WELLS,
  onSelectWell,
  heightClass = 'min-h-[340px] h-full',
}) => {
  const [activeMapType, setActiveMapType] = useState<MapType>('hybrid');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showRadius, setShowRadius] = useState(true);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleRecenter = () => {
    setFlyTarget([...ACTIVE_RIG_COORDS]);
  };

  const currentLayer = MAP_LAYERS[activeMapType];

  return (
    <div
      ref={containerRef}
      className={`w-full relative rounded-xl overflow-hidden border border-[#26333F] bg-[#071018] select-none ${heightClass}`}
    >
      <MapContainer
        center={ACTIVE_RIG_COORDS}
        zoom={12}
        scrollWheelZoom={true}
        touchZoom={true}
        zoomControl={false}
        className="w-full h-full z-10"
        style={{ background: '#090D16' }}
      >
        <MapController targetCoords={flyTarget} />

        {/* Selected Base Tile Layer */}
        <TileLayer
          key={currentLayer.id}
          url={currentLayer.url}
          attribution={currentLayer.attribution}
          maxZoom={currentLayer.maxZoom}
        />

        {/* Correlation Safe Radius Ring (10 km) */}
        {showRadius && (
          <Circle
            center={ACTIVE_RIG_COORDS}
            radius={10000}
            pathOptions={{
              color: '#00F0FF',
              fillColor: '#00F0FF',
              fillOpacity: activeMapType === 'dark' ? 0.08 : 0.12,
              weight: 2,
              dashArray: '6, 8',
            }}
          >
            <Tooltip direction="top" opacity={0.9} permanent={false}>
              <span className="text-xs font-mono font-semibold text-cyan-400">
                10.0 km Correlation Radius Zone
              </span>
            </Tooltip>
          </Circle>
        )}

        {/* Distance Line between Rig and Selected Well */}
        {selectedWell && (
          <Polyline
            positions={[ACTIVE_RIG_COORDS, [selectedWell.lat, selectedWell.lon]]}
            pathOptions={{
              color: '#38BDF8',
              weight: 2.5,
              dashArray: '5, 8',
              opacity: 0.9,
            }}
          />
        )}

        {/* Active Rig Marker */}
        <Marker position={ACTIVE_RIG_COORDS} icon={createRigIcon()}>
          <Tooltip direction="top" offset={[0, -14]} opacity={0.95} permanent>
            <div className="bg-[#0B1120]/95 text-slate-100 px-2 py-1 rounded-md border border-cyan-400/80 font-mono text-[11px] font-bold shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>ACTIVE RIG • 15/9-F-11B</span>
            </div>
          </Tooltip>
          <Popup>
            <div className="p-3 text-slate-100 font-sans min-w-[220px]">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400">ACTIVE DRILLING RIG</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                  ONLINE
                </span>
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Well 15/9-F-11B</h4>
              <p className="text-[11px] text-slate-300">Krishna-Godavari Deepwater Basin</p>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Coordinates</span>
                  <span className="text-slate-200">16.245° N, 82.352° E</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Current Formation</span>
                  <span className="text-amber-400">Hugin Formation</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Offset Wells Markers */}
        {wells.map((well) => {
          const isSelected = selectedWell?.id === well.id;
          return (
            <Marker
              key={well.id}
              position={[well.lat, well.lon]}
              icon={createWellIcon(well.status, isSelected)}
              eventHandlers={{
                click: () => onSelectWell && onSelectWell(well),
              }}
            >
              <Tooltip direction="top" offset={[0, -32]} opacity={0.95}>
                <div className="bg-[#0B1120]/95 text-slate-100 p-2 rounded-lg border border-slate-700 shadow-2xl text-xs min-w-[160px] backdrop-blur-md">
                  <div className="font-bold text-white font-mono flex items-center justify-between">
                    <span>{well.name}</span>
                    <span className="text-[10px] text-cyan-400">{well.distanceKm} km</span>
                  </div>
                  <div className="text-[10px] text-slate-300 mt-1 line-clamp-1">{well.hazard}</div>
                  <div className="mt-1 flex items-center gap-1">
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        well.status === 'critical'
                          ? 'bg-red-950 text-red-300'
                          : well.status === 'warning'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {well.status}
                    </span>
                  </div>
                </div>
              </Tooltip>

              <Popup>
                <div className="p-3.5 text-slate-100 font-sans min-w-[240px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      {well.status === 'critical' && <AlertCircle className="w-4 h-4 text-red-400" />}
                      {well.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      {well.status === 'safe' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      <span className="font-bold text-sm text-white font-mono">{well.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      {well.distanceKm} km
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Reported Hazard</span>
                      <p className="text-white font-medium text-[11px] mt-0.5">{well.hazard}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-slate-400">
                      <span>Lat: {well.lat.toFixed(3)}°</span>
                      <span>Lon: {well.lon.toFixed(3)}°</span>
                    </div>
                  </div>

                  {onSelectWell && (
                    <button
                      onClick={() => onSelectWell(well)}
                      className="w-full py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono transition-all flex items-center justify-center gap-1.5 shadow"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isSelected ? 'Active Selection' : 'Analyze Offset Logs'}</span>
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Google Maps Layer Switcher Widget (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-[400] flex flex-col items-start gap-1">
        {showLayerMenu && (
          <div className="bg-[#0B1120]/95 border border-[#26333F] rounded-xl p-2.5 shadow-2xl backdrop-blur-md mb-1 min-w-[200px] animate-in fade-in zoom-in-95 duration-150">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 px-1 font-semibold">
              Map Style (Google)
            </div>
            <div className="grid grid-cols-1 gap-1">
              {(Object.keys(MAP_LAYERS) as MapType[]).map((type) => {
                const layer = MAP_LAYERS[type];
                const active = activeMapType === type;
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setActiveMapType(type);
                      setShowLayerMenu(false);
                    }}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium text-left transition-all ${
                      active
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-300 hover:bg-[#14232E] hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: layer.previewColor }}
                    />
                    <span className="flex-1">{layer.name}</span>
                    {active && <span className="text-[10px] text-cyan-400">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between px-1">
              <span className="text-[11px] text-slate-300 font-mono">10km Radius</span>
              <input
                type="checkbox"
                checked={showRadius}
                onChange={(e) => setShowRadius(e.target.checked)}
                className="rounded accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        <button
          onClick={() => setShowLayerMenu((v) => !v)}
          className="flex items-center gap-2 bg-[#0B1120]/90 hover:bg-[#14232E] text-slate-200 border border-[#26333F] px-3 py-1.5 rounded-lg text-xs font-mono shadow-xl backdrop-blur-md transition-all active:scale-95"
          title="Change Map Layer"
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold">{currentLayer.name}</span>
        </button>
      </div>

      {/* Google Maps Style Navigation & View Controls (Bottom-Right) */}
      <div className="absolute bottom-3 right-3 z-[400] flex flex-col items-center gap-2">
        {/* Recenter to Active Rig */}
        <button
          onClick={handleRecenter}
          className="h-9 w-9 rounded-lg bg-[#0B1120]/90 hover:bg-[#14232E] border border-[#26333F] flex items-center justify-center text-cyan-400 hover:text-cyan-300 shadow-xl backdrop-blur-md transition-all active:scale-90"
          title="Center Active Rig (15/9-F-11B)"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="h-9 w-9 rounded-lg bg-[#0B1120]/90 hover:bg-[#14232E] border border-[#26333F] flex items-center justify-center text-slate-300 hover:text-white shadow-xl backdrop-blur-md transition-all active:scale-90"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Top Floating Coordinates & Basin Info */}
      <div className="absolute top-3 left-3 z-[400] bg-[#0B1120]/85 border border-[#26333F] px-3 py-1 rounded-lg text-[11px] font-mono text-slate-300 flex items-center gap-2.5 backdrop-blur-md shadow-lg pointer-events-none">
        <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Compass className="w-3.5 h-3.5" />
          <span>KG BASIN DEEPWATER</span>
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400 tabular-nums">16.2450° N, 82.3520° E</span>
      </div>

      {/* Map Legend Overlay (Top-Right) */}
      <div className="hidden sm:flex absolute top-3 right-3 z-[400] bg-[#0B1120]/85 border border-[#26333F] rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-300 items-center gap-3 backdrop-blur-md shadow-lg pointer-events-none">
        <span className="flex items-center gap-1 text-cyan-300">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" /> Rig
        </span>
        <span className="flex items-center gap-1 text-red-400">
          <span className="h-2 w-2 rounded-full bg-red-500" /> Critical
        </span>
        <span className="flex items-center gap-1 text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Warning
        </span>
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Safe
        </span>
      </div>
    </div>
  );
};

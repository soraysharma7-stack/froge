import React from 'react';
import { Scan, Eye, Radio, Sparkles, Activity } from 'lucide-react';

interface DeviceScanOverlayProps {
  isScanning: boolean;
  statusText?: string;
}

export const DeviceScanOverlay: React.FC<DeviceScanOverlayProps> = ({
  isScanning,
  statusText = 'FROGÉ BRAIN: SCANNING SCENE & MULTIMODAL PERCEPTION...',
}) => {
  if (!isScanning) return null;

  return (
    <div className="fixed inset-0 z-100 pointer-events-none overflow-hidden select-none flex flex-col justify-between">
      {/* Background Hologram Grid & Scan Tint */}
      <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px] animate-pulse" />
      
      {/* Moving Laser Beam Sweep Line */}
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_24px_6px_rgba(16,185,129,0.85)] animate-scan-laser top-0" />

      {/* Cybernetic HUD Corner Markers */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-emerald-400 opacity-90 shadow-sm" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-emerald-400 opacity-90 shadow-sm" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-emerald-400 opacity-90 shadow-sm" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-emerald-400 opacity-90 shadow-sm" />

      {/* Center Target Reticle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 border border-emerald-500/40 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '6s' }}>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent absolute" />
          <div className="h-full w-0.5 bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent absolute" />
        </div>
        <div className="absolute w-28 h-28 border border-dashed border-emerald-300 rounded-full animate-ping opacity-30" />
      </div>

      {/* Top Telemetry Header */}
      <div className="relative p-6 flex items-center justify-between text-emerald-400 font-mono text-xs">
        <div className="flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 shadow-lg">
          <Eye className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold tracking-wider">FROGÉ SCREEN EYE v3.8</span>
          <span className="text-zinc-500">|</span>
          <span className="text-emerald-300 animate-pulse">DEVICE SCENE CAPTURE ACTIVE</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 shadow-lg">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>FPS: 60 • RES: 1920x1080 • FROGÉ MULTIMODAL</span>
        </div>
      </div>

      {/* Bottom Status Banner */}
      <div className="relative p-6 flex justify-center">
        <div className="flex items-center gap-3 bg-zinc-950/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-emerald-500/50 shadow-2xl text-emerald-300 font-mono text-xs sm:text-sm">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold tracking-wide">{statusText}</span>
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
        </div>
      </div>
    </div>
  );
};

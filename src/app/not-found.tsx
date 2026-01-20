"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Terminal, ShieldAlert, Home, ChevronRight, TerminalSquare } from "lucide-react";

export default function NotFound() {
  const [lines, setLines] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const terminalSequence = [
    "INITIALIZING_RECOVERY_PROTOCOL...",
    "ACCESSING_MAINFRAME_ERROR_LOGS...",
    "SCANNING_SECTOR_404... NOT_FOUND",
    "STATUS: SYSTEM_INTEGRITY_COMPROMISED",
    "REASON: ASSET_PATH_MISMATCH",
    "ATTEMPTING_RE-ROUTING...",
  ];

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < terminalSequence.length) {
        setLines((prev) => [...prev, terminalSequence[current]]);
        current++;
      } else {
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#00FF41] font-mono p-4 sm:p-10 flex items-center justify-center overflow-hidden">
      {/* Matrix-like background effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden text-[8px] leading-tight">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="whitespace-nowrap translate-y-[-100%] animate-matrix-rain" style={{ animationDelay: `${i * 0.2}s` }}>
            {Array.from({ length: 100 }).map(() => Math.random() > 0.5 ? "0" : "1").join(" ")}
          </div>
        ))}
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="bg-[#0A0A0A] border border-[#00FF41]/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,255,65,0.1)]">
          {/* Terminal Header */}
          <div className="bg-[#1A1A1A] px-6 py-3 border-b border-[#00FF41]/20 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="flex items-center gap-2 text-[10px] opacity-50 font-black uppercase tracking-widest text-[#00FF41]">
              <TerminalSquare className="w-3 h-3" /> Automatic_System_Error_V2.0.26
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-8 sm:p-12 space-y-6">
            <div className="flex items-start gap-6">
              <div className="shrink-0 pt-1">
                <ShieldAlert className="w-16 h-16 animate-pulse" />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase leading-none">
                  Error <span className="text-white">404</span>
                </h1>
                <p className="text-lg opacity-80 uppercase font-black italic">
                  Critical failure: requested node is outside the enterprise mainframe perimeter.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-8 font-bold text-sm sm:text-base border-t border-[#00FF41]/10">
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
                  <span className={i === 2 ? "text-red-500" : ""}>{line}</span>
                </motion.div>
              ))}
              {lines.length === terminalSequence.length && (
                <div className="flex items-center gap-3 pt-4">
                  <span className="text-white tracking-widest animate-pulse">_</span>
                  <Link
                    href="/"
                    className="flex items-center gap-2 bg-[#00FF41]/10 px-6 py-3 rounded-lg border border-[#00FF41]/50 hover:bg-[#00FF41] hover:text-[#050505] transition-all group"
                  >
                    EXFILTRATION_TO_HOME <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Decorative scanline */}
        <div className="absolute inset-x-0 h-px bg-[#00FF41]/10 top-1/2 animate-scanline pointer-events-none" />
      </div>

      <style jsx global>{`
        @keyframes matrix-rain {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes scanline {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 0.5; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
        .animate-matrix-rain {
          animation: matrix-rain 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
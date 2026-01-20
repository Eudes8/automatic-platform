"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw, Home, Terminal } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("MAINFRAME_CRITICAL_ERROR:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FF3E3E] font-mono p-6 sm:p-20 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full space-y-12">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-[#FF3E3E]/10 border border-[#FF3E3E]/30 rounded-2xl animate-pulse">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">System_Crash</h1>
            <p className="text-sm opacity-60 font-bold uppercase tracking-widest leading-none">Kernel Panic: Execution Interrupted</p>
          </div>
        </div>

        <div className="bg-black/40 border border-[#FF3E3E]/20 p-8 rounded-2xl space-y-6 font-bold text-sm">
          <div className="flex gap-4">
            <span className="opacity-30">ERR_ID:</span>
            <span className="text-white italic">{error.digest || "UNKNOWN_INTERNAL_EXCEPTION"}</span>
          </div>
          <div className="flex gap-4">
            <span className="opacity-30">TRACE:</span>
            <div className="text-[10px] break-all opacity-80 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar pr-4">
              {error.message} <br />
              {error.stack?.split('\n').slice(0, 5).join('\n')}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-10">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-3 bg-[#FF3E3E] text-black px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,62,62,0.3)]"
          >
            <RefreshCcw className="w-4 h-4" /> Re-Initialize_System
          </button>

          <a
            href="/"
            className="flex items-center justify-center gap-3 border-2 border-[#FF3E3E]/30 text-[#FF3E3E] px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-[#FF3E3E]/5 transition-all"
          >
            <Home className="w-4 h-4" /> Abort_Mission
          </a>
        </div>
      </div>

      <div className="fixed bottom-10 left-10 opacity-10 flex items-center gap-3">
        <Terminal className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Automatic_Protective_Shell_v1.0</span>
      </div>
    </div>
  );
}
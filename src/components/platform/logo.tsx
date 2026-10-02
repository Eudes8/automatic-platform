"use client"

import { cn } from "@/lib/utils"
import { Zap } from "lucide-react"

export function Logo({ size = "md", onClick }: { size?: "sm" | "md" | "lg"; onClick?: () => void }) {
  const sizes = {
    sm: { box: "w-7 h-7 rounded-lg", icon: 14, text: "text-base" },
    md: { box: "w-9 h-9 rounded-xl", icon: 18, text: "text-lg" },
    lg: { box: "w-12 h-12 rounded-2xl", icon: 26, text: "text-2xl" },
  }[size]
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 group cursor-pointer" aria-label="AUTOMATIC — accueil">
      <div className={cn(sizes.box, "bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow")}>
        <Zap size={sizes.icon} className="text-zinc-950" strokeWidth={2.5} fill="currentColor" />
      </div>
      <span className={cn(sizes.text, "font-bold tracking-tight text-foreground")}>
        AUTO<span className="text-emerald-400">MATIC</span>
      </span>
    </button>
  )
}

"use client"

import * as React from "react"
import { Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <button
            onClick={() => setTheme("light")}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:scale-105"
            aria-label="Forcer le mode clair"
        >
            <Sun className="h-5 w-5 text-primary transition-all duration-300 group-hover:text-blue-500 group-hover:rotate-12" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
    )
}

"use client";

import { motion } from "framer-motion";

export function TechGrid() {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
            {/* Dots Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.4] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] dark:opacity-[0.3]" />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_80%)]" />

            {/* Static Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] contrast-150 brightness-150 pointer-events-none bg-[url('https://transparenttextures.com/patterns/pinstripe-light.png')]" />
        </div>
    );
}

export function Scanlines() {
    return (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden opacity-[0.02] dark:opacity-[0.05]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
        </div>
    );
}

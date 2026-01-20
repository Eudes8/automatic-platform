"use client";

import { motion } from "framer-motion";

export function Logo() {
    return (
        <div className="flex items-center gap-3 group relative">
            <div className="relative w-10 h-10">
                {/* Background Rotating Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-primary/20 rounded-xl"
                />

                {/* Inner Animated Diamond */}
                <motion.div
                    initial={{ scale: 0.8, rotate: 45 }}
                    animate={{
                        scale: [0.8, 1.1, 0.8],
                        rotate: [45, 135, 45]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-2 bg-primary rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.3)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                />

                {/* Fixed Center Core */}
                <div className="absolute inset-[13px] bg-background rounded-full border border-primary/50" />
            </div>

            <div className="flex flex-col leading-none">
                <span className="text-xl font-black uppercase tracking-[-0.05em] text-primary italic">
                    Automatic
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-secondary opacity-40 ml-0.5">
                    Engineering_Nexus
                </span>
            </div>

            {/* Hover Glint Effect */}
            <div className="absolute -inset-x-4 -inset-y-2 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
        </div>
    );
}

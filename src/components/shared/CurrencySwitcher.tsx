"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check } from "lucide-react";
import { Currency, getClientCurrency, setStoredCurrency } from "@/lib/utils/currency";

export function CurrencySwitcher() {
    const [currency, setCurrency] = useState<Currency>("EUR");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setCurrency(getClientCurrency());

        const handleCurrencyChange = () => {
            setCurrency(getClientCurrency());
        };
        window.addEventListener('currencyChange', handleCurrencyChange);
        return () => window.removeEventListener('currencyChange', handleCurrencyChange);
    }, []);

    const currencies: { code: Currency; label: string; symbol: string }[] = [
        { code: "XOF", label: "Franc CFA", symbol: "FCFA" },
        { code: "EUR", label: "Euro", symbol: "€" },
        { code: "USD", label: "Dollar US", symbol: "$" },
    ];

    const handleSelect = (code: Currency) => {
        setStoredCurrency(code);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-premium bg-background/50 hover:bg-primary/5 transition-all text-[11px] font-black uppercase tracking-widest text-primary italic"
            >
                <Globe className="w-3 h-3 text-accent" />
                {currency}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-48 bg-card border border-premium rounded-2xl shadow-premium overflow-hidden z-50 p-2"
                        >
                            <p className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-secondary/40 border-b border-border/50 mb-1 italic">
                                Région / Devise
                            </p>
                            {currencies.map((c) => (
                                <button
                                    key={c.code}
                                    onClick={() => handleSelect(c.code)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs transition-all ${currency === c.code
                                            ? "bg-primary text-background font-black"
                                            : "text-primary hover:bg-primary/5 font-bold"
                                        }`}
                                >
                                    <div className="flex flex-col items-start leading-none gap-1">
                                        <span className="uppercase tracking-widest">{c.code}</span>
                                        <span className={`text-[9px] opacity-60 ${currency === c.code ? "" : "text-secondary"}`}>{c.label}</span>
                                    </div>
                                    {currency === c.code && <Check className="w-3.5 h-3.5" />}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

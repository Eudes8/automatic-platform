"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { Logo } from "./Logo";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Gestion de la fermeture du menu avec Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && mobileMenu) {
                setMobileMenu(false);
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [mobileMenu]);

    const navLinks = [
        { name: "Services", href: "#services" },
        { name: "Portfolio", href: "#portfolio" },
    ];

    return (
        <nav
            role="navigation"
            aria-label="Navigation principale"
            className={`fixed top-0 w-full z-50 transition-all duration-700 ${isScrolled
                ? "py-3 sm:py-4 bg-background/80 backdrop-blur-xl border-b border-premium shadow-card"
                : "py-6 sm:py-8 bg-transparent"
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-3 sm:gap-4 group"
                    aria-label="Retour à l'accueil"
                >
                    <Logo />
                </Link>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-6 sm:gap-8 md:gap-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[11px] sm:text-[12px] md:text-[13px] font-medium text-secondary hover:text-primary transition-colors uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-2 py-1"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <CurrencySwitcher />
                    <ThemeToggle />
                    <Link
                        href="/dashboard"
                        className="hidden sm:flex items-center gap-2 text-[11px] sm:text-[12px] md:text-[13px] font-bold text-secondary hover:text-primary transition uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-2 py-1"
                        aria-label="Accéder à l'espace client"
                    >
                        <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" /> <span className="hidden md:inline">Connexion</span>
                    </Link>
                    <Link
                        href="/onboarding"
                        className="group relative px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-primary text-background rounded-full text-[10px] sm:text-[11px] md:text-[13px] font-bold transition-all hover:pr-6 sm:hover:pr-7 md:hover:pr-8 active:scale-95 overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        aria-label="Lancer un nouveau projet"
                    >
                        <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                            <span className="hidden sm:inline">Lancer mon projet</span>
                            <span className="sm:hidden">Projet</span>
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 -ml-3 sm:-ml-4 group-hover:ml-0 transition-all duration-300" aria-hidden="true" />
                        </span>
                    </Link>
                    <button
                        className="lg:hidden text-primary p-1.5 sm:p-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
                        onClick={() => setMobileMenu(!mobileMenu)}
                        aria-label={mobileMenu ? "Fermer le menu" : "Ouvrir le menu"}
                        aria-expanded={mobileMenu}
                        aria-controls="mobile-menu"
                    >
                        {mobileMenu ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenu && (
                    <motion.div
                        id="mobile-menu"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-white/5 p-6 sm:p-8 flex flex-col gap-4 sm:gap-6 lg:hidden"
                        role="menu"
                        aria-label="Menu mobile"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-xl sm:text-2xl font-heading font-bold text-primary hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-sm px-2 py-1"
                                onClick={() => setMobileMenu(false)}
                                role="menuitem"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-px bg-white/5 my-1 sm:my-2" />
                        <Link
                            href="/dashboard"
                            className="text-base sm:text-lg font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-sm px-2 py-1"
                            onClick={() => setMobileMenu(false)}
                            role="menuitem"
                        >
                            Espace Client
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

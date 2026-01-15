"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Services", href: "#services" },
        { name: "Portfolio", href: "#portfolio" },
        { name: "Process", href: "#process" },
        { name: "Tarifs", href: "#pricing" },
    ];

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-700 ${
                isScrolled
                    ? "py-4 bg-gradient-card backdrop-blur-xl border-b border-premium shadow-card"
                    : "py-8 bg-transparent"
            }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-4 group">
                    <Image
                        src="/logo.svg"
                        alt="AUTOMATIC Logo"
                        width={40}
                        height={40}
                        className="w-10 h-10 group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className="text-xl font-heading font-bold tracking-tight text-primary uppercase">
                        Automatic
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[13px] font-medium text-secondary hover:text-primary transition-colors uppercase tracking-widest"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link
                        href="/dashboard"
                        className="hidden sm:flex items-center gap-2 text-[13px] font-bold text-secondary hover:text-primary transition uppercase tracking-widest"
                    >
                        <User className="w-3.5 h-3.5" /> Connexion
                    </Link>
                    <Link
                        href="/onboarding"
                        className="group relative px-6 py-2.5 bg-primary text-background rounded-full text-[13px] font-bold transition-all hover:pr-8 active:scale-95 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Lancer mon projet
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-300" />
                        </span>
                    </Link>
                    <button
                        className="lg:hidden text-primary p-2"
                        onClick={() => setMobileMenu(!mobileMenu)}
                    >
                        {mobileMenu ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-white/5 p-8 flex flex-col gap-6 lg:hidden"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-2xl font-heading font-bold text-white"
                                onClick={() => setMobileMenu(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-px bg-white/5 my-2" />
                        <Link
                            href="/dashboard"
                            className="text-lg font-bold text-secondary uppercase tracking-widest"
                            onClick={() => setMobileMenu(false)}
                        >
                            Espace Client
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

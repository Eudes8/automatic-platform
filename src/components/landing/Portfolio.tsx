"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import Image from "next/image";
import { getPortfolioProjects } from "@/lib/actions/portfolio";

export default function Portfolio() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await getPortfolioProjects();
            setProjects(data);
            setLoading(false);
        };
        load();
    }, []);

    const displayProjects = projects.length > 0 ? projects : [
        {
            title: "EcoSphere Core",
            category: "SaaS Platform",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
            description: "Plateforme ERP nouvelle génération pour la gestion de l'empreinte carbone industrielle.",
            tech: ["Next.js", "PostgreSQL", "Edge Functions"],
        },
        {
            title: "Nova Pay",
            category: "Fintech App",
            image: "https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?auto=format&fit=crop&q=80&w=800",
            description: "Solution bancaire décentralisée offrant une expérience utilisateur fluide et sécurisée.",
            tech: ["React Native", "TypeSafe API", "Rust"],
        },
        {
            title: "Kinetics Admin",
            category: "Enterprise UI",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
            description: "Dashboard analytique haute performance capable de traiter des millions de data points.",
            tech: ["Vite", "D3.js", "Serverless"],
        },
    ];

    return (
        <section id="portfolio" className="py-32 bg-background transition-colors">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <div className="max-w-2xl">
                        <h2 className="text-blue-500 font-bold tracking-[0.2em] uppercase text-xs mb-4">Portfolio</h2>
                        <p className="text-4xl md:text-6xl font-heading font-bold text-primary tracking-tight leading-tight">
                            Des produits qui redéfinissent <br /> leurs industries.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {displayProjects.map((project, idx) => (
                        <motion.div
                            key={project.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="group"
                        >
                            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] mb-8 bg-card border border-border">
                                <Image
                                    src={project.image}
                                    alt={project.title}
                                    width={800}
                                    height={1000}
                                    className="w-full h-full object-cover transition-transform duration-700 scale-105 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-10">
                                    <div className="flex gap-4">
                                        <button className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white text-black transition-all">
                                            <ArrowUpRight className="w-5 h-5" />
                                        </button>
                                        <button className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white text-black transition-all">
                                            <Github className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] border border-border px-2 py-0.5 rounded">
                                        {project.category}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-heading font-bold text-primary mb-3 group-hover:text-blue-400 transition-colors">
                                    {project.title}
                                </h3>
                                <p className="text-secondary text-sm leading-relaxed mb-6 line-clamp-2">
                                    {project.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {project.tech.map((t: string) => (
                                        <span key={t} className="text-[10px] items-center font-medium text-secondary/60">
                                            # {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

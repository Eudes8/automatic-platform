"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import Image from "next/image";
import { getPortfolioProjects } from "@/lib/actions/portfolio";

export default function Portfolio() {
    const [projects, setProjects] = useState<any[]>([]);
    useEffect(() => {
        const load = async () => {
            const data = await getPortfolioProjects();
            setProjects(data);
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

    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

    const handleImageError = (projectTitle: string) => {
        setImageErrors(prev => new Set(prev).add(projectTitle));
    };

    const getImageSrc = (project: any) => {
        if (imageErrors.has(project.title)) {
            return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"; // fallback image
        }
        try {
            new URL(project.image);
            return project.image;
        } catch {
            return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"; // fallback image
        }
    };

    return (
        <section id="portfolio" className="py-40 bg-background relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-[1px] bg-accent" />
                            <h2 className="text-accent font-black tracking-[0.4em] uppercase text-[10px] italic">Archives_Projets</h2>
                        </div>
                        <p className="text-5xl md:text-7xl font-black text-primary tracking-tighter leading-[0.85] uppercase italic">
                            Preuves <br />
                            <span className="text-secondary/20">d'Exécution.</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {displayProjects.map((project, idx) => (
                        <motion.div
                            key={project.id || idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="group flex flex-col"
                        >
                            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl mb-10 bg-card border border-border/50 group-hover:border-primary/30 transition-all duration-500 shadow-sm">
                                {/* Technical Grid Overlay on Image */}
                                <div className="absolute inset-0 z-10 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

                                <Image
                                    src={getImageSrc(project)}
                                    alt={project.title}
                                    fill
                                    onError={() => handleImageError(project.title)}
                                    className="object-cover transition-transform duration-1000 scale-100 group-hover:scale-110 grayscale-[0.8] group-hover:grayscale-0"
                                />

                                {/* Status Indicator */}
                                <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest italic">Live_Prod</span>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-10 z-20">
                                    <div className="flex gap-4">
                                        {project.url && (
                                            <a href={project.url} target="_blank" className="w-12 h-12 rounded-xl bg-primary text-background flex items-center justify-center hover:scale-110 transition-transform">
                                                <ArrowUpRight className="w-5 h-5" />
                                            </a>
                                        )}
                                        {project.github && (
                                            <a href={project.github} target="_blank" className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all">
                                                <Github className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="px-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[9px] font-black text-accent uppercase tracking-[0.2em] italic">
                                        // {project.category}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-black text-primary mb-4 group-hover:text-accent transition-colors uppercase italic tracking-tighter leading-none">
                                    {project.title}
                                </h3>
                                <p className="text-secondary/70 text-sm leading-relaxed mb-8 line-clamp-2 font-medium">
                                    {project.description}
                                </p>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-6 border-t border-border/50">
                                    {project.tech.map((t: string) => (
                                        <span key={t} className="text-[10px] font-black text-secondary/40 uppercase tracking-widest italic">
                                            {t}
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

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { PortfolioProject } from "@prisma/client";
import { getPortfolioProjects } from "@/lib/actions/portfolio";

export default function Portfolio() {
    const [projects, setProjects] = useState<PortfolioProject[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await getPortfolioProjects();
            setProjects(data as PortfolioProject[]);
        };
        load();
    }, []);

    const displayProjects = (projects.length > 0 ? projects : [
        {
            title: "EcoSphere",
            category: "Plateforme SaaS",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
            description: "Une plateforme pour gérer l'empreinte carbone des entreprises.",
            tech: ["Web", "Mobile"],
        },
        {
            title: "Nova Pay",
            category: "Application Mobile",
            image: "https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?auto=format&fit=crop&q=80&w=800",
            description: "Application bancaire simple et sécurisée pour tous.",
            tech: ["iOS", "Android"],
        },
        {
            title: "Kinetics",
            category: "Logiciel de Gestion",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
            description: "Tableau de bord complet pour analyser vos données.",
            tech: ["Dashboard", "Analytics"],
        },
    ] as any[]);

    return (
        <section id="portfolio" className="py-20 bg-background relative">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                    <span className="text-primary/60 font-medium tracking-wider uppercase text-sm">Portfolio</span>
                    <h2 className="text-3xl sm:text-5xl font-black text-primary mt-2">
                        Nos dernières réalisations
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayProjects.map((project, idx) => (
                        <motion.div
                            key={project.id || idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="group block"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-4 bg-gray-100 dark:bg-gray-800">
                                <Image
                                    src={project.image}
                                    alt={project.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-accent uppercase tracking-wider">
                                    {project.category}
                                </span>
                                {project.url && (
                                    <a href={project.url} target="_blank" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </a>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-primary mb-2">
                                {project.title}
                            </h3>
                            <p className="text-secondary/70 text-sm leading-relaxed">
                                {project.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

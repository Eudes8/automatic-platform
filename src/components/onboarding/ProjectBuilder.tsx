"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe,
    Smartphone,
    Database,
    ShieldCheck,
    CreditCard,
    MessageSquare,
    Layout,
    CheckCircle2,
    Rocket,
    Loader2,
    Cpu,
    Zap,
    Briefcase,
    ArrowRight,
    ChevronLeft
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const STEPS = [
    { id: "concept", title: "Concept" },
    { id: "type", title: "Architecture" },
    { id: "features", title: "Composants" },
    { id: "timeline", title: "Fréquence" },
    { id: "account", title: "Identité" }
];

const PROJECT_TYPES = [
    { id: "web", title: "Application Web", icon: Globe, basePrice: 2000, desc: "Interface haute performance réactive." },
    { id: "mobile", title: "App Mobile", icon: Smartphone, basePrice: 3500, desc: "Expérience native iOS & Android." },
    { id: "saas", title: "Plateforme SaaS", icon: Database, basePrice: 5000, desc: "Système multi-tenant évolutif." },
];

const FEATURES = [
    { id: "auth", title: "Auth & Sécurité", price: 500, icon: ShieldCheck, desc: "JWT, OAuth & chiffrement." },
    { id: "payments", title: "Transactionnel", price: 800, icon: CreditCard, desc: "Stripe, Facturation & Taxes." },
    { id: "chat", title: "Flux Temps Réel", price: 1200, icon: MessageSquare, desc: "Websockets & Notifications." },
    { id: "admin", title: "Console Admin", price: 1500, icon: Layout, desc: "Gestion totale des données." },
];

const formSchema = z.object({
    projectTitle: z.string().min(3, "Donnez un nom ambitieux à votre projet"),
    type: z.string().min(1, "Veuillez choisir un type de projet"),
    features: z.array(z.string()).min(1, "Sélectionnez au moins une fonctionnalité"),
    budget: z.string().optional().default("medium"),
    timeline: z.string().optional().default("standard"),
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

type FormData = {
    projectTitle: string;
    type: string;
    features: string[];
    budget?: string;
    timeline?: string;
    name: string;
    email: string;
    password: string;
};

export default function ProjectBuilder() {
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        trigger
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectTitle: "",
            type: "web",
            features: ["auth"],
            budget: "medium",
            timeline: "standard",
            name: "",
            email: "",
            password: ""
        }
    });

    const formData = watch();

    const nextStep = async () => {
        let fieldsToValidate: (keyof FormData)[] = [];
        if (currentStep === 0) fieldsToValidate = ["projectTitle"];
        if (currentStep === 1) fieldsToValidate = ["type"];
        if (currentStep === 2) fieldsToValidate = ["features"];
        if (currentStep === 4) fieldsToValidate = ["name", "email", "password"];

        const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;
        if (isValid) {
            setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
        }
    };

    const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

    const onFormSubmit = async (data: FormData) => {
        setSubmitting(true);
        try {
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                window.location.href = "/onboarding/success";
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleFeature = (id: string) => {
        const currentFeatures = formData.features;
        const newFeatures = currentFeatures.includes(id)
            ? currentFeatures.filter(f => f !== id)
            : [...currentFeatures, id];
        setValue("features", newFeatures, { shouldValidate: true });
    };

    const estimate = useMemo(() => {
        const selectedType = PROJECT_TYPES.find(t => t.id === formData.type);
        let total = selectedType?.basePrice || 0;
        formData.features.forEach(fId => {
            const feature = FEATURES.find(f => f.id === fId);
            if (feature) total += feature.price;
        });
        return total;
    }, [formData.type, formData.features]);

    return (
        <div className="w-full max-w-7xl mx-auto py-20 px-6 font-sans">
            {/* Steps Progress - Sleeker Light Mode */}
            <div className="flex justify-center mb-16 px-4 relative z-10">
                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl border border-slate-200/60 p-2.5 rounded-2xl shadow-sm">
                    {STEPS.map((step, idx) => (
                        <div key={step.id} className="flex items-center">
                            <button
                                onClick={() => idx < currentStep && setCurrentStep(idx)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${idx === currentStep
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10 scale-105"
                                    : idx < currentStep
                                        ? "text-slate-900 hover:bg-slate-100"
                                        : "text-slate-400 pointer-events-none"
                                    }`}
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                    {idx + 1}. {step.title}
                                </span>
                                {idx < currentStep && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                            {idx < STEPS.length - 1 && (
                                <div className="w-6 h-px bg-slate-200 mx-3" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Main Form Area */}
                <div className="lg:col-span-8">
                    <div className="bg-white p-10 md:p-16 rounded-[2.5rem] min-h-[550px] flex flex-col relative overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex-grow relative z-10"
                            >
                                {currentStep === 0 && (
                                    <div className="space-y-12">
                                        <div>
                                            <h2 className="text-5xl font-heading font-black text-slate-900 tracking-tighter mb-4 uppercase italic">Vision <span className="text-blue-600">Initiale.</span></h2>
                                            <p className="text-slate-500 text-lg font-medium">Comment s'appelle votre prochain succès technologique ?</p>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Nom du Projet</label>
                                            <div className="relative group">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-1000"></div>
                                                <input
                                                    {...register("projectTitle")}
                                                    autoFocus
                                                    placeholder="ex: NEXUS CORE PLATFORM"
                                                    className="relative w-full bg-slate-50 border border-slate-200 p-8 rounded-2xl text-2xl font-heading font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white outline-none transition-all tracking-tight"
                                                />
                                            </div>
                                            {errors.projectTitle && <p className="text-red-500 text-xs font-bold pl-1">{errors.projectTitle.message}</p>}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div className="space-y-12">
                                        <div>
                                            <h2 className="text-5xl font-heading font-black text-slate-900 tracking-tighter mb-4 uppercase italic">Architecture.</h2>
                                            <p className="text-slate-500 text-lg font-medium">Sur quel support votre vision doit-elle s'ancrer ?</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {PROJECT_TYPES.map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setValue("type", type.id, { shouldValidate: true })}
                                                    className={`p-8 rounded-[2rem] border transition-all text-left flex flex-col group relative overflow-hidden ${formData.type === type.id
                                                        ? "border-blue-500 bg-blue-50/50 shadow-xl shadow-blue-500/10"
                                                        : "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50"
                                                        }`}
                                                >
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all ${formData.type === type.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 rotate-3" : "bg-white border border-slate-100 text-slate-400 group-hover:text-blue-600 group-hover:rotate-6"}`}>
                                                        <type.icon className="w-7 h-7" />
                                                    </div>
                                                    <h3 className={`font-heading font-bold text-xl mb-3 ${formData.type === type.id ? "text-blue-900" : "text-slate-900"}`}>{type.title}</h3>
                                                    <p className="text-slate-500 text-xs leading-relaxed mb-6">{type.desc}</p>
                                                    <p className={`text-[10px] font-black uppercase tracking-widest mt-auto italic ${formData.type === type.id ? "text-blue-600" : "text-slate-300"}`}>Start: {type.basePrice}€</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-12">
                                        <div>
                                            <h2 className="text-5xl font-heading font-black text-slate-900 tracking-tighter mb-4 uppercase italic">Composants.</h2>
                                            <p className="text-slate-500 text-lg font-medium">Activez les modules techniques nécessaires.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {FEATURES.map((feature) => (
                                                <button
                                                    key={feature.id}
                                                    onClick={() => toggleFeature(feature.id)}
                                                    className={`p-8 rounded-[2rem] border transition-all text-left flex items-center gap-8 group relative ${formData.features.includes(feature.id)
                                                        ? "border-blue-500 bg-blue-50/50 shadow-xl shadow-blue-500/10"
                                                        : "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200"
                                                        }`}
                                                >
                                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all ${formData.features.includes(feature.id) ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white border border-slate-100 text-slate-400 group-hover:scale-105"}`}>
                                                        <feature.icon className="w-7 h-7" />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h3 className={`font-heading font-bold mb-1 ${formData.features.includes(feature.id) ? "text-blue-900" : "text-slate-900"}`}>{feature.title}</h3>
                                                        <p className="text-slate-400 text-[10px] font-medium leading-normal mb-1">{feature.desc}</p>
                                                        <p className="text-[10px] font-black uppercase text-blue-500 tracking-wider">+{feature.price}€</p>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.features.includes(feature.id) ? "bg-blue-600 border-blue-600" : "border-slate-200 bg-white group-hover:border-blue-400"}`}>
                                                        {formData.features.includes(feature.id) && <CheckCircle2 className="text-white w-4 h-4" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-12">
                                        <div>
                                            <h2 className="text-5xl font-heading font-black text-slate-900 tracking-tighter mb-4 uppercase italic">Vitesse.</h2>
                                            <p className="text-slate-500 text-lg font-medium">Définissez le rythme de mise en production.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {[
                                                { id: 'standard', title: 'Standard', desc: 'Livraison sous 6-8 semaines.', icon: Cpu },
                                                { id: 'accelerated', title: 'Accéléré', desc: 'Rendu sous 4 semaines.', icon: Zap },
                                                { id: 'urgent', title: 'Sprint', desc: 'MVP en 14 jours chrono.', icon: Rocket },
                                            ].map((t) => (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => setValue("timeline", t.id)}
                                                    className={`p-8 rounded-[2rem] border transition-all text-left flex flex-col ${formData.timeline === t.id
                                                        ? "border-blue-500 bg-blue-50/50 shadow-xl shadow-blue-500/10"
                                                        : "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200"
                                                        }`}
                                                >
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${formData.timeline === t.id ? "bg-blue-600 text-white" : "bg-white border border-slate-100 text-slate-400"}`}>
                                                        <t.icon className="w-5 h-5" />
                                                    </div>
                                                    <h3 className={`font-heading font-bold mb-2 ${formData.timeline === t.id ? "text-blue-900" : "text-slate-900"}`}>{t.title}</h3>
                                                    <p className="text-slate-500 text-[11px] leading-relaxed">{t.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="space-y-12 max-w-xl">
                                        <div>
                                            <h2 className="text-5xl font-heading font-black text-slate-900 tracking-tighter mb-4 uppercase italic">Identité.</h2>
                                            <p className="text-slate-500 text-lg font-medium">Finalisez votre inscription pour lancer la phase d'analyse.</p>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nom / Dossier</label>
                                                <input
                                                    {...register("name")}
                                                    placeholder="VOTRE NOM COMPLET"
                                                    className="w-full p-6 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold tracking-tight text-slate-900 placeholder:text-slate-300"
                                                />
                                                {errors.name && <p className="text-red-500 text-xs font-bold pl-1">{errors.name.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Accès</label>
                                                <input
                                                    {...register("email")}
                                                    type="email"
                                                    placeholder="ACCES@ENTREPRISE.COM"
                                                    className="w-full p-6 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold tracking-tight text-slate-900 placeholder:text-slate-300"
                                                />
                                                {errors.email && <p className="text-red-500 text-xs font-bold pl-1">{errors.email.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mot de passe</label>
                                                <input
                                                    {...register("password")}
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="w-full p-6 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                                />
                                                {errors.password && <p className="text-red-500 text-xs font-bold pl-1">{errors.password.message}</p>}
                                            </div>

                                            <button
                                                onClick={handleSubmit(onFormSubmit)}
                                                disabled={submitting}
                                                className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-4 mt-8 hover:bg-black"
                                            >
                                                {submitting ? (
                                                    <><Loader2 className="w-5 h-5 animate-spin" /> INITIALISATION...</>
                                                ) : (
                                                    <>INITIALISER LE PROJET <ArrowRight className="w-5 h-5" /></>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="mt-auto flex justify-between items-center pt-10 border-t border-border/50 relative z-10">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${currentStep === 0 ? "opacity-0 pointer-events-none" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"}`}
                            >
                                <ChevronLeft className="w-4 h-4" /> Retour
                            </button>

                            {currentStep < STEPS.length - 1 && (
                                <button
                                    onClick={nextStep}
                                    className="flex items-center gap-4 px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-900/10"
                                >
                                    Suivant <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Dynamic Summary */}
                <div className="lg:col-span-4 sticky top-12 space-y-6">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 overflow-hidden relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 mb-10 flex items-center gap-2 italic">
                            <Briefcase className="w-4 h-4 text-blue-600" /> Config_Actuelle
                        </h3>

                        <div className="space-y-8">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Titre</span>
                                <span className="text-xl font-heading font-black text-slate-900 uppercase italic truncate">
                                    {formData.projectTitle || "SANS_TITRE"}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Type</span>
                                    <span className="text-slate-900 font-bold uppercase text-xs tracking-wider">
                                        {formData.type || "N/A"}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phase</span>
                                    <span className="text-slate-900 font-bold uppercase text-xs tracking-wider">
                                        {formData.timeline || "N/A"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Modules Système</span>
                                <div className="flex flex-wrap gap-2">
                                    {formData.features.map(f => (
                                        <span key={f} className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100">
                                            {f}
                                        </span>
                                    ))}
                                    {formData.features.length === 0 && <span className="text-[9px] font-medium text-slate-300 italic">Aucun module</span>}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 mt-10">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 italic">Estimation Flux Financier</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-5xl font-heading font-black text-slate-900 tracking-tighter">{estimate}€</span>
                                    <span className="text-slate-300 font-black uppercase text-[10px] mb-3 tracking-widest">BASE_TECH</span>
                                </div>
                                <p className="text-[9px] text-slate-400 mt-4 leading-relaxed font-bold uppercase tracking-tight">
                                    * Analyse technique incluse. Hébergement et maintenance calculés après audit.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center gap-6">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-[10px] text-indigo-900 font-bold leading-relaxed uppercase tracking-widest italic">
                            Accès immédiat au dashboard de pilotage après validation de l'empreinte.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

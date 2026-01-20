"use client";

import { useState, useMemo, useEffect } from "react";
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
    ChevronLeft,
    Terminal,
    ArrowRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatCurrency, getClientCurrency, Currency } from "@/lib/utils/currency";
import { Logo } from "../shared/Logo";

const STEPS = [
    { id: "concept", title: "DÉSIGNATION" },
    { id: "type", title: "ARCHITECTURE" },
    { id: "features", title: "MODULES_SYSTÈME" },
    { id: "timeline", title: "DÉLAIS" },
    { id: "account", title: "UNITÉ_OPÉRATIONNELLE" }
];

const PROJECT_TYPES = [
    { id: "starter", title: "Solution_Lite", icon: Cpu, basePrice: 800, desc: "Parfait pour un MVP ou un petit outil interne." },
    { id: "web", title: "Plateforme_Web", icon: Globe, basePrice: 1800, desc: "Idéal pour un SaaS, un ERP ou un site complexe." },
    { id: "mobile", title: "Application_Mobile", icon: Smartphone, basePrice: 3200, desc: "Pour iOS et Android avec performance maximale." },
];

const FEATURES = [
    { id: "auth", title: "Client_Node", price: 300, icon: ShieldCheck, desc: "Comptes sécurisés, emails et profils." },
    { id: "payments", title: "Fiscal_Bridge", price: 600, icon: CreditCard, desc: "Acceptez les cartes et générez des factures." },
    { id: "chat", title: "Comm_Interface", price: 900, icon: MessageSquare, desc: "Messagerie instantanée interne pour vos utilisateurs." },
    { id: "admin", title: "Command_Center", price: 1200, icon: Layout, desc: "Outil complet pour gérer toute votre activité." },
];

const formSchema = z.object({
    projectTitle: z.string().min(3, "Donnez un nom à votre projet"),
    type: z.string().min(1, "Veuillez choisir une base"),
    features: z.array(z.string()).min(1, "Sélectionnez au moins une option"),
    budget: z.string(),
    timeline: z.string(),
    name: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "8 caractères minimum"),
});

type FormData = z.infer<typeof formSchema>;

export default function ProjectBuilder() {
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [currency, setCurrency] = useState<Currency>('EUR');

    useEffect(() => {
        setCurrency(getClientCurrency());
        const sync = () => setCurrency(getClientCurrency());
        window.addEventListener('currencyChange', sync);
        return () => window.removeEventListener('currencyChange', sync);
    }, []);

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
            type: "starter",
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
        <div className="w-full max-w-7xl mx-auto py-20 px-6">

            {/* Serious Tech Background */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-background/90" />
            </div>

            {/* Steps Progress - Technical Bar */}
            <div className="max-w-4xl mx-auto mb-16 relative z-10 px-4">
                <div className="h-1 w-full bg-border/20 rounded-full overflow-hidden mb-8">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                    />
                </div>
                <div className="flex justify-center flex-wrap gap-2">
                    {STEPS.map((step, idx) => (
                        <div key={step.id} className="flex items-center">
                            <button
                                type="button"
                                onClick={() => idx < currentStep && setCurrentStep(idx)}
                                className={`flex items-center gap-3 px-6 py-2 rounded-full transition-all duration-500 border ${idx === currentStep
                                    ? "bg-primary text-background border-primary shadow-[0_0_20px_rgba(37,99,235,0.2)] scale-105"
                                    : idx < currentStep
                                        ? "text-primary border-primary/20 hover:bg-primary/5"
                                        : "text-secondary/20 border-transparent pointer-events-none"
                                    }`}
                            >
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">
                                    {step.title}
                                </span>
                                {idx < currentStep && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                {/* Main Form Area */}
                <div className="lg:col-span-8">
                    <div className="bg-card/30 backdrop-blur-sm p-12 md:p-20 rounded-[3rem] min-h-[650px] flex flex-col relative overflow-hidden shadow-2xl border border-border/50">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5 }}
                                className="flex-grow relative z-10"
                            >
                                {currentStep === 0 && (
                                    <div className="space-y-16">
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="w-10 h-[1px] bg-accent" />
                                                <span className="text-accent font-black tracking-[0.4em] uppercase text-[10px] italic">IDENT_NAMESPACE</span>
                                            </div>
                                            <h2 className="text-6xl md:text-8xl font-black text-primary tracking-tighter mb-6 uppercase italic leading-none">Nom du <span className="text-secondary/20">Projet.</span></h2>
                                            <p className="text-secondary/60 text-lg font-medium max-w-xl italic">Comment souhaitez-vous appeler votre mission ?</p>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="relative flex items-center group">
                                                <input
                                                    {...register("projectTitle")}
                                                    autoFocus
                                                    placeholder="EX: MA_PLATEFORME_2026"
                                                    aria-label="Nom du projet"
                                                    className="w-full bg-background/50 border border-border/50 p-10 rounded-[2rem] text-4xl font-black text-primary placeholder:text-secondary/10 focus:border-primary outline-none transition-all tracking-tighter italic uppercase"
                                                />
                                            </div>
                                            {errors.projectTitle && <p className="text-red-500 text-[10px] font-black tracking-widest pl-2 uppercase italic">// ERROR: {errors.projectTitle.message}</p>}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div className="space-y-16">
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="w-10 h-[1px] bg-accent" />
                                                <span className="text-accent font-black tracking-[0.4em] uppercase text-[10px] italic">BASE_ARCHITECTURE</span>
                                            </div>
                                            <h2 className="text-6xl md:text-8xl font-black text-primary tracking-tighter mb-6 uppercase italic leading-none">Le <span className="text-secondary/20">Type.</span></h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            {PROJECT_TYPES.map((type) => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setValue("type", type.id, { shouldValidate: true })}
                                                    className={`p-10 rounded-[2.5rem] border-2 transition-all text-left flex flex-col group relative overflow-hidden ${formData.type === type.id
                                                        ? "border-primary bg-primary/5 shadow-2xl"
                                                        : "border-border/30 bg-background/20 hover:border-primary/30"
                                                        }`}
                                                >
                                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-all ${formData.type === type.id ? "bg-primary text-background rotate-6 shadow-lg shadow-primary/20" : "bg-card border border-border/50 text-secondary/40 group-hover:text-primary"}`}>
                                                        <type.icon className="w-8 h-8" />
                                                    </div>
                                                    <h3 className={`font-black text-xl mb-4 uppercase italic tracking-tight ${formData.type === type.id ? "text-primary" : "text-primary/60"}`}>{type.title}</h3>
                                                    <p className="text-secondary/50 text-[11px] font-medium leading-relaxed mb-10">{type.desc}</p>
                                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-auto italic ${formData.type === type.id ? "text-primary" : "text-secondary/20"}`}>À partir de: {formatCurrency(type.basePrice, currency)}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-16">
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="w-10 h-[1px] bg-accent" />
                                                <span className="text-accent font-black tracking-[0.4em] uppercase text-[10px] italic">CORE_FEATURES</span>
                                            </div>
                                            <h2 className="text-6xl md:text-8xl font-black text-primary tracking-tighter mb-6 uppercase italic leading-none">Options <span className="text-secondary/20">Clés.</span></h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {FEATURES.map((feature) => (
                                                <button
                                                    key={feature.id}
                                                    type="button"
                                                    onClick={() => toggleFeature(feature.id)}
                                                    className={`p-10 rounded-[2.5rem] border-2 transition-all text-left flex items-center gap-10 group relative ${formData.features.includes(feature.id)
                                                        ? "border-primary bg-primary/5 shadow-2xl"
                                                        : "border-border/30 bg-background/20 hover:border-primary/30"
                                                        }`}
                                                >
                                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 transition-all ${formData.features.includes(feature.id) ? "bg-primary text-background shadow-lg shadow-primary/20" : "bg-card border border-border/50 text-secondary/40 group-hover:scale-105"}`}>
                                                        <feature.icon className="w-8 h-8" />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h3 className={`font-black mb-2 uppercase italic tracking-tight ${formData.features.includes(feature.id) ? "text-primary" : "text-primary/60"}`}>{feature.title}</h3>
                                                        <p className="text-secondary/50 text-[10px] font-medium leading-normal mb-3">{feature.desc}</p>
                                                        <p className="text-[10px] font-black uppercase text-accent tracking-[0.2em] italic">+{formatCurrency(feature.price, currency)}</p>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${formData.features.includes(feature.id) ? "bg-primary border-primary" : "border-border/50 bg-card group-hover:border-primary/50"}`}>
                                                        {formData.features.includes(feature.id) && <CheckCircle2 className="text-background w-5 h-5" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}


                                {currentStep === 3 && (
                                    <div className="space-y-16">
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="w-10 h-[1px] bg-accent" />
                                                <span className="text-accent font-black tracking-[0.4em] uppercase text-[10px] italic">VELOCITY_RATIO</span>
                                            </div>
                                            <h2 className="text-6xl md:text-8xl font-black text-primary tracking-tighter mb-6 uppercase italic leading-none">Ratio <span className="text-secondary/20">Accélération.</span></h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            {[
                                                { id: 'standard', title: 'Stable Build', desc: 'Déploiement en 6-8 semaines.', icon: Cpu, label: "01" },
                                                { id: 'accelerated', title: 'Overclocked', desc: 'Rendu sous 4 semaines.', icon: Zap, label: "02" },
                                                { id: 'urgent', title: 'Mach Sprint', desc: 'MVP en 14 jours chrono.', icon: Rocket, label: "03" },
                                            ].map((t) => (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => setValue("timeline", t.id)}
                                                    className={`p-10 rounded-[2.5rem] border-2 transition-all text-left flex flex-col group relative ${formData.timeline === t.id
                                                        ? "border-primary bg-primary/5 shadow-2xl"
                                                        : "border-border/30 bg-background/20 hover:border-primary/30"
                                                        }`}
                                                >
                                                    <div className="absolute top-6 right-8 text-2xl font-black text-primary/5 italic">{t.label}</div>
                                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-8 ${formData.timeline === t.id ? "bg-primary text-background shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "bg-card border border-border/50 text-secondary/40"}`}>
                                                        <t.icon className="w-6 h-6" />
                                                    </div>
                                                    <h3 className={`font-black mb-3 uppercase italic tracking-tight ${formData.timeline === t.id ? "text-primary" : "text-primary/60"}`}>{t.title}</h3>
                                                    <p className="text-secondary/50 text-[11px] leading-relaxed font-medium">{t.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="space-y-16 max-w-xl">
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="w-10 h-[1px] bg-accent" />
                                                <span className="text-accent font-black tracking-[0.4em] uppercase text-[10px] italic">OPERATOR_REGISTRATION</span>
                                            </div>
                                            <h2 className="text-6xl md:text-8xl font-black text-primary tracking-tighter mb-6 uppercase italic leading-none">Identité <span className="text-secondary/20">Protocole.</span></h2>
                                        </div>
                                        <div className="space-y-8">
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/40 ml-2 italic">// Nom_Opérateur</label>
                                                <input
                                                    {...register("name")}
                                                    placeholder="IDENTITÉ REELLE"
                                                    aria-label="Nom complet de l'opérateur"
                                                    className="w-full p-8 rounded-[1.5rem] bg-background/50 border border-border/50 focus:border-primary outline-none transition-all font-black text-xl italic tracking-tight text-primary uppercase placeholder:text-secondary/10"
                                                />
                                                {errors.name && <p className="text-red-500 text-[10px] font-black tracking-widest pl-2 uppercase italic">// ERROR: {errors.name.message}</p>}
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/40 ml-2 italic">// Point_Accès_Comms</label>
                                                <input
                                                    {...register("email")}
                                                    type="email"
                                                    placeholder="NAME@ENTERPRISE.COM"
                                                    aria-label="Adresse email professionnelle"
                                                    className="w-full p-8 rounded-[1.5rem] bg-background/50 border border-border/50 focus:border-primary outline-none transition-all font-black text-xl italic tracking-tight text-primary uppercase placeholder:text-secondary/10"
                                                />
                                                {errors.email && <p className="text-red-500 text-[10px] font-black tracking-widest pl-2 uppercase italic">// ERROR: {errors.email.message}</p>}
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/40 ml-2 italic">// Clé_Chiffrage</label>
                                                <input
                                                    {...register("password")}
                                                    type="password"
                                                    placeholder="••••••••••••"
                                                    aria-label="Mot de passe de sécurité"
                                                    className="w-full p-8 rounded-[1.5rem] bg-background/50 border border-border/50 focus:border-primary outline-none transition-all font-black text-xl text-primary placeholder:text-secondary/10"
                                                />
                                                {errors.password && <p className="text-red-500 text-[10px] font-black tracking-widest pl-2 uppercase italic">// ERROR: {errors.password.message}</p>}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleSubmit(onFormSubmit)}
                                                disabled={submitting}
                                                className="w-full py-10 bg-primary text-background rounded-[1.5rem] font-black text-xs tracking-[0.4em] uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:opacity-50 flex items-center justify-center gap-6 mt-12 italic"
                                            >
                                                {submitting ? (
                                                    <><Loader2 className="w-5 h-5 animate-spin" /> SYNCHRONISATION_CORE...</>
                                                ) : (
                                                    <>DÉPLOYER_MAINFRAME <ArrowRight className="w-5 h-5" /></>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="mt-20 flex justify-between items-center pt-12 border-t border-border/20 relative z-10">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className={`flex items-center gap-4 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all italic ${currentStep === 0 ? "opacity-0 pointer-events-none" : "text-secondary/40 hover:text-primary hover:bg-primary/5"}`}
                            >
                                <ChevronLeft className="w-4 h-4" /> PREV_SIGNAL
                            </button>

                            {currentStep < STEPS.length - 1 && (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center gap-6 px-16 py-6 bg-primary text-background rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:opacity-90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] italic"
                                >
                                    CONTINUER <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Dynamic Manifest - Industrial Style */}
                <div className="lg:col-span-4 sticky top-12 space-y-8">
                    <div className="bg-card/30 backdrop-blur-xl p-12 rounded-[2.5rem] border border-border/50 overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-12 flex items-center gap-3 italic">
                            <Terminal className="w-4 h-4 text-accent" /> CONFIG_MANIFEST_V1.0
                        </h3>

                        <div className="space-y-10">
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-secondary/30 uppercase tracking-[0.2em] italic">// Projet</p>
                                <p className="text-2xl font-black text-primary uppercase italic tracking-tighter truncate">{formData.projectTitle || "NON DÉFINI"}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-secondary/30 uppercase tracking-[0.2em] italic">// Base</p>
                                <p className="text-sm font-black text-primary uppercase italic">{PROJECT_TYPES.find(t => t.id === formData.type)?.title}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-secondary/30 uppercase tracking-[0.2em] italic">// Options</p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.features.map(fId => (
                                        <span key={fId} className="px-3 py-1 bg-background/50 border border-border/50 rounded-lg text-[9px] font-black text-primary/60 uppercase tracking-widest italic">
                                            {FEATURES.find(f => f.id === fId)?.title}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-10 border-t border-border/20">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] italic">Estimation:</span>
                                    <span className="text-4xl font-black text-primary italic tracking-tight">{formatCurrency(estimate, currency)}</span>
                                </div>
                                <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-2 text-right">
                                    ~ {Math.round(estimate * 655).toLocaleString()} FCFA
                                </p>
                            </div>
                        </div>

                        {/* Aesthetic Data Stream */}
                        <div className="mt-12 pt-8 border-t border-border/10 font-mono text-[8px] text-secondary/20 uppercase tracking-[0.3em] space-y-1">
                            <p>SYS_STATUS: READY</p>
                            <p>BUF_STREAM: ${Buffer.from(formData.projectTitle).toString('hex').slice(0, 12)}</p>
                            <p>ENCR_KEY: 256-BIT_AES</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 px-8 py-6 rounded-2xl bg-primary/5 border border-primary/10">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic">Server_Sync: AF_WEST_HUB_STABLE</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

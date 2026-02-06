"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe,
    Smartphone,
    CreditCard,
    MessageSquare,
    Layout,
    CheckCircle2,
    Loader2,
    Code,
    Users,
    ChevronLeft,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatCurrency, getClientCurrency, Currency } from "@/lib/utils/currency";
import { supabase } from "@/lib/supabase";

const STEPS = [
    { id: "intro", title: "Nom" },
    { id: "type", title: "Type" },
    { id: "features", title: "Options" },
    { id: "info", title: "Contact" }
];

const PROJECT_TYPES = [
    { id: "starter", title: "Petit Projet", icon: Sparkles, basePrice: 800, desc: "Pour tester une idée (MVP)." },
    { id: "web", title: "Site Web", icon: Globe, basePrice: 1800, desc: "Site complet ou plateforme." },
    { id: "mobile", title: "Application Mobile", icon: Smartphone, basePrice: 3200, desc: "Application iPhone & Android." },
];

const FEATURES = [
    { id: "auth", title: "Comptes Utilisateurs", price: 300, icon: Users, desc: "Vos utilisateurs peuvent s'inscrire et se connecter." },
    { id: "payments", title: "Paiements en ligne", price: 600, icon: CreditCard, desc: "Acceptez les cartes bancaires facilement." },
    { id: "chat", title: "Messagerie", price: 900, icon: MessageSquare, desc: "Chat en direct entre les utilisateurs." },
    { id: "admin", title: "Panneau d'Admin", price: 1200, icon: Layout, desc: "Gérez tout le contenu de votre app." },
];

const formSchema = z.object({
    projectTitle: z.string().min(3, "Donnez un nom à votre projet"),
    type: z.string().min(1, "Veuillez choisir un type"),
    features: z.array(z.string()),
    budget: z.string().optional(),
    timeline: z.string().optional(), // Made optional or hidden in simple mode
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
        // Step 2 (Features) is optional regarding validation (array can vary), but we require min 1 usually? 
        // Let's say user can have 0 features if they want basic.
        if (currentStep === 3) fieldsToValidate = ["name", "email", "password"];

        const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;
        if (isValid) {
            setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
        }
    };

    const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

    const onFormSubmit = async (data: FormData) => {
        setSubmitting(true);
        try {
            // Add default timeline/budget if missing for simplification
            const payload = {
                ...data,
                budget: "medium",
                timeline: "standard"
            };
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (result.success) {
                // IMPORTANT: Sign in the user automatically so they don't see "Invité" or an empty dashboard
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: data.email,
                    password: data.password
                });

                if (signInError) {
                    console.error("Auto-login failed:", signInError);
                    window.location.href = "/login?registered=true";
                } else {
                    window.location.href = "/dashboard";
                }
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
        setValue("features", newFeatures);
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
        <div className="w-full max-w-5xl mx-auto py-8 px-4">

            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-10">
                <div className="h-2 w-full bg-secondary/10 rounded-full overflow-hidden mb-4">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <div className="flex justify-between text-xs font-bold text-secondary/40 uppercase tracking-widest px-1">
                    {STEPS.map((step, idx) => (
                        <span key={step.id} className={idx <= currentStep ? "text-primary" : ""}>
                            {step.title}
                        </span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

                {/* Form Card */}
                <div className="md:col-span-2 bg-card border border-border/50 rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="min-h-[300px]"
                        >
                            {/* STEP 1: Name */}
                            {currentStep === 0 && (
                                <div className="space-y-6">
                                    <h2 className="text-3xl font-black text-primary mb-2">Comment s'appelle votre projet ?</h2>
                                    <p className="text-secondary/60 text-lg">Donnez-lui un nom, même temporaire.</p>
                                    <div className="pt-4">
                                        <input
                                            {...register("projectTitle")}
                                            placeholder="Mon Super Projet"
                                            onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                                            autoFocus
                                            className="w-full bg-background border-2 border-border/50 p-6 rounded-2xl text-2xl font-bold text-primary focus:border-primary outline-none transition-all placeholder:text-secondary/20"
                                        />
                                        {errors.projectTitle && <p className="text-red-500 text-sm font-bold mt-2">{errors.projectTitle.message}</p>}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Type */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h2 className="text-3xl font-black text-primary mb-2">Que voulez-vous créer ?</h2>
                                    <p className="text-secondary/60 text-lg">Choisissez le type de projet.</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                        {PROJECT_TYPES.map((type) => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => {
                                                    setValue("type", type.id);
                                                    nextStep();
                                                }}
                                                className={`p-6 rounded-2xl border-2 transition-all text-left flex flex-col items-center text-center gap-4 ${formData.type === type.id
                                                    ? "border-primary bg-primary/5 shadow-md"
                                                    : "border-border/30 hover:border-primary/30"
                                                    }`}
                                            >
                                                <type.icon className={`w-10 h-10 ${formData.type === type.id ? "text-primary" : "text-secondary/40"}`} />
                                                <div>
                                                    <h3 className="font-bold text-lg text-primary">{type.title}</h3>
                                                    <p className="text-sm text-secondary/60 mt-1">{type.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Features */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h2 className="text-3xl font-black text-primary mb-2">Fonctionnalités</h2>
                                    <p className="text-secondary/60 text-lg">De quoi avez-vous besoin ?</p>
                                    <div className="grid grid-cols-1 gap-4 mt-4">
                                        {FEATURES.map((feature) => (
                                            <button
                                                key={feature.id}
                                                type="button"
                                                onClick={() => toggleFeature(feature.id)}
                                                className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${formData.features.includes(feature.id)
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border/30 hover:border-primary/30"
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${formData.features.includes(feature.id) ? "bg-primary text-background" : "bg-secondary/10 text-secondary"}`}>
                                                    <feature.icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-bold text-primary">{feature.title}</h3>
                                                    <p className="text-xs text-secondary/60">{feature.desc}</p>
                                                </div>
                                                {formData.features.includes(feature.id) && <CheckCircle2 className="w-6 h-6 text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: Info (Final) */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h2 className="text-3xl font-black text-primary mb-2">C'est presque fini !</h2>
                                    <p className="text-secondary/60 text-lg">Créez votre compte pour suivre le projet.</p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-wider text-secondary/50 mb-1 block">Votre Nom</label>
                                            <input
                                                {...register("name")}
                                                className="w-full bg-background border border-border p-4 rounded-xl font-bold focus:border-primary outline-none"
                                                placeholder="Jean Dupont"
                                            />
                                            {errors.name && <span className="text-red-500 text-xs font-bold">{errors.name.message}</span>}
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-wider text-secondary/50 mb-1 block">Email</label>
                                            <input
                                                {...register("email")}
                                                type="email"
                                                className="w-full bg-background border border-border p-4 rounded-xl font-bold focus:border-primary outline-none"
                                                placeholder="jean@exemple.com"
                                            />
                                            {errors.email && <span className="text-red-500 text-xs font-bold">{errors.email.message}</span>}
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-wider text-secondary/50 mb-1 block">Mot de passe</label>
                                            <input
                                                {...register("password")}
                                                type="password"
                                                className="w-full bg-background border border-border p-4 rounded-xl font-bold focus:border-primary outline-none"
                                                placeholder="••••••••"
                                            />
                                            {errors.password && <span className="text-red-500 text-xs font-bold">{errors.password.message}</span>}
                                        </div>

                                        <button
                                            onClick={handleSubmit(onFormSubmit)}
                                            disabled={submitting}
                                            className="w-full py-4 mt-4 bg-primary text-background rounded-xl font-black text-sm uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                        >
                                            {submitting ? <Loader2 className="animate-spin" /> : "Lancer le projet"}
                                        </button>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    {/* Footer Nav */}
                    <div className="mt-8 flex justify-between pt-6 border-t border-border/10">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${currentStep === 0 ? "opacity-0 pointer-events-none" : "text-secondary hover:text-primary"}`}
                        >
                            <ChevronLeft className="w-4 h-4" /> Retour
                        </button>

                        {currentStep < STEPS.length - 1 && (
                            <button
                                onClick={nextStep}
                                className="flex items-center gap-2 px-6 py-3 bg-primary text-background rounded-full text-sm font-bold uppercase tracking-wider hover:scale-105 transition-transform"
                            >
                                Continuer <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="md:col-span-1 bg-card/50 border border-border/50 rounded-3xl p-6 sticky top-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6">Récapitulatif</h3>

                    <div className="space-y-4">
                        <div className="pb-4 border-b border-border/10">
                            <span className="block text-[10px] font-bold text-secondary/40 uppercase tracking-widest mb-1">Type</span>
                            <span className="font-bold text-primary">{PROJECT_TYPES.find(t => t.id === formData.type)?.title}</span>
                        </div>
                        {formData.features.length > 0 && (
                            <div className="pb-4 border-b border-border/10">
                                <span className="block text-[10px] font-bold text-secondary/40 uppercase tracking-widest mb-1">Options</span>
                                <div className="flex flex-wrap gap-1">
                                    {formData.features.map(fId => (
                                        <span key={fId} className="text-xs bg-background border border-border/50 px-2 py-1 rounded text-secondary/80">
                                            {FEATURES.find(f => f.id === fId)?.title}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="pt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-secondary">Estimation</span>
                                <span className="text-xl font-black text-primary">{formatCurrency(estimate, currency)}</span>
                            </div>
                            <p className="text-[10px] font-bold text-secondary/40 text-right mt-1">
                                ~ {Math.round(estimate * 655).toLocaleString()} FCFA
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

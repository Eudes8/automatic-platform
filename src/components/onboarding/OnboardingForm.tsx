// File initialized by AUTOMATIC
// src/components/onboarding/OnboardingForm.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Code2, Smartphone, Globe, ArrowRight, Check, Loader2 } from "lucide-react";

const STEPS = [
  { id: 1, title: "Votre Vision", subtitle: "Quel type d'application voulez-vous ?" },
  { id: 2, title: "Fonctionnalités", subtitle: "Quels sont les besoins critiques ?" },
  { id: 3, title: "Identité", subtitle: "Créez votre accès au siège virtuel." }
];

export default function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    features: [] as string[],
    name: "",
    email: "",
    projectName: ""
  });

  const nextStep = () => setStep((s) => s + 1);

  const handleSubmit = async () => {
    setLoading(true);
    // Simulation d'appel API / Server Action
    setTimeout(() => {
      window.location.href = "/dashboard"; // Redirection vers l'espace client
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      {/* Stepper Progress */}
      <div className="flex justify-between mb-8 sm:mb-12 gap-2">
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-1 sm:gap-2 flex-1">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-base transition-all ${
              step >= s.id ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]" : "bg-white/10 text-slate-500"
            }`}>
              {step > s.id ? <Check size={16} className="sm:size-5" /> : s.id}
            </div>
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center leading-tight ${step >= s.id ? "text-white" : "text-slate-600"}`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur-xl"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2 uppercase tracking-tighter">
            {STEPS[step - 1].subtitle}
          </h2>
          <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">Étape {step} sur 3 — AUTOMATIC process</p>

          {/* Step 1: Project Type */}
          {step === 1 && (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {[
                { id: "web", label: "Web App", icon: <Globe /> },
                { id: "mobile", label: "Mobile App", icon: <Smartphone /> },
                { id: "saas", label: "SaaS Platform", icon: <Rocket /> },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setFormData({...formData, type: t.id}); nextStep(); }}
                  className={`p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border transition-all text-left group flex items-center gap-3 sm:gap-4 ${
                    formData.type === t.id ? "border-blue-500 bg-blue-500/10" : "border-white/5 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="text-blue-500 group-hover:scale-110 transition-transform flex-shrink-0">{t.icon}</div>
                  <div className="text-base sm:text-lg md:text-xl font-bold text-white uppercase tracking-tighter">{t.label}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Features */}
          {step === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {["Paiements", "Chat Temps Réel", "IA Générative", "Dashboard Admin", "Auth Sociale", "API Publique"].map((f) => (
                  <label key={f} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-all">
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 sm:w-5 sm:h-5 accent-orange-500 flex-shrink-0"
                        onChange={(e) => {
                            const val = e.target.checked ? [...formData.features, f] : formData.features.filter(i => i !== f);
                            setFormData({...formData, features: val});
                        }}
                    />
                    <span className="text-white font-medium text-sm sm:text-base">{f}</span>
                  </label>
                ))}
              </div>
              <button onClick={nextStep} className="w-full py-4 sm:py-5 bg-blue-600 rounded-xl sm:rounded-2xl text-white font-black text-base sm:text-lg hover:bg-blue-700 transition-all">
                CONTINUER
              </button>
            </div>
          )}

          {/* Step 3: Account Creation */}
          {step === 3 && (
            <div className="space-y-3 sm:space-y-4">
              <input 
                type="text" 
                placeholder="Nom complet" 
                className="w-full p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-white text-sm sm:text-base focus:border-orange-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <input 
                type="email" 
                placeholder="Email professionnel" 
                className="w-full p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-white text-sm sm:text-base focus:border-orange-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
               <input 
                type="text" 
                placeholder="Nom du projet" 
                className="w-full p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-white text-sm sm:text-base focus:border-orange-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
              />
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full py-4 sm:py-5 bg-orange-500 rounded-xl sm:rounded-2xl text-white font-black text-base sm:text-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : "CRÉER MON ESPACE VIRTUEL"}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
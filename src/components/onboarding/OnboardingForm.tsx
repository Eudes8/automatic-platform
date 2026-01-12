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
    <div className="max-w-4xl mx-auto p-6">
      {/* Stepper Progress */}
      <div className="flex justify-between mb-12">
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step >= s.id ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]" : "bg-white/10 text-slate-500"
            }`}>
              {step > s.id ? <Check size={20} /> : s.id}
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest ${step >= s.id ? "text-white" : "text-slate-600"}`}>
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
          className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl"
        >
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">
            {STEPS[step - 1].subtitle}
          </h2>
          <p className="text-slate-400 mb-8">Étape {step} sur 3 — AUTOMATIC process</p>

          {/* Step 1: Project Type */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "web", label: "Web App", icon: <Globe /> },
                { id: "mobile", label: "Mobile App", icon: <Smartphone /> },
                { id: "saas", label: "SaaS Platform", icon: <Rocket /> },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setFormData({...formData, type: t.id}); nextStep(); }}
                  className={`p-8 rounded-3xl border transition-all text-left group ${
                    formData.type === t.id ? "border-blue-500 bg-blue-500/10" : "border-white/5 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="text-blue-500 mb-4 group-hover:scale-110 transition-transform">{t.icon}</div>
                  <div className="text-xl font-bold text-white uppercase tracking-tighter">{t.label}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Features */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {["Paiements", "Chat Temps Réel", "IA Générative", "Dashboard Admin", "Auth Sociale", "API Publique"].map((f) => (
                  <label key={f} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-all">
                    <input 
                        type="checkbox" 
                        className="w-5 h-5 accent-orange-500"
                        onChange={(e) => {
                            const val = e.target.checked ? [...formData.features, f] : formData.features.filter(i => i !== f);
                            setFormData({...formData, features: val});
                        }}
                    />
                    <span className="text-white font-medium">{f}</span>
                  </label>
                ))}
              </div>
              <button onClick={nextStep} className="w-full py-5 bg-blue-600 rounded-2xl text-white font-black text-lg hover:bg-blue-700 transition-all">
                CONTINUER
              </button>
            </div>
          )}

          {/* Step 3: Account Creation */}
          {step === 3 && (
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Nom complet" 
                className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-orange-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <input 
                type="email" 
                placeholder="Email professionnel" 
                className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-orange-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
               <input 
                type="text" 
                placeholder="Nom du projet" 
                className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-orange-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
              />
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full py-5 bg-orange-500 rounded-2xl text-white font-black text-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-3"
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
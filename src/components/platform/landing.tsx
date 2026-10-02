"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Logo } from "./logo"
import type { PortfolioItem, User } from "@/lib/platform"
import { parseJsonArray } from "@/lib/platform"
import {
  ArrowRight, Sparkles, Globe, Smartphone, ShoppingBag, Layers, Palette,
  Zap, ShieldCheck, MessageSquare, FileSignature, Rocket, CheckCircle2, Star,
} from "lucide-react"

const PROJECT_TYPES = [
  { id: "web", label: "Site Vitrine", desc: "Présentez votre activité avec élégance.", icon: Globe, price: "à partir de 250 000 FCFA" },
  { id: "mobile", label: "Application Mobile", desc: "Votre app entre les mains de vos clients.", icon: Smartphone, price: "à partir de 900 000 FCFA" },
  { id: "ecommerce", label: "Boutique en Ligne", desc: "Vendez 24h/24 avec paiement sécurisé.", icon: ShoppingBag, price: "à partir de 750 000 FCFA" },
  { id: "saas", label: "Plateforme SaaS", desc: "Transformez votre idée en produit.", icon: Layers, price: "à partir de 1,8 M FCFA" },
  { id: "branding", label: "Identité & Branding", desc: "Une marque que l'on n'oublie pas.", icon: Palette, price: "à partir de 350 000 FCFA" },
]

const FEATURES = [
  { icon: Zap, title: "Ultra Rapide", desc: "Les technologies les plus modernes pour un rendu instantané, sur tous les appareils." },
  { icon: ShieldCheck, title: "Sécurité de Pointe", desc: "Authentification robuste, données chiffrées et contrats certifiés électroniquement." },
  { icon: MessageSquare, title: "Ligne Directe", desc: "Chat temps réel avec l'équipe technique. Vos questions obtiennent des réponses." },
  { icon: FileSignature, title: "Contrat Transparent", desc: "Signature électronique intégrée, facturation claire en trois phases." },
  { icon: Rocket, title: "Suivi en Direct", desc: "Progression visible étape par étape : analyse, design, développement, livraison." },
  { icon: Sparkles, title: "Design Premium", desc: "Des interfaces qui inspirent confiance et convertissent vos visiteurs." },
]

const STEPS = [
  { n: "01", title: "Configurez", desc: "Sélectionnez votre type de projet et vos options dans le Project Builder. Estimation instantanée." },
  { n: "02", title: "Signez", desc: "Validez le devis, signez électroniquement le contrat. Le projet démarre immédiatement." },
  { n: "03", title: "Suivez", desc: "Chattez avec l'équipe, suivez chaque étape et recevez vos livrables au fil de l'eau." },
  { n: "04", title: "Livrez", desc: "Récupérez un produit finalisé, testé et documenté, avec 30 jours de garantie." },
]

export function Landing({ user, onNavigate }: { user: User | null; onNavigate: (v: "login" | "register" | "builder" | "client" | "admin") => void }) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((d) => setPortfolio((d.items ?? []).slice(0, 4)))
      .catch(() => {})
  }, [])

  const iconMap: Record<string, typeof Globe> = { web: Globe, mobile: Smartphone, ecommerce: ShoppingBag, saas: Layers, branding: Palette }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#services" className="hover:text-emerald-400 transition-colors">Services</a>
            <a href="#methode" className="hover:text-emerald-400 transition-colors">Méthode</a>
            <a href="#portfolio" className="hover:text-emerald-400 transition-colors">Portfolio</a>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => onNavigate(user.role === "ADMIN" ? "admin" : "client")} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
                Mon espace <ArrowRight size={16} />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => onNavigate("login")} className="text-zinc-300 hover:text-white">Connexion</Button>
                <Button onClick={() => onNavigate("builder")} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold hidden sm:inline-flex">
                  Démarrer un projet
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-24 pb-16">
          <div className="absolute inset-0">
            <div className="absolute top-[-20%] left-[10%] w-[45%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[5%] w-[40%] h-[45%] bg-teal-500/8 rounded-full blur-[120px]" />
            <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.25) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-8">
              <Sparkles size={15} />
              La technologie rendue simple
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}
              className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-6">
              Que voulez-vous<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">créer aujourd'hui&nbsp;?</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.16 }}
              className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
              Pas besoin de compétences techniques. Configurez votre projet, signez en ligne et suivez sa réalisation en temps réel. Nous nous occupons du reste.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.24 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={() => onNavigate(user ? (user.role === "ADMIN" ? "admin" : "client") : "builder")} size="lg" className="h-12 px-8 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-base shadow-xl shadow-emerald-500/20">
                {user ? "Accéder à mon espace" : "Lancer mon projet"} <ArrowRight size={18} />
              </Button>
              {!user && (
                <Button variant="outline" size="lg" onClick={() => onNavigate("login")} className="h-12 px-8 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white text-base">
                  J'ai déjà un compte
                </Button>
              )}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-12 flex items-center justify-center gap-8 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" /> +120 projets livrés</span>
              <span className="flex items-center gap-1.5"><Star size={15} className="text-emerald-500" fill="currentColor" /> 4,9/5 satisfaction</span>
              <span className="hidden sm:flex items-center gap-1.5"><ShieldCheck size={15} className="text-emerald-500" /> Contrat certifié</span>
            </motion.div>
          </div>
        </section>

        {/* ── Types de projets ── */}
        <section id="services" className="py-24 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-14">
              <p className="text-emerald-400 font-semibold tracking-widest uppercase text-sm">Nos expertises</p>
              <h2 className="text-3xl sm:text-5xl font-black mt-3 mb-4 tracking-tight">Cinq façons de nous lancer</h2>
              <p className="text-zinc-400 text-lg">Sélectionnez votre projet dans le Project Builder et obtenez une estimation instantanée du budget et du délai.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PROJECT_TYPES.map((t, i) => {
                const Icon = iconMap[t.id] ?? Globe
                return (
                  <motion.button key={t.id} onClick={() => onNavigate("builder")}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="group text-left p-6 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-emerald-500/40 hover:bg-zinc-900 transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-bold mb-1.5">{t.label}</h3>
                    <p className="text-sm text-zinc-400 mb-4">{t.desc}</p>
                    <span className="text-sm font-semibold text-emerald-400">{t.price}</span>
                  </motion.button>
                )
              })}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/5 border border-emerald-500/25 flex flex-col justify-center">
                <h3 className="text-lg font-bold mb-1.5 text-emerald-300">Un besoin spécifique ?</h3>
                <p className="text-sm text-zinc-300 mb-4">Décrivez-nous votre idée, nous construisons un devis sur mesure en 24h.</p>
                <Button onClick={() => onNavigate("builder")} size="sm" className="w-fit bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
                  Décrire mon projet <ArrowRight size={14} />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Méthode ── */}
        <section id="methode" className="py-24 border-t border-white/5 bg-zinc-900/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-14">
              <p className="text-emerald-400 font-semibold tracking-widest uppercase text-sm">La méthode AUTOMATIC</p>
              <h2 className="text-3xl sm:text-5xl font-black mt-3 mb-4 tracking-tight">De l'idée à la livraison, sans friction</h2>
              <p className="text-zinc-400 text-lg">Un processus éprouvé sur plus de 120 projets, entièrement pilotable depuis votre espace client.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {STEPS.map((s, i) => (
                <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-2xl bg-zinc-950/70 border border-white/5">
                  <span className="text-4xl font-black text-emerald-500/25">{s.n}</span>
                  <h3 className="text-lg font-bold mt-3 mb-2">{s.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {FEATURES.map((f, i) => (
                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="flex gap-4 p-5 rounded-2xl bg-zinc-950/70 border border-white/5">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <f.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{f.title}</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Portfolio ── */}
        <section id="portfolio" className="py-24 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-14">
              <div className="max-w-xl">
                <p className="text-emerald-400 font-semibold tracking-widest uppercase text-sm">Portfolio</p>
                <h2 className="text-3xl sm:text-5xl font-black mt-3 tracking-tight">Des projets qui parlent</h2>
              </div>
              <Button variant="outline" onClick={() => onNavigate("builder")} className="hidden sm:inline-flex border-zinc-700 text-zinc-200 hover:bg-zinc-800">
                Votre projet ici ? <ArrowRight size={16} />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {portfolio.map((p, i) => (
                <motion.article key={p.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900">
                  <div className="aspect-[16/9] overflow-hidden bg-zinc-800">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">{p.category}</span>
                      {parseJsonArray(p.tech).slice(0, 3).map((t) => (
                        <span key={t} className="text-xs text-zinc-500">{t}</span>
                      ))}
                    </div>
                    <h3 className="text-lg font-bold">{p.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{p.description}</p>
                  </div>
                </motion.article>
              ))}
              {portfolio.length === 0 &&
                [1, 2, 3, 4].map((i) => <div key={i} className="aspect-[16/9] rounded-2xl bg-zinc-900 animate-pulse" />)}
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="py-24 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-5">Prêt à lancer votre projet&nbsp;?</h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
              Obtenez votre estimation instantanée en moins de deux minutes. Sans engagement, sans carte bancaire.
            </p>
            <Button onClick={() => onNavigate(user ? (user.role === "ADMIN" ? "admin" : "client") : "builder")} size="lg" className="h-14 px-10 text-base bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold shadow-2xl shadow-emerald-500/25">
              <Sparkles size={20} className="mr-2" /> Démarrer maintenant
            </Button>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-white/5 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center sm:items-start gap-3">
              <Logo />
              <p className="text-sm text-zinc-500">Redéfinir l'excellence digitale, un projet à la fois.</p>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-2 text-sm text-zinc-500">
              <div className="flex gap-6">
                <a href="#services" className="hover:text-emerald-400 transition-colors">Services</a>
                <a href="#portfolio" className="hover:text-emerald-400 transition-colors">Portfolio</a>
                <button onClick={() => onNavigate(user ? (user.role === "ADMIN" ? "admin" : "client") : "login")} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Espace client
                </button>
              </div>
              <p>© {new Date().getFullYear()} AUTOMATIC — Tous droits réservés</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

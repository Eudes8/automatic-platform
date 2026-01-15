import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/landing/Hero";
import Portfolio from "@/components/landing/Portfolio";
import {
  Cpu,
  Globe,
  Zap,
  ArrowRight,
  MessageSquare,
  PenTool
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main>
        <Hero />

        {/* Services Section */}
        <section id="services" className="py-32 relative">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mb-24">
              <h2 className="text-blue-500 font-bold tracking-[0.2em] uppercase text-xs mb-4">Expertise Industrielle</h2>
              <p className="text-4xl md:text-6xl font-heading font-bold text-primary leading-[1.1] tracking-tight">
                Nous bâtissons le socle de <br />
                votre succès numérique.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "SaaS & Écosystèmes",
                  desc: "Des architectures robustes avec Next.js 15, conçues pour évoluer avec votre croissance.",
                  icon: Globe,
                  tag: "Scalabilité"
                },
                {
                  title: "Produits Mobiles",
                  desc: "Applications natives et hybrides qui offrent une expérience utilisateur irréprochable.",
                  icon: Cpu,
                  tag: "Performance"
                },
                {
                  title: "Systèmes IA",
                  desc: "Intégration d'intelligence artificielle pour automatiser vos processus métier complexes.",
                  icon: Zap,
                  tag: "Intelligence"
                }
              ].map((s, i) => (
                <div
                  key={i}
                  className="group p-10 rounded-[2rem] glass-premium hover:border-primary/20 transition-all duration-500 relative flex flex-col h-full"
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-8 border border-border w-fit px-3 py-1 rounded-full">
                    {s.tag}
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-primary mb-4">{s.title}</h3>
                  <p className="text-secondary leading-relaxed mb-8 flex-grow">{s.desc}</p>
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest pt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                    Explorer <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Portfolio />

        {/* Features Section - Bento Style */}
        <section className="py-32 bg-secondary/5">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-heading font-bold text-primary tracking-tight">
                  L&apos;expérience d&apos;une <br /><span className="text-secondary opacity-50">agence de nouvelle génération.</span>
                </h2>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              {/* Main Feature */}
              <div className="lg:col-span-8 p-12 rounded-[2.5rem] glass-premium relative overflow-hidden flex flex-col justify-end min-h-[500px]">
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
                  <Image
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200"
                    alt="Dashboard Preview"
                    width={1200}
                    height={800}
                    className="absolute top-20 -right-20 w-[120%] h-auto rotate-[-5deg] rounded-3xl opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <div className="relative z-10">
                  <h4 className="text-3xl font-heading font-bold text-primary mb-4 leading-tight">Dashboard de pilotage <br /> en temps réel.</h4>
                  <p className="text-secondary max-w-sm mb-0">Suivez chaque étape du développement, échangez avec les ingénieurs et validez les commits instantanément.</p>
                </div>
              </div>

              {/* Side Features */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {[
                  { title: "Contracts Digitaux", desc: "Signature légale en un clic.", icon: PenTool },
                  { title: "Support 24/7", desc: "Une équipe à votre écoute.", icon: MessageSquare },
                ].map((item, i) => (
                  <div key={i} className="flex-grow p-10 rounded-[2.5rem] glass-premium">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-xl font-heading font-bold text-primary mb-2">{item.title}</h4>
                    <p className="text-secondary text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 px-6">
          <div className="container mx-auto">
            <div className="relative rounded-[3.5rem] bg-primary p-12 md:p-32 overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-96 h-96 bg-background/10 rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-background/10 rounded-full -translate-x-1/2 translate-y-1/2" />

              <h2 className="text-5xl md:text-8xl font-heading font-bold text-background mb-10 leading-[0.9] tracking-tighter">
                Construisons votre <br /> futur ensemble.
              </h2>
              <p className="text-background/60 text-lg md:text-xl max-w-2xl mx-auto mb-16 font-medium">
                Vous avez l&apos;idée, nous avons l&apos;expertise. Rejoignez les fondateurs qui font confiance à Automatic pour lancer leurs SaaS.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-3 px-16 py-6 bg-background text-primary font-bold text-lg rounded-full hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-black/20"
              >
                Démarrer le voyage <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-border text-center">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary rounded-md rotate-45" />
              <span className="text-lg font-heading font-bold uppercase tracking-widest text-primary">Automatic</span>
            </div>
            <div className="flex gap-8">
              {["Confidentialité", "Mentions Légales", "Contact"].map(item => (
                <a key={item} href="#" className="text-xs uppercase tracking-widest text-secondary hover:text-primary transition-colors">{item}</a>
              ))}
            </div>
          </div>
          <p className="text-secondary text-[10px] uppercase tracking-[0.3em]">© 2026 AUTOMATIC. Crafting digital excellence.</p>
        </div>
      </footer>
    </div>
  );
}
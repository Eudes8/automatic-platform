import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CreditCard,
  FileText,
  ListChecks,
  Package,
  Smartphone,
  Store,
  Workflow,
} from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import { Logo } from "@/components/shared/Logo";

const OFFERS = [
  {
    id: "web",
    icon: Smartphone,
    title: "Application web et mobile",
    description:
      "Portail client, back-office, application iPhone et Android, construits à partir d'un même cahier des charges.",
    meta: "Web · iOS · Android",
  },
  {
    id: "software",
    icon: Workflow,
    title: "Logiciel de gestion",
    description:
      "Caisse, stock, facturation, paie. Les outils qui font tourner votre activité tous les jours.",
    meta: "Métier · Sur mesure",
  },
  {
    id: "website",
    icon: Store,
    title: "Site et boutique en ligne",
    description:
      "Vitrine, catalogue et paiement en ligne, pensés d'abord pour le mobile et le référencement.",
    meta: "Vitrine · E-commerce",
  },
];

const TRACKING = [
  {
    icon: FileText,
    title: "Cahier des charges",
    description: "Chaque besoin est écrit, numéroté et validé avec vous. Le périmètre reste clair.",
  },
  {
    icon: ListChecks,
    title: "Tâches et jalons",
    description: "L'équipe planifie son travail. Vous voyez l'avancement réel, sans réunion hebdomadaire.",
  },
  {
    icon: Package,
    title: "Livrables",
    description: "Chaque version est déposée dans votre espace. Vous validez ou vous demandez des corrections.",
  },
  {
    icon: CreditCard,
    title: "Factures et paiements",
    description: "Règlement par Mobile Money ou carte bancaire, avec confirmation automatique.",
  },
];

const STEPS = [
  {
    title: "Cadrage",
    description: "Une conversation et un formulaire. Nous transformons votre idée en périmètre écrit.",
  },
  {
    title: "Proposition",
    description: "Budget, calendrier et jalons. Vous signez en ligne et le projet démarre.",
  },
  {
    title: "Construction",
    description: "L'équipe travaille par lots. Vous suivez les tâches et validez les livrables.",
  },
  {
    title: "Livraison",
    description: "Mise en production, formation de vos équipes et support après la livraison.",
  },
];

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <Navbar />

      <main>
        {/* Hero : texte à gauche, atelier à droite */}
        <section className="border-b border-border">
          <div className="shell grid gap-10 py-14 md:py-20 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <h1 className="text-[2.2rem] leading-[1.05] sm:text-5xl lg:text-[3.6rem]">
                Votre projet numérique,
                <br />
                de l&apos;idée à la livraison.
              </h1>

              <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-secondary">
                Nous construisons vos applications web et mobiles sur mesure, et vous suivez chaque étape
                depuis un espace unique.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/onboarding" className="btn btn-primary h-12 px-6 text-[15px]">
                  Démarrer un projet
                </Link>
                <Link href="/login" className="btn btn-outline h-12 px-6 text-[15px]">
                  Voir l&apos;espace client
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-[18px] border border-border bg-card">
                <Image
                  src="/images/hero-atelier.jpg"
                  alt="Poste de travail avec un ordinateur portable, un carnet de croquis et un téléphone"
                  width={1600}
                  height={2000}
                  priority
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="h-full w-full object-cover aspect-[4/3] lg:aspect-[4/5]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Offres : liste séparée par des filets */}
        <section id="services" className="border-b border-border">
          <div className="shell py-16 md:py-24">
            <div className="max-w-[54ch]">
              <h2 className="text-3xl sm:text-4xl">Ce que nous construisons</h2>
              <p className="mt-3 text-secondary">
                Trois familles de projets, la même exigence : un périmètre écrit et une livraison vérifiable.
              </p>
            </div>

            <div className="mt-10 border-t border-border">
              {OFFERS.map((offer, index) => {
                const Icon = offer.icon;
                return (
                  <Link
                    key={offer.id}
                    href={`/onboarding?type=${offer.id}`}
                    className="group grid gap-4 border-b border-border py-7 transition-colors hover:bg-card/60 md:grid-cols-12 md:items-center md:gap-6 md:px-2"
                  >
                    <div className="md:col-span-1 flex items-center gap-3">
                      <span className="numeric text-[13px] text-muted">0{index + 1}</span>
                      <Icon size={18} className="text-accent" aria-hidden="true" />
                    </div>

                    <div className="md:col-span-5">
                      <h3 className="text-xl font-semibold tracking-tight">{offer.title}</h3>
                      <p className="mt-1 text-[12px] text-muted">{offer.meta}</p>
                    </div>

                    <p className="md:col-span-5 text-[15px] leading-relaxed text-secondary">
                      {offer.description}
                    </p>

                    <div className="md:col-span-1 flex md:justify-end">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors group-hover:border-accent group-hover:text-accent">
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Suivi : image à gauche, bénéfices à droite */}
        <section id="suivi" className="border-b border-border">
          <div className="shell grid gap-12 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="overflow-hidden rounded-[18px] border border-border">
                <Image
                  src="/images/methode-atelier.jpg"
                  alt="Maquettes imprimées annotées à la main sur un bureau"
                  width={2000}
                  height={1333}
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="h-full w-full object-cover aspect-[3/2]"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl">
                Un seul espace,
                <br />
                du premier croquis à la facture.
              </h2>
              <p className="mt-4 max-w-[52ch] text-secondary">
                Vous n&apos;avez pas besoin d&apos;appeler pour savoir où en est votre projet. Tout est écrit,
                daté et validé au même endroit.
              </p>

              <dl className="mt-8 divide-y divide-border border-t border-border">
                {TRACKING.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="grid grid-cols-[auto_1fr] gap-4 py-5">
                      <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-[10px] border border-border bg-card">
                        <Icon size={16} className="text-accent" aria-hidden="true" />
                      </span>
                      <div>
                        <dt className="text-[15px] font-semibold">{item.title}</dt>
                        <dd className="mt-1 text-[14px] leading-relaxed text-secondary">{item.description}</dd>
                      </div>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>
        </section>

        {/* Méthode : quatre colonnes sur filet haut */}
        <section id="methode" className="border-b border-border">
          <div className="shell py-16 md:py-24">
            <h2 className="max-w-[40ch] text-3xl sm:text-4xl">Comment se déroule un projet</h2>

            <ol className="mt-10 grid gap-8 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <span className="numeric text-[12px] text-muted">0{index + 1}</span>
                  <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-secondary">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Appel à l'action */}
        <section className="bg-primary text-background">
          <div className="shell flex flex-col gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
            <div>
              <h2 className="text-3xl sm:text-4xl text-background">Parlons de votre projet.</h2>
              <p className="mt-2 max-w-[48ch] text-[15px] text-background/70">
                Décrivez votre besoin en quelques minutes. Nous revenons vers vous avec un périmètre et un
                budget.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/onboarding"
                className="btn h-12 px-6 text-[15px] bg-background text-foreground border border-background hover:opacity-90"
              >
                Démarrer un projet
              </Link>
              <a
                href="mailto:automaticbmje@gmail.com"
                className="btn btn-ghost h-12 px-5 text-[15px] text-background border border-background/25 hover:bg-background/10"
              >
                Écrire un message
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background">
        <div className="shell grid gap-10 py-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-secondary">
              Studio de développement d&apos;applications web et mobiles sur mesure. Nous pilotons vos
              projets de l&apos;idée à la livraison.
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-[13px] font-semibold text-foreground">Plateforme</h3>
            <ul className="mt-3 space-y-2 text-[14px] text-secondary">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Espace client
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-foreground transition-colors">
                  Démarrer un projet
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground transition-colors">
                  Créer un compte
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-[13px] font-semibold text-foreground">Contact</h3>
            <ul className="mt-3 space-y-2 text-[14px] text-secondary">
              <li>
                <a href="mailto:automaticbmje@gmail.com" className="hover:text-foreground transition-colors">
                  automaticbmje@gmail.com
                </a>
              </li>
              <li>Réponse sous 24 heures ouvrées</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border">
          <div className="shell flex flex-col gap-2 py-5 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} AUTOMATIC</p>
            <p>Applications web et mobiles sur mesure</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

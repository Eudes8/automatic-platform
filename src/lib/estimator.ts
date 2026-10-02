// ─── Catalogue de features du Project Builder ──────────────────────────────
// Amélioration majeure vs V1 : estimation détaillée par feature, délai,
// stack recommandée et catégorie, au lieu d'un coût moyen plat.

export type FeatureDef = {
  id: string
  label: string
  description: string
  category: "core" | "ecommerce" | "content" | "automation" | "advanced"
  price: number // en XOF
  days: number
  complex: boolean // impacte le multiplicateur de complexité
}

export type ProjectTypeDef = {
  id: string
  label: string
  description: string
  basePrice: number
  baseDays: number
  icon: string
  stack: string[]
}

export const PROJECT_TYPES: ProjectTypeDef[] = [
  {
    id: "web",
    label: "Site Vitrine",
    description: "Présentez votre activité avec élégance et convertissez vos visiteurs.",
    basePrice: 250_000,
    baseDays: 14,
    icon: "globe",
    stack: ["Next.js", "Tailwind CSS", "Vercel"],
  },
  {
    id: "mobile",
    label: "Application Mobile",
    description: "Une app iOS & Android performante, entre les mains de vos clients.",
    basePrice: 900_000,
    baseDays: 45,
    icon: "smartphone",
    stack: ["React Native", "Expo", "Supabase"],
  },
  {
    id: "ecommerce",
    label: "Boutique en Ligne",
    description: "Vendez en ligne avec paiement sécurisé et gestion des stocks.",
    basePrice: 750_000,
    baseDays: 35,
    icon: "shopping-bag",
    stack: ["Next.js", "Stripe", "PostgreSQL"],
  },
  {
    id: "saas",
    label: "Plateforme SaaS",
    description: "Votre idée transformée en produit logiciel avec abonnements.",
    basePrice: 1_800_000,
    baseDays: 60,
    icon: "layers",
    stack: ["Next.js", "Prisma", "Stripe Billing"],
  },
  {
    id: "branding",
    label: "Identité & Branding",
    description: "Logo, charte graphique et supports pour une marque mémorable.",
    basePrice: 350_000,
    baseDays: 21,
    icon: "palette",
    stack: ["Figma", "Illustrator"],
  },
]

export const FEATURES: FeatureDef[] = [
  { id: "auth", label: "Comptes utilisateurs", description: "Inscription, connexion, profils", category: "core", price: 150_000, days: 5, complex: false },
  { id: "payment", label: "Paiement en ligne", description: "Mobile Money & carte bancaire", category: "ecommerce", price: 250_000, days: 7, complex: true },
  { id: "blog", label: "Blog / Actualités", description: "Publication de contenu, catégories, SEO", category: "content", price: 120_000, days: 4, complex: false },
  { id: "chat", label: "Messagerie intégrée", description: "Chat temps réel avec vos clients", category: "advanced", price: 200_000, days: 6, complex: true },
  { id: "dashboard", label: "Tableau de bord admin", description: "Statistiques et gestion du contenu", category: "core", price: 220_000, days: 7, complex: false },
  { id: "notifications", label: "Notifications", description: "Emails, push et alertes internes", category: "automation", price: 130_000, days: 4, complex: false },
  { id: "search", label: "Recherche avancée", description: "Filtres, tri et recherche instantanée", category: "core", price: 110_000, days: 3, complex: false },
  { id: "multilingue", label: "Multilingue", description: "Site disponible en plusieurs langues", category: "advanced", price: 160_000, days: 5, complex: true },
  { id: "booking", label: "Réservation / Agenda", description: "Prise de rendez-vous en ligne", category: "ecommerce", price: 190_000, days: 6, complex: false },
  { id: "analytics", label: "Statistiques avancées", description: "Suivi d'audience et rapports", category: "automation", price: 140_000, days: 4, complex: false },
]

export type Estimate = {
  total: number
  days: number
  weekly: { label: string; amount: number }[]
  stack: string[]
  breakdown: { label: string; amount: number }[]
}

export function estimate(projectTypeId: string, featureIds: string[], urgency = false): Estimate {
  const type = PROJECT_TYPES.find((t) => t.id === projectTypeId) ?? PROJECT_TYPES[0]
  const features = FEATURES.filter((f) => featureIds.includes(f.id))

  const subtotal = type.basePrice + features.reduce((s, f) => s + f.price, 0)
  const complexCount = features.filter((f) => f.complex).length
  const complexity = 1 + complexCount * 0.04 // +4% par feature complexe
  const rush = urgency ? 1.2 : 1

  const total = Math.round((subtotal * complexity * rush) / 5_000) * 5_000
  const days = Math.round((type.baseDays + features.reduce((s, f) => s + f.days, 0)) * (urgency ? 0.8 : 1))

  const breakdown = [
    { label: type.label, amount: type.basePrice },
    ...features.map((f) => ({ label: f.label, amount: f.price })),
  ]
  if (complexity > 1) {
    breakdown.push({ label: `Complexité technique (×${complexity.toFixed(2)})`, amount: Math.round(subtotal * (complexity - 1)) })
  }
  if (urgency) {
    breakdown.push({ label: "Accélération (+20%)", amount: Math.round(subtotal * complexity * 0.2) })
  }

  // Paiement en 3 phases : 40% démarrage, 40% développement, 20% livraison
  const weekly = [
    { label: "Démarrage (40%)", amount: Math.round(total * 0.4) },
    { label: "Développement (40%)", amount: Math.round(total * 0.4) },
    { label: "Livraison (20%)", amount: total - Math.round(total * 0.4) * 2 },
  ]

  const stack = [...type.stack]
  if (features.some((f) => f.id === "payment")) stack.push("Paiement")
  if (features.some((f) => f.id === "chat")) stack.push("WebSocket")

  return { total, days, weekly, stack, breakdown }
}

export function formatXOF(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount) + " FCFA"
}

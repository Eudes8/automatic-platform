import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

// Seed idempotent : crée les comptes de démo et un jeu de données réaliste
// si la base est vide. Exécuté au démarrage via instrumentation.ts.

export async function seedDatabase() {
  const userCount = await db.user.count()
  if (userCount > 0) return // déjà seedé

  console.log("[seed] Base vide — création des données de démonstration…")

  const admin = await db.user.create({
    data: {
      email: "admin@automatic.com",
      passwordHash: hashPassword("admin123"),
      name: "Équipe AUTOMATIC",
      role: "ADMIN",
      companyName: "AUTOMATIC",
    },
  })

  const koffi = await db.user.create({
    data: {
      email: "client@demo.com",
      passwordHash: hashPassword("demo123"),
      name: "Koffi Adjovi",
      role: "CLIENT",
      companyName: "Boutique Adjovi & Fils",
      phone: "+225 07 00 00 00 00",
    },
  })

  const amina = await db.user.create({
    data: {
      email: "amina@demo.com",
      passwordHash: hashPassword("demo123"),
      name: "Amina Traoré",
      role: "CLIENT",
      companyName: "Cabinet Traoré Consulting",
      phone: "+225 05 00 00 00 00",
    },
  })

  const p1 = await db.project.create({
    data: {
      reference: "PRJ-2026-0001",
      title: "Boutique en ligne Adjovi",
      description:
        "Création d'une boutique e-commerce complète avec paiement Mobile Money et carte bancaire, gestion des stocks et tableau de bord des ventes.",
      category: "ecommerce",
      budget: 1_375_000,
      progress: 55,
      status: "DEV",
      techStack: JSON.stringify(["Next.js", "Stripe", "PostgreSQL", "Tailwind CSS"]),
      features: JSON.stringify(["payment", "dashboard", "notifications", "search"]),
      timeline: "49 jours",
      clientId: koffi.id,
      contractSigned: true,
      deadline: new Date(Date.now() + 45 * 24 * 3600 * 1000),
    },
  })

  const p2 = await db.project.create({
    data: {
      reference: "PRJ-2026-0002",
      title: "Application mobile Traoré",
      description: "Application mobile de prise de rendez-vous avec notifications push pour les clients du cabinet.",
      category: "mobile",
      budget: 1_290_000,
      progress: 30,
      status: "DESIGN",
      techStack: JSON.stringify(["React Native", "Expo", "Supabase"]),
      features: JSON.stringify(["auth", "booking", "notifications"]),
      timeline: "60 jours",
      clientId: amina.id,
      contractSigned: true,
      deadline: new Date(Date.now() + 60 * 24 * 3600 * 1000),
    },
  })

  const p3 = await db.project.create({
    data: {
      reference: "PRJ-2026-0003",
      title: "Site vitrine Cabinet Traoré",
      description: "Site vitrine premium avec présentation des services, blog et formulaire de contact.",
      category: "web",
      budget: 520_000,
      progress: 100,
      status: "DONE",
      techStack: JSON.stringify(["Next.js", "Tailwind CSS"]),
      features: JSON.stringify(["blog", "search"]),
      timeline: "22 jours",
      clientId: amina.id,
      contractSigned: true,
    },
  })

  // Contrats
  for (const p of [p1, p2, p3]) {
    await db.contract.create({
      data: {
        projectId: p.id,
        content: `CONTRAT DE PRESTATION NUMÉRIQUE — ${p.reference}\n\nEntre AUTOMATIC et le client, pour la réalisation du projet « ${p.title} ».`,
        signerName: p.clientId === koffi.id ? koffi.name : amina.name,
        signedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000),
        status: "SIGNED",
      },
    })
  }

  // Factures
  await db.invoice.createMany({
    data: [
      {
        number: "FAC-2026-0001",
        projectId: p1.id,
        clientId: koffi.id,
        amount: 550_000,
        status: "PAID",
        description: "Acompte de démarrage (40%) — Boutique en ligne Adjovi",
        dueDate: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        paidAt: new Date(Date.now() - 28 * 24 * 3600 * 1000),
      },
      {
        number: "FAC-2026-0002",
        projectId: p1.id,
        clientId: koffi.id,
        amount: 550_000,
        status: "SENT",
        description: "Phase de développement (40%) — Boutique en ligne Adjovi",
        dueDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
      },
      {
        number: "FAC-2026-0003",
        projectId: p2.id,
        clientId: amina.id,
        amount: 516_000,
        status: "PAID",
        description: "Acompte de démarrage (40%) — Application mobile Traoré",
        dueDate: new Date(Date.now() - 15 * 24 * 3600 * 1000),
        paidAt: new Date(Date.now() - 14 * 24 * 3600 * 1000),
      },
      {
        number: "FAC-2026-0004",
        projectId: p3.id,
        clientId: amina.id,
        amount: 520_000,
        status: "PAID",
        description: "Solde final — Site vitrine Cabinet Traoré",
        dueDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        paidAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      },
    ],
  })

  // Tickets
  const t1 = await db.ticket.create({
    data: {
      reference: "TCK-2026-0001",
      title: "Erreur sur le module de paiement Orange Money",
      description:
        "Bonjour, lorsque je tente de payer avec Orange Money, la transaction échoue avec le code OR-402. Le paiement par carte fonctionne normalement. Merci de vérifier.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      clientId: koffi.id,
      projectId: p1.id,
      assignedToId: admin.id,
    },
  })
  const t2 = await db.ticket.create({
    data: {
      reference: "TCK-2026-0002",
      title: "Demande d'ajout d'une page équipe",
      description: "Nous aimerions ajouter une page « Notre équipe » avec photos et rôles sur le site vitrine.",
      status: "OPEN",
      priority: "LOW",
      clientId: amina.id,
      projectId: p3.id,
    },
  })

  await db.ticketResponse.createMany({
    data: [
      {
        ticketId: t1.id,
        authorId: admin.id,
        message: "Bonjour Koffi, merci pour votre signalement. Nous avons identifié le problème côté API Orange Money. Correctif en cours de déploiement.",
      },
      {
        ticketId: t1.id,
        authorId: koffi.id,
        message: "Merci pour votre réactivité !",
      },
    ],
  })

  // Messages de chat
  await db.message.createMany({
    data: [
      { projectId: p1.id, senderId: admin.id, text: "Bonjour Koffi ! Votre boutique avance bien. La page produit est terminée, nous attaquons le tunnel de commande.", read: true },
      { projectId: p1.id, senderId: koffi.id, text: "Excellente nouvelle ! J'ai hâte de voir le rendu. Peut-on avoir un aperçu cette semaine ?", read: true },
      { projectId: p1.id, senderId: admin.id, text: "Oui, je vous prépare un lien de prévisualisation d'ici jeudi.", read: false },
      { projectId: p2.id, senderId: amina.id, text: "Bonjour, les maquettes sont-elles prêtes ?", read: false },
    ],
  })

  // Notifications
  await db.notification.createMany({
    data: [
      { userId: koffi.id, title: "Bienvenue chez AUTOMATIC 🚀", message: "Votre espace client est prêt. Suivez l'avancement de vos projets en temps réel.", type: "SUCCESS", read: false },
      { userId: koffi.id, title: "Facture disponible", message: "La facture FAC-2026-0002 (550 000 FCFA) est en attente de paiement.", type: "PAYMENT", read: false, link: "/invoices" },
      { userId: koffi.id, title: "Nouveau message", message: "Votre équipe a répondu sur « Boutique en ligne Adjovi ».", type: "CHAT", read: false },
      { userId: amina.id, title: "Projet livré 🎉", message: "Félicitations ! Votre site vitrine a été livré avec succès.", type: "SUCCESS", read: false },
      { userId: admin.id, title: "Nouveau ticket", message: "TCK-2026-0001 ouvert par Koffi Adjovi : paiement Orange Money.", type: "TICKET", read: false },
    ],
  })

  // Portfolio
  await db.portfolioItem.createMany({
    data: [
      {
        title: "Djolof Market",
        category: "E-commerce",
        description: "Plateforme de vente en ligne multi-vendeurs avec paiement Mobile Money intégré et logistique trackée.",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
        tech: JSON.stringify(["Next.js", "Stripe", "PostgreSQL"]),
        url: "#",
        featured: true,
      },
      {
        title: "MediTrack Afrique",
        category: "Application Mobile",
        description: "Application de suivi médical pour patients chroniques : rappels, statistiques et téléconsultation.",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
        tech: JSON.stringify(["React Native", "Node.js"]),
        url: "#",
        featured: true,
      },
      {
        title: "Cabinet Bâ & Associés",
        category: "Site Vitrine",
        description: "Site institutionnel haut de gamme pour un cabinet d'avocats d'affaires, multilingue et optimisé SEO.",
        image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80",
        tech: JSON.stringify(["Next.js", "Tailwind CSS"]),
        url: "#",
        featured: false,
      },
      {
        title: "Fintech PayDiaspora",
        category: "Plateforme SaaS",
        description: "Solution de transfert d'argent avec tableaux de bord, KYC automatisé et API partenaires.",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
        tech: JSON.stringify(["React", "Prisma", "Stripe"]),
        url: "#",
        featured: false,
      },
    ],
  })

  // Audit
  await db.auditLog.create({
    data: { adminId: admin.id, action: "SEED", entity: "System", details: "Initialisation des données de démonstration" },
  })

  console.log("[seed] Données de démonstration créées ✔")
}

# 🚀 AUTOMATIC — Plateforme de Pilotage Digital Premium (V2 — Recodage intégral)

Recodage complet de la plateforme **AUTOMATIC** : SaaS de gestion du cycle de vie complet des projets de développement web & mobile, de la configuration initiale à la livraison finale.

## ✨ Ce qui change en V2 (améliorations majeures)

| Domaine | V1 | V2 |
|---|---|---|
| **Authentification** | Supabase (clés externes requises) | Sessions natives httpOnly + scrypt — **zéro service externe** |
| **Base de données** | PostgreSQL + Supabase | Prisma + SQLite (fichier) — déployable partout |
| **Project Builder** | Estimation forfaitaire | Estimation détaillée par feature (10 options), complexité ×, urgence, paiement en 3 phases |
| **Contrats** | Signature + PDF | Signature canvas + **facture d'acompte 40% générée automatiquement** + passage de phase auto |
| **Chat** | Supabase Realtime | **Socket.io** (salle par projet, indicateur de saisie) + **repli polling automatique** |
| **Références** | IDs techniques | Références lisibles : `PRJ-2026-0001`, `FAC-2026-0001`, `TCK-2026-0001` |
| **Back-office** | Pages éparses | Dashboard unifié avec graphiques (revenus 6 mois, répartition des projets), CRUD complet |
| **Notifications** | Basiques | Cloche temps réel, 8 types catégorisés, liens profonds vers les projets |
| **Tickets** | Liste | Notes internes admin, priorités, auto-assignation à la 1ʳᵉ réponse |
| **UI** | Cyber/Dark | Design dark premium emerald, animations Framer Motion, 100% responsive |

## 🛠 Stack

- **Next.js 16** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS 4** + shadcn/ui + Framer Motion + Recharts
- **Prisma** + SQLite · **Socket.io** (temps réel) · **Zustand**
- Auth maison (scrypt + sessions en base) — aucune dépendance externe

## 🚀 Démarrage

```bash
npm install
npx prisma db push        # crée db/custom.db
npm run dev
```

La base est **auto-seedée** au premier démarrage (via `src/instrumentation.ts`) :

| Rôle | Email | Mot de passe |
|---|---|---|
| 🛡️ Admin | `admin@automatic.com` | `admin123` |
| 👤 Client | `client@demo.com` | `demo123` |

## 🏗 Architecture

```
src/
├── app/
│   ├── page.tsx                    # Routeur SPA (landing ↔ auth ↔ dashboards)
│   ├── api/                        # 18 routes REST (auth, projects, tickets, invoices…)
│   └── instrumentation.ts          # Seed auto au démarrage
├── components/platform/            # Landing, Auth, Builder, ClientApp, AdminApp, Chat…
└── lib/
    ├── auth.ts                     # Sessions scrypt + guards requireUser/requireAdmin
    ├── estimator.ts                # Moteur d'estimation (catalogue de features)
    ├── platform.ts                 # Types + libellés FR
    └── seed.ts                     # Données de démonstration idempotentes
mini-services/chat-service/         # Socket.io : chat temps réel + notifications live
```

**Parcours client** : Project Builder (estimation instantanée) → inscription → signature électronique du contrat (canvas) → facture d'acompte 40% auto-générée → suivi temps réel (chat + timeline 7 phases : Onboarding → Analyse → Design → Développement → Tests → Déploiement → Livré) → paiement de factures → support par tickets.

**Back-office admin** : statistiques de chiffre d'affaires, gestion des projets (statuts, progression, budget), clients, tickets (notes internes), facturation, portfolio public.

---
*Propulsé par l'équipe AUTOMATIC — Redéfinir l'excellence digitale.*

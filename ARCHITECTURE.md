# AUTOMATIC Platform - Architecture & Documentation

## 🚀 Vue d'ensemble
AUTOMATIC est une plateforme de pilotage de projets digitaux permettant aux clients de configurer leur projet, de signer des contrats électroniquement et de suivre l'avancement en temps réel via un dashboard premium.

## 🛠 Stack Technique
- **Framework**: Next.js 16 (App Router)
- **Langage**: TypeScript
- **Base de données**: PostgreSQL (via Prisma 7)
- **Authentification**: Supabase Auth (Administration via `supabase-js`)
- **UI/UX**: Tailwind CSS 4, Framer Motion, Lucide React
- **Emailing**: Resend
- **Documents**: pdf-lib (Génération de contrats PDF)

## 📂 Structure du Projet
- `src/app`: Routes et pages (Dashboard, Onboarding, Login).
- `src/components`: Composants UI réutilisables.
  - `onboarding/`: Logique du tunnel de conversion.
  - `dashboard/`: Composants de la console de pilotage.
  - `emails/`: Templates de mails via React Email.
- `src/lib`: Utilitaires et clients (Prisma, Supabase, PDF).
- `src/lib/actions`: Server Actions pour la logique métier.

## 🔄 Flux de Données

### 1. Onboarding & Création de Projet
Le client remplit le `ProjectBuilder`. L'API (`/api/projects`) effectue :
1. La création/mise à jour du compte dans **Supabase Auth**.
2. La synchronisation de l'utilisateur dans la table `User` de Prisma.
3. La création du projet rattaché à cet utilisateur.
4. L'envoi d'un mail de confirmation via **Resend**.

### 2. Barrière Contractuelle (Par Projet)
Avant d'accéder aux détails d'un projet spécifique (`/dashboard/projects/[id]`), l'utilisateur doit valider le contrat associé s'il ne l'a pas déjà fait.
- La liste des projets reste accessible pour permettre la sélection.
- Le contrat est généré dynamiquement avec les informations spécifiques du projet (Titre, Budget, Nom du client).
- La signature est capturée via `react-signature-canvas`.
- Le document PDF final (formalisé avec articles juridiques) est généré via `pdf-lib`.
- Une fois signé, le statut du projet passe en `contractSigned: true`.

### 3. Dashboard
Une fois le contrat signé, l'utilisateur accède à :
- **Stats**: Visualisation de la progression du projet.
- **Chat**: Ligne directe avec l'équipe de développement.
- **Paramètres**: Gestion du profil.

## 🗄 Schéma Prisma
Le schéma définit les modèles suivants :
- `User`: Clients et Staff.
- `Project`: L'entité centrale liée à un client.
- `Contract`: Enregistrement des signatures et contenus.
- `Message`: Historique des échanges chat.
- `Asset`: Fichiers et livrables liés au projet.

## 🛠 Maintenance & Debugging

### Synchronisation Prisma
Si les types Prisma semblent obsolètes, lancez :
```bash
npx prisma generate
```
Pour synchroniser le schéma avec la base de données :
```bash
npx prisma db push
```

### Variables d'Environnement
Assurez-vous que les variables suivantes sont configurées :
- `DATABASE_URL`: Chaîne de connexion PostgreSQL.
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY`: Pour les opérations admin.
- `RESEND_API_KEY`: Pour l'envoi de mails.

## 🎨 Design System
La plateforme utilise un design "Cyber/Premium" :
- **Colors**: Dark mode (Slate 950), Accents Blue-600 et Orange-600.
- **Effects**: Glassmorphism (`.glass`), dégradés dynamiques.
- **Animations**: Framer Motion pour les transitions de page et les micro-interactions.

# 📄 AUTOMATIC — Détails Techniques & État du Projet

Ce document fournit une vue d'ensemble exhaustive de la plateforme AUTOMATIC, ses modules, son architecture et son état actuel.

## 🏗️ Architecture Globale

- **Frontend**: Next.js 16 (App Router) avec TypeScript.
- **Styling**: Tailwind CSS 4 (Approche Cyber-Premium / Dark Mode par défaut).
- **Animations**: Framer Motion pour une expérience utilisateur fluide.
- **Backend**: Server Actions de Next.js et API Routes (si nécessaire).
- **Base de Données**: PostgreSQL hébergé sur Supabase, géré via Prisma 7.
- **Authentification**: Supabase Auth (intégré avec middleware de sécurité).
- **Stockage**: Supabase Storage (pour les contrats et livrables).
- **Emails**: Resend avec React Email pour les notifications transactionnelles.

## 📦 Modules & Fonctionnalités

### 1. Onboarding & Project Builder (`/src/components/onboarding`)
- **Statut**: ✅ Opérationnel
- **Description**: Tunnel de configuration de projet étape par étape.
- **Logique**: Calcule un budget estimatif en temps réel basé sur les options choisies (Web, Mobile, CMS, etc.) et crée l'utilisateur et le projet simultanément.

### 2. Dashboard Client (`/src/app/dashboard`)
- **Statut**: ✅ Opérationnel (en cours d'enrichissement)
- **Vues**:
  - **Aperçu**: Statistiques de progression et statut global.
  - **Projets**: Liste des projets avec accès aux détails.
  - **Livrables**: Zone de téléchargement des fichiers (Assets).
  - **Messagerie**: Chat en temps réel avec le staff.

### 3. Barrière Contractuelle (`/src/app/dashboard/projects/[id]`)
- **Statut**: ✅ Opérationnel
- **Description**: Force la signature d'un contrat avant l'accès aux détails techniques.
- **Technique**: Utilise `pdf-lib` pour générer un PDF certifié incluant la signature électronique (Base64) capturée via un canvas.

### 4. Panneau Administration (`/src/app/admin`)
- **Statut**: 🏗️ En cours / Partiel
- **Fonctionnalités**:
  - Gestion des utilisateurs et de leurs rôles.
  - Validation des projets et mise à jour des statuts.
  - Envoi de notifications SMS/Email (via Resend).
  - Gestion des factures (Prévu dans le schéma Prisma).

### 5. Exécution & Livraison (Équipe · Tâches · Jalons · Livrables)
- **Statut**: ✅ Opérationnel
- **Console interne**: `/admin/projects/[id]/execution`
- **Espace client**: section « Avancement » de `/dashboard/projects/[id]`
- **Description**: back-office d'exécution du projet — tableau de tâches
  (backlog → terminé), jalons datés, affectation nominative des collaborateurs
  internes, livrables versionnés avec fichiers joints.
- **Avancement**: recalculé automatiquement (tâches terminées / total, repli sur
  les jalons validés). Plus de pourcentage saisi à la main.
- **Validation client**: le client accepte un livrable ou demande des corrections
  (retour écrit conservé sur le livrable) ; l'équipe est notifiée.
- **Sécurité**: `requireProjectRead` / `requireProjectWrite` / `requireReviewAccess`
  (`src/lib/utils/projectAccess.ts`) — contrôle d'appartenance au projet sur
  chaque action serveur.

### 6. Services de Support (Tickets)
- **Statut**: 🏗️ Structure Prisma prête, UI à finaliser.
- **Description**: Système de ticketing pour le support post-livraison.

## 🗄️ Modèle de Données (Prisma)

- **User**: Stocke les informations profil et le rôle (`ADMIN`, `STAFF`, `CLIENT`).
- **Project**: L'entité cœur liée à un client, avec suivi de progression et budget.
- **Contract**: Historique des versions de contrats signés.
- **Message / Conversation**: Système de chat multilatéral.
- **Asset**: Gestion des fichiers livrables (URLs Supabase).
- **Invoice**: Gestion de la facturation liée aux projets.
- **Ticket / TicketResponse**: Support client structuré.

## 🚀 État de la Roadmap (Post-IA)

Suite à la décision de retirer l'option IA, les priorités sont :
1. **Finalisation du module de Facturation**: Génération de PDFs de factures et suivi de paiement.
2. **Explorateur d'Assets complet**: Interface de gestion de fichiers robuste.
3. **Système de Notification Push**: Pour les nouveaux messages et mises à jour de projet.
4. **Optimisation SEO & Performance**: Audit final avant mise en production.

---
*Dernière mise à jour : 17 Janvier 2026*

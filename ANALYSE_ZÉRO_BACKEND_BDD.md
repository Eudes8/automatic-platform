# 🚀 ANALYSE ZÉRO : BACKEND, BDD & ARCHITECTURE INDUSTRIELLE

## 🎯 Vision
Transformer la plateforme en une infrastructure logicielle de classe entreprise. Chaque "carrefour" du site doit être soutenu par un CRUD robuste, des formulaires intelligents et une base de données optimisée. L'esthétique **Premium Light** est étendue au Back-Office pour une expérience de gestion fluide et prestigieuse.

---

## 🏗️ 1. ARCHITECTURE DES DONNÉES (PRISMA & BDD)

### 1.1 Optimisation du Schéma
- [ ] **Définition de Schéma Rigide** : Utilisation stricte des `enums` pour les statuts (ex: `ProjectStatus: DRAFT, DISCOVERY, DEVELOPMENT, TESTING, DEPLOYED, COMPLETED`).
- [ ] **Relations Complexes** : Assurer l'intégrité référentielle entre `User`, `Project`, `Asset`, `Invoice`, `Ticket`, `Message` et `Portfolio`.
- [ ] **Audit Trail** : Ajout automatique de `createdAt`, `updatedAt` et `deletedAt` (Soft Delete) sur toutes les tables.
- [ ] **Indexation Massive** : Index sur les clés de recherche (`email`, `status`, `projectId`) pour des requêtes sub-secondes.

### 1.2 Nettoyage & Migration
- [ ] Suppression définitive de toutes les données fictives restantes en BDD.
- [ ] Script de migration pour normaliser les budgets (Integer en CFA).

---

## 📦 2. MOTEUR DE STOCKAGE (SUPABASE CLOUD)

### 2.1 Buckets Industriels à Créer
| Bucket Name | Usage | Visibilité | Sécurité (RLS) |
| :--- | :--- | :--- | :--- |
| `project-assets` | Livrables techniques (PDF, Code, Docs) | Privé | Admin + Client assigné |
| `finance-vault` | Factures et devis officiels | Privé | Admin + Propriétaire |
| `legal-box` | Contrats signés numériquement | Privé | Admin + Signataire |
| `system-core` | Avatars, logos entreprise, ressources UI | Public | Read All, Write Admin |

### 2.2 Sécurisation (Hardening)
- [ ] Mise en place de politiques RLS (Row Level Security) granulaires.
- [ ] Validation du type MIME et scan anti-virus (via Edge Functions).

---

## 📑 3. CRUD & FORMULAIRES MODERNES (PAR ENTITÉ)

Chaque formulaire doit inclure : validation Zod, feedback visuel d'upload, squelettes de chargement, et notifications Sonner.

### 3.1 Unité Projets (Admin & Client)
- [ ] **Create/Edit Project** : Formulaire multi-étapes sophistiqué avec :
    - Sélecteur de technologie (Tags).
    - Système d'estimation budgétaire en temps réel.
    - Timeline de déploiement interactive.
- [ ] **Asset Manager** : Glisser-déposer (Drag & Drop) avec barre de progression par fichier.

### 3.2 Unité CRM & Utilisateurs
- [ ] **Gestionnaire de Profil** : Modification d'identité avec preview d'avatar instantanée.
- [ ] **Promotions de Rôle** : Workflow sécurisé pour élever un client en Admin avec double validation.

### 3.3 Unité Support & Billetterie
- [ ] **Ticket System** : Chat-style CRUD avec support de pièces jointes multiples et indicateurs de priorité dynamiques.

---

## 🖥️ 4. BACK-OFFICE PREMIUM (INTERFACE ADMIN)

### 4.1 Layout "Vision 360"
- [ ] **Tableaux de Bord Dynamiques** : Statistiques agrégées (Revenu total, Projets actifs, Tickets ouverts) avec graphiques Recharts.
- [ ] **DataTables Chirurgicales** : Filtrage multi-critères, tri, et pagination côté serveur (Server-side sorting/filtering).

### 4.2 Kanban de Pilotage (Command Center)
- [ ] Glisser-déplacer des projets entre phases de développement avec mise à jour instantanée de la BDD via API Optimiste.

---

## 📄 5. GÉNÉRATION DE CONTENU (PDF GÉNÉRATEUR V2)

### 5.1 Factures "Sober Prestige"
- [ ] Calcul automatique de la TVA et des remises.
- [ ] QR Code de vérification de paiement.
- [ ] Tableaux de prestations détaillés avec pagination PDF automatique.

### 5.2 Contrats de Prestation (Realistic PDF)
- [ ] Clauses juridiques dynamiques selon le type de projet.
- [ ] Intégration de la signature électronique scellée dans le PDF (Hash SHA-256).

---

## 🛡️ 6. SÉCURISATION & HARDENING (ZERO TRUST)

### 6.1 Backend
- [ ] **Server Actions Hardening** : Re-vérification systématique de la session et du rôle dans chaque action.
- [ ] **Rate Limiting** : Protection contre le bruteforce sur les formulaires de connexion et d'onboarding.
- [ ] **Logs de Sécurité** : Tracabilité de chaque action Admin (qui a changé quoi et quand).

### 6.2 Frontend
- [ ] **Protection contre les Injections** : Sanitisation stricte des entrées via schémas Zod.
- [ ] **Audit de Dépendances** : Mise à jour des paquets vulnérables.

---

## 📅 PLANNING D'EXÉCUTION IMMÉDIAT
1. **[BDD]** Refonte du Schéma Prisma & Buckets Supabase.
2. **[FORM]** Migration du ProjectBuilder vers un modèle "Full Data".
3. **[ADMIN]** Uniformisation du Layout Admin en Premium Light.
4. **[PDF]** Déploiement du nouveau générateur de factures/contrats.

---
*Document de référence pour la mise en conformité "Processus Zéro" - Version 3.0*

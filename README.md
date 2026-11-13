# 🚀 AUTOMATIC — Platform de Pilotage Digital Premium

AUTOMATIC est une plateforme SaaS permettant de gérer le cycle de vie complet de projets de développement web et mobile, de la configuration initiale à la livraison finale.

## ✨ Fonctionnalités Clés

- **⚡ Project Builder Intelligent** : Configuration de projet avec estimation de budget instantanée.
- **📜 Signature Électronique** : Barrière contractuelle intégrée avec génération de PDF certifié.
- **💳 Paiement en ligne Moneroo** : Règlement des factures par Mobile Money, carte bancaire et plus — confirmation automatique par webhook sécurisé.
- **📊 Dashboard de Pilotage** : Suivi de progression en temps réel et gestion des actifs.
- **💬 Salon de Discussion** : Ligne directe entre le client et l'équipe technique experte.
- **🛡️ Sécurité de Pointe** : Authentification **Neon Auth** (Better Auth managé), sessions httpOnly, contrôle d'accès granulaire serveur.

## 🛠 Stack Technique

- **Next.js 16** (App Router, Server Actions)
- **Tailwind CSS 4** (Design System Cyber/Dark)
- **Prisma 7** + PostgreSQL
- **Neon Auth** (Better Auth managé) + Supabase (Realtime & Storage uniquement)
- **Framer Motion** (Animations premium)
- **pdf-lib** (Génération de contrats)

## 🚀 Installation & Lancement

1. **Cloner le projet**
   ```bash
   git clone [url-du-repo]
   cd automatic-platform
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   Copiez `.env.example` vers `.env` et remplissez les valeurs :
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`

4. **Initialiser la base de données**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

## 💰 Système d'encaissement

Un seul chemin pour tout l'argent : facture → paiement (en ligne ou manuel)
→ encaissement cumulé → reçu → notifications.

| Capacité | Détail |
|----------|--------|
| Fournisseurs | `MONEROO`, `FEDAPAY`, `MANUAL` (virement, espèces, chèque) |
| Acomptes | Montant libre, plafonné au reste à payer, cumulé sur la facture |
| Statut facture | `PAID` seulement si le cumul couvre le montant |
| Reçus | PDF généré à chaque encaissement réussi, archivé et servi sur `/api/files/[id]` |
| Journal | Table `WebhookLog` : événement, référence, signature valide, code de réponse |
| Idempotence | Un webhook rejoué ne double jamais un encaissement |

### Règles de calcul

- `Invoice.amountPaid` = somme des `Payment.status = SUCCESS`.
- Paiement partiel : la facture reste `SENT`, l'interface affiche « Partiellement payée ».
- Un paiement passé en `SUCCESS` ne repasse jamais en `PENDING` ou `FAILED`.
- Montant fournisseur incohérent avec le paiement local : la synchronisation est bloquée.

### Encaissement manuel

Depuis `/admin/invoices`, le bouton « Encaisser » enregistre un règlement reçu hors
plateforme. Il crée un `Payment` `MANUAL` en `SUCCESS`, recalcule le solde et produit
le même reçu qu'un paiement en ligne.

## 🏦 FedaPay (second fournisseur de paiement)

FedaPay est branché **en complément** de Moneroo : la même facture peut être
réglée par l'un ou l'autre, depuis deux boutons distincts.

| Élément | Valeur |
|---------|--------|
| Variables | `FEDAPAY_SECRET_KEY`, `FEDAPAY_WEBHOOK_SECRET` |
| Devise | FCFA natif, aucune conversion |
| Init | `POST /api/payments/fedapay/initialize` |
| Webhook | `POST /api/webhooks/fedapay` |

Sécurité du webhook : signature `X-FEDAPAY-SIGNATURE` vérifiée sur le corps
brut (format Stripe `t=...,s=...` et HMAC direct acceptés), puis la
transaction est **re-interrogée** chez FedaPay. Un faux événement
`transaction.approved` ne peut donc pas marquer une facture comme payée.

En sandbox, la page FedaPay demande un code de confirmation opérateur :
le paiement ne peut pas être finalisé automatiquement. Utilise le compte
live pour un test de bout en bout.

## 💳 Mise en production Moneroo (checklist)

La plateforme facture en **FCFA**. Le bac à sable Moneroo n'accepte que l'USD
(vérifié : `XOF` → 400, `USD` → OK), d'où une conversion explicite.

| Point | Attendu en production | Où |
|-------|----------------------|----|
| Devise | `MONEROO_CURRENCY=XOF` | Variables Vercel |
| Clé | clé **live** (`pvk_live_...`) | Variables Vercel |
| Webhook | `https://automatic-platform-beige.vercel.app/api/webhooks/moneroo` | Dashboard Moneroo → Développeurs → Webhooks |
| Secret webhook | identique à `MONEROO_WEBHOOK_SECRET` | Vercel + dashboard |

Tant que la devise n'est pas `XOF`, un bandeau d'avertissement apparaît sur
la vue d'ensemble admin, avec le taux de conversion appliqué.

Contrôle rapide du webhook depuis un poste :

```bash
curl -i -X POST https://automatic-platform-beige.vercel.app/api/webhooks/moneroo \
  -H "Content-Type: application/json" -H "X-Moneroo-Signature: faux" \
  -d '{"event":"payment.success","data":{"id":"test"}}'
# attendu : 403 Signature invalide
```

## 🎨 Interface v2 (système "Atelier")

Refonte complète de l'interface : moins de bruit visuel, une seule action
principale par écran, et une lecture confortable sur téléphone.

| Élément | Règle |
|---------|-------|
| Couleur | Canvas papier `#F6F6F2`, encre `#101215`, un seul accent cobalt `#1F3BE0` |
| Typographie | Bricolage Grotesque (titres) + Figtree (texte), base 15 px, aucune micro-capitale décorative |
| Structure | Filets 1 px et surfaces blanches plutôt que des cartes empilées |
| Rayons | 10 px pour les contrôles, 18 px pour les panneaux |
| Navigation | Barre latérale sur bureau, barre inférieure à 5 onglets sur mobile |
| Mouvement | Transitions courtes uniquement, coupées si `prefers-reduced-motion` |

Fichiers de référence : `src/app/globals.css` (jetons et classes `.btn`, `.field`, `.surface`),
`src/components/shell/AppShell.tsx` (coque client et admin), `src/lib/labels.ts` (libellés de
statuts) et `src/lib/format.ts` (montants XOF et dates).

## 🧩 Socle d'exécution (équipe, tâches, jalons, livrables)

Chaque projet dispose d'un espace d'exécution réel : l'équipe interne y
planifie et suit le travail, le client y valide les livrables. L'avancement
du projet n'est plus saisi à la main, il est **calculé** à partir des tâches
terminées (ou des jalons validés à défaut de tâches).

| Élément | Où | Rôle |
|---------|----|------|
| Tableau de tâches | `/admin/projects/[id]/execution` | Backlog → À faire → En cours → Revue → Terminé, glisser-déposer, priorité, échéance, assignation |
| Jalons | même page | Découpage du projet en étapes livrables, statut `PLANNED → VALIDATED` |
| Équipe projet | même page | `ProjectMember` : rôle (chef de projet, dev, design, QA, DevOps), % d'affectation |
| Livrables | même page | Version, fichier joint, soumission au client |
| Validation client | `/dashboard/projects/[id]` | Avancement, jalons, accepter un livrable ou demander des corrections |

### Modèle de données ajouté

| Modèle | Rôle |
|--------|------|
| `ProjectMember` | Rattache un utilisateur interne à un projet (rôle + affectation) |
| `Milestone` | Jalon daté, validable, rattachant tâches et livrables |
| `Task` | Tâche (statut, priorité, assigné, échéance, estimation) |
| `Deliverable` | Livrable versionné avec cycle `DRAFT → SUBMITTED → ACCEPTED / CHANGES_REQUESTED` |
| `StoredFile` | Fichier binaire stocké en base (moteur de stockage interne) |

### Règles d'accès (serveur, jamais côté client)

| Acteur | Lecture | Écriture exécution | Validation livrable |
|--------|---------|-------------------|---------------------|
| `ADMIN` | tous les projets | ✅ | ✅ |
| Membre d'équipe (`ProjectMember`) | son projet | ✅ | ❌ |
| Client (`Project.clientId`) | son projet | ❌ | ✅ |

Ces règles sont centralisées dans `src/lib/utils/projectAccess.ts` et
appliquées par toutes les actions serveur : un identifiant de projet reçu
du navigateur n'est jamais considéré comme une preuve d'accès.

### Stockage des fichiers — deux moteurs

| Moteur | Condition | Comportement |
|--------|-----------|--------------|
| Supabase Storage | `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` renseignés | Fichiers servis par le CDN Supabase |
| PostgreSQL interne (défaut) | sinon | Binaire dans `StoredFile`, servi par `/api/files/[id]` (session + contrôle d'accès projet) |

> Sans compte Supabase, contrats, livrables et pièces jointes fonctionnent
> donc **sans dépendance externe**. Pour repasser sur Supabase, il suffit de
> renseigner les deux variables, aucun code à modifier.

## 🗄 Base de données gratuite (Neon / Vercel Postgres)

La base **PostgreSQL gratuite** est hébergée sur **Neon** — le même moteur qui
propulse **Vercel Postgres** (Marketplace Vercel). Serverless, autoscaling,
mise en veille automatique (scale to zero) : idéal pour le plan gratuit.

| Paramètre | Valeur |
|-----------|--------|
| Projet Neon | `tiny-art-76610867` — **permanent**, dans le compte Neon `behjeaneudes8@gmail.com` |
| Branche / région | `main` · `aws-us-east-1` (alignée sur Vercel iad1) |
| Schéma | 17 tables créées via `npx prisma db push` |
| Connexion app | `DATABASE_URL` (URL **poolée** `-pooler`, PgBouncer) |
| Connexion migrations | `DIRECT_URL` = `DATABASE_URL_UNPOOLED` (URL **directe**) |

### Règle d'or des deux URLs

| Usage | URL à utiliser |
|-------|----------------|
| Application / fonctions serverless | `DATABASE_URL` (poolée) |
| `prisma db push` / `prisma migrate` | `DIRECT_URL` (directe) |

> ⚠️ Les migrations sur l'URL poolée échouent avec des erreurs obscures
> (`prepared statement "s0" already exists`) : PgBouncer ne supporte pas
> les sessions. `prisma.config.ts` lit donc `DIRECT_URL`.

### Déploiement Vercel (connecté)

- Le projet Vercel `automatic-platform` est **lié au dépôt GitHub**
  (`Eudes8/automatic-platform`, branche `master`) : chaque push déclenche
  un déploiement production automatique.
- URL de production : **https://automatic-platform-beige.vercel.app**
- Variables d'environnement configurées (production + preview + development) :
  `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `DIRECT_URL` (Neon),
  `MONEROO_SECRET_KEY`, `MONEROO_WEBHOOK_SECRET`, `MONEROO_CURRENCY`,
  `NEXT_PUBLIC_APP_URL`, plus `NEON_AUTH_BASE_URL`/`NEON_AUTH_COOKIE_SECRET` (auth) et Supabase/Resend.
- Si vous recréez la base un jour : `neon link` + `neon env pull` en local,
  puis `npx prisma db push`, et mettez à jour les variables Vercel.

## 💳 Passerelle de paiement Moneroo

Les clients règlent leurs factures depuis leur dashboard via **Moneroo**
(Mobile Money MTN / Moov / Orange / Airtel, Wave, cartes bancaires, etc.).

### Configuration

1. Renseignez dans `.env` :
   ```env
   MONEROO_SECRET_KEY="votre_clé_api_secrète"        # Dashboard Moneroo → Développeurs → Clés API
   MONEROO_WEBHOOK_SECRET="votre_secret_webhook"     # Dashboard Moneroo → Développeurs → Webhooks
   NEXT_PUBLIC_APP_URL="https://votre-domaine.com"   # URL publique de l'app
   MONEROO_CURRENCY="XOF"                            # Devise (USD en sandbox si XOF non activé)
   ```

2. Dans le dashboard Moneroo (Développeurs → Webhooks), enregistrez l'URL :
   ```
   https://votre-domaine.com/api/webhooks/moneroo
   ```

### Fonctionnement

| Étape | Description |
|-------|-------------|
| 1 | Le client clique sur **« Payer · Moneroo »** sur une facture (`SENT`/`OVERDUE`). |
| 2 | Le serveur initialise le paiement (`POST /v1/payments/initialize`) et enregistre un `Payment` en base. |
| 3 | Le client est redirigé vers la page de checkout Moneroo (`checkout_url`). |
| 4 | Après paiement, Moneroo le renvoie sur `/dashboard/invoices?paymentId=…&paymentStatus=…` : le statut est re-vérifié via l'API et synchronisé. |
| 5 | En parallèle, le **webhook** reçoit les événements (`payment.success`, `payment.failed`, `payment.cancelled`) signés **HMAC-SHA256** (`X-Moneroo-Signature`). |
| 6 | À la réception d'un `payment.success` : facture passée en `PAID`, notifications client + équipe, historique `Payment` mis à jour (idempotent). |

### Endpoints

| Route | Rôle |
|-------|------|
| `POST /api/payments/moneroo/initialize` | Initialise un paiement pour une facture (client authentifié). |
| `GET /api/payments/moneroo/verify?paymentId=…` | Re-vérifie un paiement au retour du client. |
| `POST /api/webhooks/moneroo` | Webhook Moneroo (signature obligatoire, idempotent). |

> 💡 **Mode test** : utilisez la clé API et le webhook de la boutique de test,
> puis les moyens de paiement factices proposés par Moneroo au checkout.

## 🚀 Déploiement
### Déploiement via GitHub & Vercel (Recommandé)

1. **Créer un dépôt GitHub** : Créez un nouveau dépôt et poussez votre code :
   ```bash
   git remote add origin [URL_GITHUB]
   git branch -M main
   git add .
   git commit -m "Initial commit: Ready for deployment"
   git push -u origin main
   ```

2. **Connecter à Vercel** :
   - Allez sur [Vercel](https://vercel.com) et cliquez sur **Add New > Project**.
   - Importez votre dépôt GitHub `automatic-platform`.
   - Configurez les **Environment Variables** sur Vercel à partir de votre fichier `.env`
     (voir la section **Base de données** : `DATABASE_URL`, `DATABASE_URL_UNPOOLED`,
     `DIRECT_URL`, puis Supabase, Resend et Moneroo).
   - Cliquez sur **Deploy**.

3. **CI/CD Automatisé** :
   Chaque `push` sur la branche `main` déclenchera automatiquement un build et un déploiement sur Vercel. Le fichier `.github/workflows/main.yml` configuré valide également le build sur GitHub.

## 📂 Documentation Future

Pour plus de détails sur l'architecture technique, les flux de données et la structure des composants, veuillez consulter :
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Guide complet du développeur.

---
*Propulsé par l'équipe AUTOMATIC — Redéfinir l'excellence digitale.*

## 🔐 Authentification (Neon Auth — Better Auth managé)

L'authentification est hébergée par **Neon Auth** (Better Auth managé) :
utilisateurs et sessions vivent dans le schéma `neon_auth` de la base,
elles se branchent donc avec la base (dev/staging/prod isolés par branche).

| Élément | Rôle |
|---------|------|
| `/api/auth/*` | Proxy same-origin vers le service Neon Auth (route catch-all Next). |
| `src/lib/auth-server.ts` | Instance serveur `createNeonAuth` (sessions httpOnly signées). |
| `src/lib/auth-client.ts` | Client navigateur (`signIn.email`, `signUp.email`, `emailOtp`…). |
| `getAuthenticatedUser()` | Session Neon Auth → profil Prisma (`User`) par email. |

- **Rôles** : `User.role` (Prisma) — `ADMIN` / `CLIENT`. Les layouts serveur
  `/admin` et `/dashboard` vérifient session + rôle ; les actions serveur
  utilisent `requireAdmin()`.
- **Bootstrap admin** : la première requête authentifiée de
  `automaticbmje@gmail.com` crée automatiquement son profil ADMIN.
- **Mot de passe oublié** : code OTP à 6 chiffres envoyé par le SMTP managé
  Neon (`emailOtp.sendVerificationOtp` → `emailOtp.resetPassword`).
- **Production** : SMTP personnalisé requis pour les emails de marque
  (checklist : https://neon.com/docs/auth/production-checklist.md).

### Corrections de sécurité incluses

| Faille corrigée | Gravité |
|-----------------|---------|
| `GET /api/admin/set-password` (sans auth) permettait de réinitialiser le mot de passe admin (mot de passe en dur dans le dépôt) | Critique |
| `POST /api/projects` (public) réinitialisait le mot de passe de n'importe quel email existant → prise de contrôle de compte | Critique |
| `GET /api/admin/promote` (sans auth) promouvait en ADMIN | Haute |
| `GET /api/check-user` exposait les données d'un compte sans authentification | Haute |
| Layout `/admin` sans contrôle de rôle côté serveur | Moyenne |
| Upload de fichiers via le client navigateur côté serveur | Moyenne |
| Headers de sécurité absents (nosniff, X-Frame-Options, HSTS…) | Moyenne |

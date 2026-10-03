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

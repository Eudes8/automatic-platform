# 🚀 AUTOMATIC — Platform de Pilotage Digital Premium

AUTOMATIC est une plateforme SaaS permettant de gérer le cycle de vie complet de projets de développement web et mobile, de la configuration initiale à la livraison finale.

## ✨ Fonctionnalités Clés

- **⚡ Project Builder Intelligent** : Configuration de projet avec estimation de budget instantanée.
- **📜 Signature Électronique** : Barrière contractuelle intégrée avec génération de PDF certifié.
- **📊 Dashboard de Pilotage** : Suivi de progression en temps réel et gestion des actifs.
- **💬 Salon de Discussion** : Ligne directe entre le client et l'équipe technique experte.
- **🛡️ Sécurité de Pointe** : Authentification via Supabase et gestion des accès granulaires.

## 🛠 Stack Technique

- **Next.js 16** (App Router, Server Actions)
- **Tailwind CSS 4** (Design System Cyber/Dark)
- **Prisma 7** + PostgreSQL
- **Supabase** (Auth & Serverless Logic)
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
   - Configurez les **Environment Variables** sur Vercel à partir de votre fichier `.env`.
   - Cliquez sur **Deploy**.

3. **CI/CD Automatisé** :
   Chaque `push` sur la branche `main` déclenchera automatiquement un build et un déploiement sur Vercel. Le fichier `.github/workflows/main.yml` configuré valide également le build sur GitHub.

## 📂 Documentation Future

Pour plus de détails sur l'architecture technique, les flux de données et la structure des composants, veuillez consulter :
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Guide complet du développeur.

---
*Propulsé par l'équipe AUTOMATIC — Redéfinir l'excellence digitale.*

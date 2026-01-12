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

## 📂 Documentation Future

Pour plus de détails sur l'architecture technique, les flux de données et la structure des composants, veuillez consulter :
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Guide complet du développeur.

---
*Propulsé par l'équipe AUTOMATIC — Redéfinir l'excellence digitale.*

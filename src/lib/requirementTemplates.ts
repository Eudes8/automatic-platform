export const REQUIREMENT_TEMPLATES = [
    {
        title: "Système de Paiement Mobile",
        description: "Intégration d'une passerelle de paiement mobile (Orange Money, MTN, Moov) avec gestion des callbacks, historique des transactions et notifications par SMS/Email à la réussite.",
        category: "TECHNICAL"
    },
    {
        title: "Authentification Sociale (OAuth2)",
        description: "Permettre aux utilisateurs de se connecter via Google, Facebook ou Apple. Gestion des profils, récupération de l'avatar et synchronisation des données.",
        category: "FUNCTIONAL"
    },
    {
        title: "Dashboard Analytique Temps Réel",
        description: "Interface de suivi avec graphiques interactifs (Recharts/Chart.js), filtres par date, export CSV/Excel des données et rafraîchissement automatique via WebSockets.",
        category: "DESIGN"
    },
    {
        title: "Système de Notifications Push",
        description: "Mise en place de Firebase Cloud Messaging (FCM) ou OneSignal pour envoyer des alertes directement sur les appareils mobiles et navigateurs des utilisateurs.",
        category: "TECHNICAL"
    },
    {
        title: "Optimisation SEO & Performance",
        description: "Vérification des Core Web Vitals, mise en place de la génération de sitemap, balises meta dynamiques, et optimisation du chargement des images (Lazy loading, Sharp).",
        category: "PERFORMANCE"
    },
    {
        title: "Double Authentification (2FA)",
        description: "Sécurisation renforcée des comptes via Google Authenticator (TOTP) ou envoi de codes secrets par SMS (via Twilio/SmsTo).",
        category: "SECURITY"
    }
];

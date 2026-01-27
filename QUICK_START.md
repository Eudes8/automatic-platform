# 🚀 Guide de Démarrage Rapide - Module Cahier des Charges

## ⚡ En 5 Minutes

### Étape 1 : Tester le Module (2 min)
```bash
# 1. Ajouter des données de test
npx tsx scripts/seed-requirements.ts

# 2. Lancer l'application
npm run dev
```

### Étape 2 : Voir le Résultat (1 min)
1. Ouvrez votre navigateur → `http://localhost:3000`
2. Connectez-vous en tant que **Client**
3. Allez dans **"Projets"** → Cliquez sur le premier projet
4. 📍 Vous verrez la section **"WORKSPACE CAHIER DES CHARGES"**

### Étape 3 : Tester l'Interaction (2 min)
1. Cliquez sur un requirement pour l'étendre
2. Ajoutez un commentaire dans l'input du bas
3. Cliquez sur **"APPROVED"** pour changer le statut
4. Cliquez sur **"+ NOUVEAU_POINT"** pour en créer un nouveau

---

## 🎯 Workflow Client-Admin

### 🧑 En tant que Client

```
1. Je navigue vers "Mes Projets"
2. Je clique sur un projet
3. Je scroll jusqu'à "WORKSPACE CAHIER DES CHARGES"
4. Je clique sur "+ NOUVEAU_POINT"
5. Je remplis :
   - Titre: "Système de parrainage"
   - Description: "Je veux que mes utilisateurs puissent inviter leurs amis..."
6. Je soumets
7. Le point apparaît avec le statut 🟡 SUGGESTED
```

### 👨‍💼 En tant qu'Admin

```
1. Je navigue vers "Admin" → "Projets"
2. Je clique sur le projet du client
3. Je scroll jusqu'à "Cahier des Charges Collaboratif"
4. Je vois le point créé par le client
5. Je clique dessus pour l'étendre
6. Je lis la description
7. J'ajoute un commentaire : "Quelle récompense souhaitez-vous donner ?"
8. Je change le statut en 🟠 IN_REVIEW
9. Le client reçoit la mise à jour (refresh de page pour l'instant)
10. Le client répond dans les commentaires
11. Je valide en mettant le statut en 🟢 APPROVED
```

---

## 📋 Cas d'Usage Complet : E-commerce

### Jour 1 - Initialisation
**Client :** Crée le projet "Boutique en Ligne Vêtements"

**Admin :** Crée le projet dans le système, met un budget estimatif de **500 000 XOF**

### Jour 2 - Client Exprime Ses Besoins
Le client ajoute ces requirements :
1. "Catalogue produits avec photos"
2. "Panier d'achat"
3. "Paiement Mobile Money (Orange + MTN)"
4. "Notifications SMS commandes"
5. "Espace vendeur pour gérer les stocks"

### Jour 3 - Admin Clarifie
Pour chaque point, l'admin commente :
- **Point 1 :** "Combien de produits environ ? Besoin de filtres (taille, couleur) ?"
  - Client : "~100 produits. Oui, filtres taille et couleur obligatoires."
  - Admin : **APPROVED**

- **Point 2 :** "OK, standard."
  - Admin : **APPROVED** directement

- **Point 3 :** "Quelle passerelle de paiement ? FedaPay, CinetPay ou PayDunya ?"
  - Client : "FedaPay, c'est ce qu'on utilise déjà."
  - Admin : **APPROVED**

- **Point 4 :** "SMS à quel moment ? Confirmation commande, expédition, livraison ?"
  - Client : "Confirmation et livraison suffisent."
  - Admin : **APPROVED**

- **Point 5 :** "Quelles fonctionnalités ? Ajout/suppression produit, gestion stock, stats ?"
  - Client : "Tout ça oui, plus pouvoir modifier les prix."
  - Admin : "Ça fait 4 sous-modules. On peut faire Phase 1 = gestion basique, Phase 2 = stats avancées ?"
  - Client : "OK pour phaser."
  - Admin : **APPROVED** avec note "Phase 1 seulement"

### Jour 4 - Ajustement Budget
**Admin :** 
- 5 requirements APPROVED
- Détails clarifiés
- Nouveau budget calculé : **650 000 XOF** (au lieu de 500k)

**Client :**
- Voit l'ajustement
- Comprend pourquoi (5 modules au lieu de l'estimation initiale de 3)
- Approuve

### Jour 5 - Signature Contrat
1. Admin marque tous les points en **APPROVED**
2. Admin met à jour le budget dans le projet : `650000`
3. Client navigue vers "Contrats"
4. Voit le contrat avec la mention :
   > "Le montant de 650 000 XOF a été défini suite aux échanges sur le Cahier des Charges."
5. Client signe électroniquement
6. Projet passe en phase développement

**Résultat :**
✅ Client sait exactement ce qu'il aura
✅ Admin sait exactement quoi développer
✅ Pas de surprise
✅ Traçabilité complète de la négociation

---

## 🎨 Personnalisation Rapide

### Changer les Couleurs des Statuts
Éditez `src/components/dashboard/RequirementWorkspace.tsx` :

```typescript
const getStatusIcon = (status: RequirementStatus) => {
    switch (status) {
        case "APPROVED": 
            return <CheckCircle2 className="text-emerald-500" size={16} />; // Vert
        case "IN_REVIEW": 
            return <Clock className="text-amber-500" size={16} />; // Orange
        case "REJECTED": 
            return <AlertCircle className="text-rose-500" size={16} />; // Rouge
        default: 
            return <MessageSquare className="text-primary/40" size={16} />; // Bleu clair
    }
};
```

### Ajouter un Statut "URGENT"
1. Modifiez `prisma/schema.prisma` :
```prisma
enum RequirementStatus {
  SUGGESTED
  IN_REVIEW
  APPROVED
  REJECTED
  URGENT  // ← Nouveau
}
```

2. Régénérez Prisma :
```bash
npx prisma generate
npx prisma db push
```

3. Ajoutez le bouton dans `RequirementWorkspace.tsx` :
```typescript
<button onClick={() => handleStatusUpdate(req.id, 'URGENT')}>
    URGENT
</button>
```

---

## 🔒 Sécurité

### Restreindre Changement de Statut aux Admins
Modifiez `src/lib/actions/requirements.ts` :

```typescript
export async function updateRequirementStatus(requirementId: string, status: RequirementStatus) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Non autorisé");
    
    // Vérifier que c'est un admin
    if (user.role !== 'ADMIN') {
        throw new Error("Seuls les admins peuvent changer les statuts");
    }
    
    // ... reste du code
}
```

---

## 📞 Support

### Problème Courant #1 : Requirements ne s'affichent pas
**Solution :**
```bash
# Vérifier que Prisma est à jour
npx prisma generate

# Vérifier que la BDD est synchronisée
npx prisma db push

# Redémarrer le serveur
npm run dev
```

###Problème Courant #2 : Erreur "project.requirements is undefined"
**Solution :**
Vérifiez que vous avez bien ajouté l'include dans `getClientProjects()` :
```typescript
// src/lib/actions/projects.ts
include: {
    // ... autres includes
    requirements: {
        include: {
            comments: { orderBy: { createdAt: 'asc' } }
        },
        orderBy: { createdAt: 'desc' }
    }
}
```

### Problème Courant #3 : Les commentaires ne s'ajoutent pas
**Solution :**
Vérifiez la console du navigateur. Si erreur CORS, c'est normal en dev. Rechargez la page pour voir le nouveau commentaire.

---

## 🎓 Ressources

- 📖 [Documentation Complète](./MODULE_CAHIER_DES_CHARGES.md)
- 📋 [Récapitulatif Technique](./IMPLEMENTATION_SUMMARY.md)
- 🚀 [Roadmap Améliorations](./ROADMAP_REQUIREMENTS.md)
- 🔧 [Script de Test](./scripts/seed-requirements.ts)

---

## ✅ Checklist Avant Utilisation en Production

- [ ] Exécuter `npx prisma db push` en production
- [ ] Tester avec un vrai client
- [ ] Vérifier que les emails sont corrects dans la BDD
- [ ] S'assurer que le bucket Supabase Storage existe
- [ ] Configurer les permissions RLS si nécessaire
- [ ] Tester la signature de contrat avec le nouveau montant
- [ ] Former l'équipe admin à l'utilisation

---

**Prêt ? Lancez `npm run dev` et testez ! 🚀**

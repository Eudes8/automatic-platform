# 📋 Module Cahier des Charges & Livrables 4x4

## 🎯 Concept

Le **Cahier des Charges Collaboratif** est le point de départ de chaque projet, permettant un échange dynamique et illimité entre le client et l'admin pour définir **précisément** les besoins.

### ✨ Différences avec un Cahier des Charges "Standard"

| Standard (Figé) | Collaboratif 4x4 (Vivant) |
|----------------|---------------------------|
| Document Word/PDF statique | Espace interactif en temps réel |
| Envoyé par email, modifié à part | Édition directe dans la plateforme |
| Pas de fil de discussion | Chaque point a sa propre conversation |
| Validation globale "tout ou rien" | Validation point par point |
| Limité à ce que l'admin propose | **Client peut ajouter jusqu'à 10 000 spécifications** |

---

## 🛠️ Fonctionnalités

### 1. **Ajout de Points Techniques (Client & Admin)**
- Chacun peut proposer autant de points qu'il le souhaite.
- Ex: "Module de parrainage", "Système de paiement mobile", "Dark Mode", etc.

### 2. **États de Négociation**
Chaque point possède un statut :
- 🟡 **SUGGESTED** : Proposition initiale
- 🟠 **IN_REVIEW** : En cours de discussion
- 🟢 **APPROVED** : Validé par les deux parties
- 🔴 **REJECTED** : Non retenu

### 3. **Fils de Discussion Dédiés**
- Au lieu d'un long email, chaque point a son propre espace de commentaires.
- Permet de poser des questions spécifiques : "Quel moyen de paiement ?" ou "Combien de langues pour le multilingue ?".

### 4. **Lien avec le Budget**
- ⚠️ **IMPORTANT** : Le montant du contrat est **une estimation**.
- Le montant final est calculé après validation de **tous les points APPROVED**.
- Mention légale ajoutée au contrat :
  > "Le montant indiqué ci-dessus est une estimation basée sur les besoins initiaux. Ce montant est susceptible d'être réajusté (à la hausse comme à la baisse) d'un commun accord entre les parties, suite aux négociations détaillées et aux échanges approfondis sur le Cahier des Charges technique définitif."

### 5. **Support Multi-Devises**
- Les contrats supportent le **Franc CFA (XOF)** natifement.
- La devise est automatiquement détectée et affichée correctement dans le PDF final.

---

## 📍 Où le Trouver ?

### Côté Client (`/dashboard/projects/[id]`)
- Accessible directement après la **Deployment Timeline**.
- Section **"WORKSPACE CAHIER DES CHARGES"**.
- Bouton **"+ NOUVEAU_POINT"** pour ajouter des besoins.

### Côté Admin (`/admin/projects/[id]`)
- Section dédiée **"Cahier des Charges Collaboratif"**.
- Même interface pour répondre, proposer et valider.

---

## 🚀 Workflow Typique

1. **Phase Initiale** : L'admin crée le projet avec une description générale.
2. **Échange** : 
   - Le client ajoute ses besoins spécifiques (ex: "Je veux un système de notification push").
   - L'admin commente pour clarifier : "Sur iOS/Android ou web uniquement ?".
   - Le client répond : "Les deux".
   - L'admin passe le statut à **IN_REVIEW**.
3. **Validation** : 
   - Une fois qu'on est d'accord sur le périmètre du point, l'admin passe le statut à **APPROVED**.
   - Si ce n'est pas faisable ou pertinent, l'admin met **REJECTED** avec une explication.
4. **Contractualisation** : 
   - Quand tous les points critiques sont **APPROVED**, le budget final est négocié.
   - Le client signe le contrat qui contient la mention de négociation.
5. **Livrables** : 
   - Chaque livrable déposé par l'admin peut être associé à un ou plusieurs points du cahier des charges.
   - Traçabilité totale entre "ce qui était demandé" et "ce qui a été livré".

---

## 💡 Avantages pour le Client

- **Liberté Totale** : Pas de limite au nombre de spécifications (jusqu'à 10 000).
- **Transparence** : Chaque échange est archivé et consultable.
- **Budget Juste** : Le prix final reflète exactement ce qui a été discuté et validé.
- **Pas de Surprise** : Vous savez exactement ce que vous payez et pourquoi.

---

## 🔒 Sécurité & Certification

- Tous les échanges sont cryptés **AES-256**.
- Chaque point et commentaire est horodaté et lié à un utilisateur identifié.
- Le PDF final du Cahier des Charges peut être généré à tout moment avec l'historique complet.

---

## 📞 Support

Pour toute question sur l'utilisation de ce module, contactez l'admin via le chat intégré ou le système de tickets.

---

**Développé par AUTOMATIC CI** - Plateforme de gestion de projets premium.

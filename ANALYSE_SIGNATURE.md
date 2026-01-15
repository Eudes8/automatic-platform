# Analyse du processus de signature de contrat

## Flux complet du processus

```
Utilisateur clique sur "SIGNER & ENVOYER" (ContractSigner.tsx ligne 155)
    ↓
Fonction save() est appelée (ligne 41)
    ↓
[PROBLÈME #1] Canvas vide? Retour prématuré ligne 39
    ↓
[ÉTAPE 1] getTrimmedCanvas().toDataURL("image/png") - Récupère la signature (ligne 48)
    ↓
[ÉTAPE 2] generateProjectContract() - Génère le PDF côté client (ligne 51)
    ↓
[PROBLÈME #2] new Blob([pdfBytes.buffer]) - INCORRECTE! (ligne 53)
    → pdfBytes est un Uint8Array
    → pdfBytes.buffer retourne l'ArrayBuffer complet (peut contenir du vide)
    → Le Blob créé peut être corrompu ou vide
    ↓
[ÉTAPE 3] downloadBlob() - Télécharge le PDF côté client (ligne 54)
    ↓
[ÉTAPE 4] onSign(signatureData) - Appelle le callback avec la signature (ligne 57)
    ↓
[ÉTAPE 5 - Côté serveur] signContract() reçoit la signature (projects.ts:59)
    ↓
[ÉTAPE 5a] Génère à nouveau le PDF côté serveur (ligne 79-85)
    ↓
[ÉTAPE 5b] Upload le PDF sur Supabase Storage (ligne 87-89)
    ↓
[ÉTAPE 5c] Met à jour le project dans la DB (ligne 91-97)
    ↓
[ÉTAPE 5d] Crée/Met à jour le record Contract (ligne 99-117)
    ↓
[ÉTAPE 5e] Revalidate les paths (ligne 119-121)
    ↓
Retourne { success: true, pdfUrl }
    ↓
[PROBLÈME #3] setSigned(true) AVANT la fin (ligne 59)
    → Le bouton devient désactivé immédiatement
    → L'utilisateur ne voit pas si tout s'est bien passé
    → Fermeture après 1.5s (ligne 60)
```

## Problèmes identifiés

### PROBLÈME #1 - Canvas vide au départ
**Fichier**: `src/components/dashboard/ContractSigner.tsx` ligne 39
```typescript
if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
    console.warn("Canvas is empty");
    return;  // ← Retour silencieux
}
```
**Impact**: Si le canvas est vide, la fonction retourne sans rien faire et sans désactiver le loading
**Solution**: Afficher une alerte ou message à l'utilisateur

### PROBLÈME #2 - Création incorrecte du Blob pour le PDF
**Fichier**: `src/components/dashboard/ContractSigner.tsx` ligne 53
```typescript
const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
```
**Problème**: 
- `pdfBytes` est un Uint8Array
- `pdfBytes.buffer` retourne l'ArrayBuffer ENTIER (avec possibilité du vide)
- On ne doit pas faire de cast dangereux
- Le Blob créé peut être corrompu

**Solution correcte**:
```typescript
const blob = new Blob([pdfBytes], { type: "application/pdf" });
// Ou
const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
```

### PROBLÈME #3 - Flot de contrôle confus
**Fichier**: `src/components/dashboard/ContractSigner.tsx` lignes 54-60
```typescript
// Ordre d'exécution:
// 1. Génère PDF
// 2. Télécharge PDF
// 3. Appelle onSign() - qui va faire ASYNC signContract()
// 4. IMMÉDIATEMENT setSigned(true)  ← PROBLÈME!
// 5. Ferme après 1.5s

setSigned(true);  // Ligne 59 - Appelé TROP TÔT
setTimeout(onClose, 1500);  // Ligne 60 - Ferme sans attendre signContract
```

**Impact**: 
- `setSigned(true)` est appelé immédiatement
- Le bouton devient vert "VALIDÉ" 
- Mais `signContract` n'a pas encore commencé!
- Si `signContract` échoue, l'utilisateur l'ignore
- La page se ferme avant même que l'upload soit terminé

**Solution**: Attendre que `signContract` se termine avant `setSigned(true)`

### PROBLÈME #4 - Pas de gestion d'erreur dans le callback
**Fichier**: `src/components/dashboard/ContractBarrier.tsx` lignes 76-93
```typescript
if (result.success) {
    setTimeout(() => {
        window.location.reload();
    }, 1000);
} else {
    console.error("ContractBarrier: Sign failed:", result.error);
    alert(`Erreur lors de la signature: ${result.error}`);
}
```
**Problème**: Si result.success est false, on affiche une alerte MAIS on ne ferme pas le modal
**Impact**: L'utilisateur voit l'erreur mais est pris au piège dans le modal

## Résumé des fixes nécessaires

1. ✅ Corriger le Blob creation: `new Blob([pdfBytes])`
2. ✅ Attendre que onSign se termine avant setSigned(true)
3. ✅ Améliorer le feedback utilisateur si canvas vide
4. ✅ Gérer les erreurs dans ContractBarrier avec fermeture du modal

## Ordre des fixes

1. **HIGH**: Corriger `new Blob([pdfBytes.buffer])` → `new Blob([pdfBytes])`
2. **HIGH**: Attendre `onSign` avant `setSigned(true)` et `onClose`
3. **MEDIUM**: Améliorer feedback si canvas vide
4. **MEDIUM**: Meilleure gestion d'erreur dans ContractBarrier

# 🚀 Améliorations Futures - Module Cahier des Charges

## 🎯 Phase 2 : Fonctionnalités Avancées

### 1. **Export PDF du Cahier des Charges Validé**
**Description :** Générer un PDF professionnel avec tous les requirements APPROVED.

**Implémentation :**
```typescript
// src/lib/utils/pdf.ts
export async function generateApprovedRequirementsPDF(
    projectId: string,
    requirements: Requirement[]
) {
    const approved = requirements.filter(r => r.status === 'APPROVED');
    const pdfDoc = await PDFDocument.create();
    
    // Header
    // Logo AUTOMATIC
    // Titre: "CAHIER DES CHARGES VALIDÉ"
    // Sous-titre: Nom du projet
    
    // Pour chaque requirement approuvé
    for (const req of approved) {
        // Titre du point
        // Description
        // Date d'approbation
        // Separator
    }
    
    // Footer avec signatures
    return await pdfDoc.save();
}
```

**Bouton dans l'interface :**
- Placer dans `RequirementWorkspace.tsx`
- Actif uniquement si au moins 1 requirement est APPROVED
- Télécharge instantanément le PDF

---

### 2. **Notifications en Temps Réel**
**Description :** Alerter l'admin quand le client ajoute un nouveau point, et vice-versa.

**Stack Technique :**
- **Option A :** WebSockets avec Socket.io
- **Option B :** Supabase Realtime (plus simple)

**Implémentation avec Supabase :**
```typescript
// src/hooks/useRequirementsRealtime.ts
import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function useRequirementsRealtime(projectId: string, onUpdate: () => void) {
    useEffect(() => {
        const supabase = createBrowserClient(/*...*/);
        
        const channel = supabase
            .channel('requirements')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'Requirement',
                filter: `projectId=eq.${projectId}`
            }, () => {
                onUpdate(); // Refetch requirements
            })
            .subscribe();
            
        return () => { supabase.removeChannel(channel); };
    }, [projectId]);
}
```

---

### 3. **Catégorisation des Requirements**
**Description :** Organiser les points par catégories (Fonctionnel, Technique, Design, etc.).

**Schéma Prisma :**
```prisma
enum RequirementCategory {
  FUNCTIONAL
  TECHNICAL
  DESIGN
  SECURITY
  PERFORMANCE
  OTHER
}

model Requirement {
  // ... existing fields
  category RequirementCategory @default(OTHER)
}
```

**Interface :**
- Dropdown pour choisir la catégorie lors de la création
- Filtres visuels dans RequirementWorkspace
- Groupement par catégorie dans l'affichage

---

### 4. **Pièces Jointes dans les Commentaires**
**Description :** Permettre d'uploader des images, PDF dans les discussions.

**Schéma Prisma :**
```prisma
model RequirementComment {
  // ... existing fields
  attachments String[] // URLs Supabase Storage
}
```

**Composant :**
```typescript
// src/components/dashboard/AttachmentUploader.tsx
export function AttachmentUploader({ onUpload }: { onUpload: (url: string) => void }) {
    async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const buffer = await file.arrayBuffer();
        const path = `requirements/attachments/${Date.now()}_${file.name}`;
        const url = await uploadFileToStorage('project-assets', path, Buffer.from(buffer), file.type);
        onUpload(url);
    }
    
    return <input type="file" onChange={handleFileChange} />;
}
```

---

### 5. **Estimation Automatique du Budget**
**Description :** Calculer automatiquement un budget en fonction du nombre de requirements APPROVED.

**Logique :**
```typescript
// src/lib/utils/budgetEstimator.ts
export function estimateBudget(requirements: Requirement[]): number {
    const baseCost = 100000; // XOF
    const approvedCount = requirements.filter(r => r.status === 'APPROVED').length;
    
    // Chaque requirement approuvé ajoute entre 50k et 200k XOF selon la complexité
    // On pourrait demander à l'admin d'assigner une "complexité" (1-5) à chaque point
    const averageCostPerRequirement = 75000; // XOF
    
    return baseCost + (approvedCount * averageCostPerRequirement);
}
```

**Interface :**
- Afficher en temps réel : "Budget estimé : XXX XOF"
- Mettre à jour quand un requirement passe en APPROVED

---

### 6. **Historique des Changements de Statut**
**Description :** Tracker qui a changé le statut d'un requirement et quand.

**Schéma Prisma :**
```prisma
model RequirementStatusHistory {
  id            String            @id @default(cuid())
  requirementId String
  requirement   Requirement       @relation(fields: [requirementId], references: [id])
  from          RequirementStatus?
  to            RequirementStatus
  changedBy     String
  createdAt     DateTime          @default(now())
  
  @@index([requirementId])
}
```

**Affichage :**
- Timeline visuelle sous chaque requirement
- Ex: "SUGGESTED → IN_REVIEW (par Admin, le 20/01/2026 à 15h30)"

---

### 7. **Templates de Requirements**
**Description :** Proposer des templates pré-remplis pour accélérer la création.

**Exemples de Templates :**
- "Système de Paiement Mobile"
- "Authentification (Login/Register)"
- "Dashboard Administrateur"
- "API REST"
- "Application Mobile Hybride"

**Implémentation :**
```typescript
// src/lib/requirementTemplates.ts
export const templates = [
    {
        title: "Système de Paiement Mobile",
        description: "Je souhaite intégrer un système de paiement mobile avec support pour Orange Money, MTN Mobile Money et Moov Money. Les transactions doivent être sécurisées et les utilisateurs doivent recevoir une confirmation par SMS."
    },
    {
        title: "Dashboard Analytique",
        description: "Un tableau de bord avec graphiques interactifs pour suivre les KPI : nombre d'utilisateurs actifs, revenus, taux de conversion. Export des données en Excel et PDF."
    },
    // ... autres templates
];
```

**Interface :**
- Bouton "Utiliser un Template" à côté de "Nouveau Point"
- Modal avec liste de templates
- Clic sur un template pré-remplit le formulaire

---

### 8. **Dépendances entre Requirements**
**Description :** Marquer certains requirements comme dépendant d'autres.

**Exemple :**
- "Notifications Push" dépend de "Système d'Authentification"
- Si le requirement parent est REJECTED, alerter sur les dépendants

**Schéma Prisma :**
```prisma
model Requirement {
  // ... existing fields
  dependsOn   String[]       // IDs des requirements parents
  dependents  Requirement[]  @relation("RequirementDependencies")
  dependencies Requirement[] @relation("RequirementDependencies")
}
```

---

### 9. **Voting System (Optional)**
**Description :** Si plusieurs stakeholders, permettre le vote sur chaque requirement.

**Schéma Prisma :**
```prisma
model RequirementVote {
  id            String      @id @default(cuid())
  requirementId String
  requirement   Requirement @relation(fields: [requirementId], references: [id])
  userId        String
  vote          Boolean     // true = pour, false = contre
  createdAt     DateTime    @default(now())
  
  @@unique([requirementId, userId])
}
```

**Affichage :**
- Thumbs Up / Thumbs Down sous chaque requirement
- "3 pour, 1 contre"

---

### 10. **Recherche & Filtres Avancés**
**Description :** Rechercher et filtrer les requirements.

**Fonctionnalités :**
- Recherche par titre/description
- Filtrage par statut (SUGGESTED, IN_REVIEW, APPROVED, REJECTED)
- Filtrage par catégorie
- Tri par date, alphabétique, nombre de commentaires

**Composant :**
```typescript
// src/components/dashboard/RequirementFilters.tsx
export function RequirementFilters({ onFilter }: { onFilter: (filters: Filters) => void }) {
    return (
        <div className="filters">
            <input type="search" placeholder="Rechercher..." />
            <select name="status">
                <option value="">Tous les statuts</option>
                <option value="SUGGESTED">Suggéré</option>
                <option value="APPROVED">Approuvé</option>
                {/* ... */}
            </select>
        </div>
    );
}
```

---

## 📊 Priorisation Recommandée

| Fonctionnalité | Priorité | Complexité | Impact |
|----------------|----------|------------|--------|
| Export PDF Cahier des Charges | 🔴 Haute | Faible | Fort |
| Notifications Temps Réel | 🔴 Haute | Moyenne | Fort |
| Catégorisation | 🟠 Moyenne | Faible | Moyen |
| Pièces Jointes | 🟠 Moyenne | Moyenne | Moyen |
| Estimation Budget | 🟡 Basse | Faible | Moyen |
| Historique Statuts | 🟡 Basse | Moyenne | Faible |
| Templates | 🟢 Nice-to-have | Faible | Moyen |
| Dépendances | 🟢 Nice-to-have | Élevée | Faible |
| Voting System | ⚪ Optionnel | Moyenne | Faible |
| Recherche/Filtres | 🟠 Moyenne | Faible | Fort |

---

## 🛠️ Ordre d'Implémentation Suggéré

1. **Export PDF** (Quick Win, fort impact)
2. **Recherche & Filtres** (Améliore UX immédiatement)
3. **Catégorisation** (Organisation claire)
4. **Notifications Temps Réel** (Améliore la collaboration)
5. **Templates** (Accélère la création)
6. **Pièces Jointes** (Enrichit les discussions)
7. **Estimation Budget** (Automatisation utile)
8. **Historique Statuts** (Traçabilité avancée)
9. **Dépendances** (Pour projets complexes)
10. **Voting System** (Si multi-stakeholders)

---

## 💡 Autres Idées

### A. **Intégration Slack/Discord**
- Envoyer une notif sur Slack quand un nouveau requirement est créé
- Créer un thread Slack pour chaque requirement

### B. **Mode "Review"**
- Une vue spéciale admin pour approuver en masse
- Liste compacte avec checkboxes
- Bouton "Approuver sélection"

### C. **Statistiques Avancées**
- Graphique : Répartition des statuts
- Temps moyen pour passer de SUGGESTED à APPROVED
- Requirements les plus commentés

### D. **Versioning**
- Permettre d'éditer un requirement après création
- Garder un historique des versions

---

**Note :** Toutes ces fonctionnalités sont **optionnelles**. Le module actuel est déjà complet et fonctionnel pour 90% des cas d'usage.

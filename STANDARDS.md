# 📐 STANDARDS DE CODE - AUTOMATIC

Ce document définit les règles strictes à respecter dans tout le codebase pour garantir une qualité professionnelle.

---

## 🎨 DESIGN & CSS

### Variables CSS
```css
/* ✅ CORRECT : Utiliser les variables du Design System */
background-color: var(--background);
color: var(--primary);
border: 1px solid var(--border);

/* ❌ INCORRECT : Valeurs en dur */
background-color: #f8fafc;
color: #2563eb;
```

### Classes Tailwind
```tsx
/* ✅ CORRECT : Classes cohérentes */
className="px-6 py-4 bg-card border border-border rounded-2xl"

/* ❌ INCORRECT : Mélange de styles */
className="px-6 py-4 bg-white border-gray-200 rounded-lg"
```

### Animations
```tsx
/* ✅ CORRECT : Utiliser Framer Motion avec courbes uniformes */
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>

/* ❌ INCORRECT : CSS transitions incohérentes */
<div className="transition-all duration-1000 ease-linear">
```

---

## ⚛️ REACT & TYPESCRIPT

### Composants
```tsx
/* ✅ CORRECT : Composant typé et documenté */
interface ButtonProps {
  variant: "primary" | "secondary";
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Button({ variant, onClick, children, disabled = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}

/* ❌ INCORRECT : Props non typées */
export function Button({ variant, onClick, children }: any) {
  // ...
}
```

### Hooks
```tsx
/* ✅ CORRECT : Hooks avec dépendances claires */
const [data, setData] = useState<Project[]>([]);

useEffect(() => {
  fetchProjects().then(setData);
}, []);

/* ❌ INCORRECT : Dépendances manquantes */
useEffect(() => {
  fetchProjects(userId).then(setData); // userId devrait être en dépendance
}, []);
```

### Gestion d'état
```tsx
/* ✅ CORRECT : État typé et immutable */
const [form, setForm] = useState<FormData>({
  title: "",
  description: ""
});

const updateTitle = (title: string) => {
  setForm(prev => ({ ...prev, title }));
};

/* ❌ INCORRECT : Mutation directe */
const updateTitle = (title: string) => {
  form.title = title; // MUTATION !
  setForm(form);
};
```

---

## 🔧 SERVER ACTIONS & BACKEND

### Validation
```ts
/* ✅ CORRECT : Validation Zod stricte */
"use server";

import { z } from "zod";

const schema = z.object({
  title: z.string().min(3, "Titre trop court"),
  email: z.string().email("Email invalide")
});

export async function createProject(data: unknown) {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return { success: false, error: result.error.format() };
  }
  
  // ...
}

/* ❌ INCORRECT : Pas de validation */
export async function createProject(data: any) {
  await prisma.project.create({ data }); // DANGEREUX !
}
```

### Gestion d'erreurs
```ts
/* ✅ CORRECT : Try/catch avec logs structurés */
export async function getProject(id: string) {
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    
    if (!project) {
      return { success: false, error: "Projet introuvable" };
    }
    
    return { success: true, data: project };
  } catch (error) {
    console.error("[getProject] Error:", { id, error });
    return { success: false, error: "Erreur serveur" };
  }
}

/* ❌ INCORRECT : Pas de gestion d'erreur */
export async function getProject(id: string) {
  const project = await prisma.project.findUnique({ where: { id }});
  return project; // Peut crasher !
}
```

### Sécurité
```ts
/* ✅ CORRECT : Vérification des permissions */
export async function deleteProject(id: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: false, error: "Non authentifié" };
  }
  
  const project = await prisma.project.findUnique({
    where: { id },
    select: { clientId: true }
  });
  
  if (project?.clientId !== user.id && user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" };
  }
  
  await prisma.project.delete({ where: { id } });
  return { success: true };
}

/* ❌ INCORRECT : Pas de vérification */
export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  return { success: true };
}
```

---

## 🗄️ PRISMA & BASE DE DONNÉES

### Schéma
```prisma
// ✅ CORRECT : Relations claires, indexes, contraintes
model Project {
  id          String   @id @default(cuid())
  title       String
  clientId    String
  client      User     @relation(fields: [clientId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([clientId])
  @@index([createdAt])
}

// ❌ INCORRECT : Pas d'index, pas de relation
model Project {
  id        String
  title     String
  clientId  String
}
```

### Requêtes
```ts
/* ✅ CORRECT : Sélection des champs nécessaires */
const projects = await prisma.project.findMany({
  where: { clientId: userId },
  select: {
    id: true,
    title: true,
    status: true
  },
  take: 10,
  orderBy: { createdAt: "desc" }
});

/* ❌ INCORRECT : Sélection de tout */
const projects = await prisma.project.findMany({
  where: { clientId: userId }
}); // Charge tous les champs inutilement
```

### Transactions
```ts
/* ✅ CORRECT : Transaction pour opérations liées */
await prisma.$transaction(async (tx) => {
  const project = await tx.project.create({ data: projectData });
  await tx.contract.create({
    data: {
      projectId: project.id,
      content: contractContent
    }
  });
});

/* ❌ INCORRECT : Opérations séparées */
const project = await prisma.project.create({ data: projectData });
await prisma.contract.create({ data: { projectId: project.id } });
// Si la 2e échoue, le projet existe sans contrat !
```

---

## 🎯 UX & ACCESSIBILITÉ

### Feedback utilisateur
```tsx
/* ✅ CORRECT : Feedback à chaque action */
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async () => {
  setLoading(true);
  setError(null);
  
  const result = await createProject(data);
  
  if (result.success) {
    toast.success("Projet créé avec succès");
    router.push(`/projects/${result.data.id}`);
  } else {
    setError(result.error);
  }
  
  setLoading(false);
};

/* ❌ INCORRECT : Pas de feedback */
const handleSubmit = async () => {
  await createProject(data);
  // L'utilisateur ne sait pas si ça a marché
};
```

### Accessibilité
```tsx
/* ✅ CORRECT : Labels, aria, keyboard */
<button
  onClick={handleClick}
  aria-label="Supprimer le projet"
  disabled={loading}
  className="btn-danger"
>
  <Trash className="w-4 h-4" />
  <span className="sr-only">Supprimer</span>
</button>

/* ❌ INCORRECT : Pas de label */
<button onClick={handleClick}>
  <Trash />
</button>
```

---

## 🚀 PERFORMANCE

### Images
```tsx
/* ✅ CORRECT : Next.js Image avec optimisation */
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority
  quality={85}
/>

/* ❌ INCORRECT : img classique */
<img src="/hero.jpg" alt="Hero" />
```

### Lazy Loading
```tsx
/* ✅ CORRECT : Lazy loading des composants lourds */
const AdminPanel = dynamic(() => import("@/components/AdminPanel"), {
  loading: () => <Skeleton />,
  ssr: false
});

/* ❌ INCORRECT : Import direct */
import AdminPanel from "@/components/AdminPanel";
```

### Memoization
```tsx
/* ✅ CORRECT : Memoization des calculs coûteux */
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);

const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

/* ❌ INCORRECT : Recalcul à chaque render */
const expensiveValue = complexCalculation(data);
const handleClick = () => doSomething(id);
```

---

## 📝 DOCUMENTATION

### Commentaires
```ts
/* ✅ CORRECT : Commentaires utiles */
/**
 * Génère un PDF de contrat signé et l'upload sur Supabase Storage.
 * @param projectId - ID du projet
 * @param signature - Signature en base64
 * @returns URL du PDF uploadé
 */
export async function generateContract(
  projectId: string,
  signature: string
): Promise<string> {
  // ...
}

/* ❌ INCORRECT : Commentaires inutiles */
// Cette fonction crée un projet
export async function createProject(data: any) {
  // On crée le projet
  const project = await prisma.project.create({ data });
  // On retourne le projet
  return project;
}
```

### Nommage
```ts
/* ✅ CORRECT : Noms explicites */
const isProjectOwner = project.clientId === user.id;
const canDeleteProject = isProjectOwner || user.role === "ADMIN";

/* ❌ INCORRECT : Noms cryptiques */
const x = project.clientId === user.id;
const y = x || user.role === "ADMIN";
```

---

## 🔒 SÉCURITÉ

### Validation des inputs
```ts
/* ✅ CORRECT : Sanitization et validation */
import { z } from "zod";

const emailSchema = z.string().email().toLowerCase().trim();
const email = emailSchema.parse(userInput);

/* ❌ INCORRECT : Utilisation directe */
const email = userInput; // Peut contenir n'importe quoi !
```

### Secrets
```ts
/* ✅ CORRECT : Variables d'environnement */
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

/* ❌ INCORRECT : Secrets en dur */
const apiKey = "AIzaSyDCdAPcS-aKG0a5LvhBJKebZ5-EFD9GxaM";
```

---

*Dernière mise à jour : 17 Janvier 2026*

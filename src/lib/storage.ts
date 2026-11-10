import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";

/**
 * Couche de stockage de fichiers — deux moteurs interchangeables.
 *
 * 1. **Supabase Storage** (si NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *    sont configurés) : comportement historique, fichiers servis depuis le CDN.
 * 2. **Stockage interne PostgreSQL** (par défaut) : le binaire est écrit dans la
 *    table `StoredFile` et servi par la route protégée `/api/files/[id]`.
 *
 * Le second moteur évite toute dépendance externe : la plateforme reste
 * fonctionnelle (contrats, livrables, pièces jointes) sans compte Supabase.
 * Pour basculer sur Supabase, il suffit de renseigner les deux variables.
 */

let instance: SupabaseClient | null = null;

function isSupabaseConfigured(): boolean {
    return Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
            (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)
    );
}

function getAdminClient(): SupabaseClient {
    if (!instance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error(
                "Configuration Supabase incomplète : renseignez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (voir .env.example)."
            );
        }
        instance = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });
    }
    return instance;
}

/**
 * Extrait l'identifiant de projet d'un chemin de stockage.
 * Les chemins applicatifs suivent la convention `<dossier>/<projectId>/<fichier>`.
 * Sert à restreindre l'accès aux fichiers d'un projet à ses parties prenantes.
 */
export function extractProjectId(path: string): string | null {
    const match = path.match(/(?:^|\/)([a-z0-9]{20,32})(?:\/|$)/i);
    return match ? match[1] : null;
}

function toBuffer(fileBody: ArrayBuffer | Buffer): Buffer {
    return Buffer.isBuffer(fileBody) ? fileBody : Buffer.from(fileBody);
}

/** Nom de fichier lisible à partir d'un chemin de stockage. */
function basename(path: string): string {
    const parts = path.split("/");
    return parts[parts.length - 1] || path;
}

/** Moteur de stockage actif. */
export function getStorageDriver(): "supabase" | "database" {
    return isSupabaseConfigured() ? "supabase" : "database";
}

export async function uploadFileToStorage(
    bucket: string,
    path: string,
    fileBody: ArrayBuffer | Buffer,
    contentType: string
): Promise<string> {
    const body = toBuffer(fileBody);

    if (isSupabaseConfigured()) {
        const supabaseAdmin = getAdminClient();
        const { error } = await supabaseAdmin.storage.from(bucket).upload(path, body, {
            contentType,
            upsert: true,
        });
        if (error) {
            console.error("Storage upload failed:", error);
            throw error;
        }
        const {
            data: { publicUrl },
        } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
        return publicUrl;
    }

    const candidateProjectId = extractProjectId(path);
    // Le projet n'est retenu que s'il existe réellement : un identifiant
    // extrait par erreur ne doit pas rendre le fichier inaccessible.
    const projectId = candidateProjectId
        ? (await prisma.project.findUnique({ where: { id: candidateProjectId }, select: { id: true } }))?.id ?? null
        : null;

    const stored = await prisma.storedFile.create({
        data: {
            name: path,
            mimeType: contentType || "application/octet-stream",
            size: body.byteLength,
            data: new Uint8Array(body),
            projectId,
        },
        select: { id: true },
    });

    // URL interne servie par la route protégée (session requise).
    return `/api/files/${stored.id}?name=${encodeURIComponent(basename(path))}`;
}

export async function deleteFileFromStorage(bucket: string, path: string): Promise<void> {
    if (isSupabaseConfigured()) {
        const supabaseAdmin = getAdminClient();
        const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
        if (error) throw error;
        return;
    }

    await prisma.storedFile.deleteMany({ where: { name: path } });
}

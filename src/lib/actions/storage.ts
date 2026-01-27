"use server";

import { uploadFileToStorage } from "@/lib/storage";

export async function uploadFileAction(formData: FormData) {
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string || "project-assets";

    if (!file) throw new Error("Aucun fichier fourni");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const path = `requirements/attachments/${fileName}`;

    try {
        const url = await uploadFileToStorage(bucket, path, buffer, file.type);
        return { url };
    } catch (error) {
        console.error("Upload error:", error);
        throw new Error("L'upload a échoué");
    }
}

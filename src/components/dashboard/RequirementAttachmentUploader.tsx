"use client";

import { useState } from "react";
import { Paperclip, Loader2, X } from "lucide-react";
import { uploadFileAction } from "@/lib/actions/storage";
import { toast } from "sonner";

interface RequirementAttachmentUploaderProps {
    onUploadSuccess: (url: string) => void;
}

export function RequirementAttachmentUploader({ onUploadSuccess }: RequirementAttachmentUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation simple
        if (file.size > 10 * 1024 * 1024) {
            toast.error("Le fichier est trop volumineux (max 10MB)");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("bucket", "project-assets");

            const result = await uploadFileAction(formData);

            if (result.url) {
                onUploadSuccess(result.url);
                toast.success("Fichier prêt !");
            }
        } catch (error) {
            console.error("Upload UI Error:", error);
            toast.error("L'upload a échoué");
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    return (
        <div className="relative">
            <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-primary/20 transition-all cursor-pointer group">
                {isUploading ? (
                    <Loader2 size={12} className="animate-spin text-primary" />
                ) : (
                    <Paperclip size={12} className="text-secondary/40 group-hover:text-primary transition-colors" />
                )}
                <span className="text-[8px] font-black text-secondary/30 group-hover:text-primary transition-colors uppercase tracking-widest">
                    {isUploading ? "UPLOADING..." : "JOINDRE_FICHIER"}
                </span>
                <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </label>
        </div>
    );
}

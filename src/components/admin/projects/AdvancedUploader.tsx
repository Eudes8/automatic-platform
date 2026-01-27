"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, File, Image as ImageIcon, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createProjectAsset } from "@/lib/actions/adminProjectOps";
import { toast } from "sonner";

interface AdvancedUploaderProps {
    projectId: string;
    onSuccess?: () => void;
}

interface UploadFile {
    file: File;
    preview?: string;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    pdf: ['application/pdf'],
    code: ['application/zip', 'application/x-zip-compressed'],
};

export default function AdvancedUploader({ projectId, onSuccess }: AdvancedUploaderProps) {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        // Check size
        if (file.size > MAX_FILE_SIZE) {
            return `Le fichier est trop volumineux (max 50MB)`;
        }

        // Check type
        const allAllowedTypes = [...ALLOWED_TYPES.image, ...ALLOWED_TYPES.pdf, ...ALLOWED_TYPES.code];
        if (!allAllowedTypes.includes(file.type)) {
            return `Type de fichier non supporté`;
        }

        return null;
    };

    const getFileType = (file: File): 'image' | 'pdf' | 'code' | 'web' => {
        if (ALLOWED_TYPES.image.includes(file.type)) return 'image';
        if (ALLOWED_TYPES.pdf.includes(file.type)) return 'pdf';
        if (ALLOWED_TYPES.code.includes(file.type)) return 'code';
        return 'web';
    };

    const handleFiles = useCallback(async (fileList: FileList | null) => {
        if (!fileList) return;

        const newFiles: UploadFile[] = [];

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const error = validateFile(file);

            if (error) {
                toast.error(`${file.name}: ${error}`);
                continue;
            }

            // Create preview for images
            let preview: string | undefined;
            if (file.type.startsWith('image/')) {
                preview = URL.createObjectURL(file);
            }

            newFiles.push({
                file,
                preview,
                progress: 0,
                status: 'pending'
            });
        }

        setFiles(prev => [...prev, ...newFiles]);
    }, []);

    const uploadFile = async (uploadFile: UploadFile, index: number) => {
        setFiles(prev => prev.map((f, i) =>
            i === index ? { ...f, status: 'uploading' as const } : f
        ));

        const formData = new FormData();
        formData.append("projectId", projectId);
        formData.append("name", uploadFile.file.name);
        formData.append("type", getFileType(uploadFile.file));
        formData.append("file", uploadFile.file);

        try {
            // Simulate progress (real progress would need XMLHttpRequest)
            const progressInterval = setInterval(() => {
                setFiles(prev => prev.map((f, i) => {
                    if (i === index && f.progress < 90) {
                        return { ...f, progress: f.progress + 10 };
                    }
                    return f;
                }));
            }, 200);

            const result = await createProjectAsset(formData);

            clearInterval(progressInterval);

            if (result.success) {
                setFiles(prev => prev.map((f, i) =>
                    i === index ? { ...f, status: 'success' as const, progress: 100 } : f
                ));
                toast.success(`${uploadFile.file.name} uploadé avec succès`, {
                    icon: <CheckCircle2 className="text-emerald-500" />
                });

                // Remove file after 2 seconds
                setTimeout(() => {
                    setFiles(prev => prev.filter((_, i) => i !== index));
                    onSuccess?.();
                }, 2000);
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error: any) {
            setFiles(prev => prev.map((f, i) =>
                i === index ? {
                    ...f,
                    status: 'error' as const,
                    error: error.message || 'Erreur inconnue',
                    progress: 0
                } : f
            ));
            toast.error(`Erreur: ${uploadFile.file.name}`, {
                description: error.message,
                icon: <AlertCircle className="text-rose-500" />
            });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const removeFile = (index: number) => {
        setFiles(prev => {
            const file = prev[index];
            if (file.preview) {
                URL.revokeObjectURL(file.preview);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const uploadAll = async () => {
        const pendingFiles = files.filter(f => f.status === 'pending');

        for (let i = 0; i < files.length; i++) {
            if (files[i].status === 'pending') {
                await uploadFile(files[i], i);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer
                    transition-all duration-300 group
                    ${isDragging
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
                    }
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    accept="image/*,.pdf,.zip"
                />

                <div className="space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-10 h-10 text-primary" />
                    </div>

                    <div>
                        <p className="text-lg font-black text-primary uppercase italic tracking-tight">
                            {isDragging ? "Déposez vos fichiers ici" : "Glissez-déposez ou cliquez"}
                        </p>
                        <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest mt-2">
                            Images, PDF, ZIP - Max 50MB par fichier
                        </p>
                    </div>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.4em] italic">
                            // FICHIERS_EN_ATTENTE ({files.length})
                        </h4>
                        {files.some(f => f.status === 'pending') && (
                            <button
                                onClick={uploadAll}
                                className="px-6 py-2 bg-primary text-background text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform italic"
                            >
                                Uploader Tout
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="relative p-6 bg-white border border-border/50 rounded-2xl group hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Preview/Icon */}
                                    <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                                        {file.preview ? (
                                            <img src={file.preview} alt={file.file.name} className="w-full h-full object-cover" />
                                        ) : file.file.type === 'application/pdf' ? (
                                            <FileText className="w-8 h-8 text-rose-500" />
                                        ) : (
                                            <File className="w-8 h-8 text-primary" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-primary uppercase italic tracking-tight truncate">
                                            {file.file.name}
                                        </p>
                                        <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest mt-1">
                                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>

                                        {/* Progress Bar */}
                                        {file.status === 'uploading' && (
                                            <div className="mt-3">
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-300"
                                                        style={{ width: `${file.progress}%` }}
                                                    />
                                                </div>
                                                <p className="text-[8px] font-black text-primary uppercase tracking-widest mt-1 italic">
                                                    {file.progress}%
                                                </p>
                                            </div>
                                        )}

                                        {/* Error */}
                                        {file.status === 'error' && (
                                            <p className="text-[9px] font-bold text-rose-500 mt-2 italic">
                                                {file.error}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status Icon */}
                                    <div className="shrink-0">
                                        {file.status === 'pending' && (
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                        {file.status === 'uploading' && (
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        )}
                                        {file.status === 'success' && (
                                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                        )}
                                        {file.status === 'error' && (
                                            <button
                                                onClick={() => uploadFile(file, index)}
                                                className="w-8 h-8 rounded-lg bg-rose-100 text-rose-500 flex items-center justify-center hover:bg-rose-200 transition-colors"
                                            >
                                                <AlertCircle size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

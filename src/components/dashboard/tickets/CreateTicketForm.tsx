"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Send } from "lucide-react";
import { TicketPriority } from "@prisma/client";
import { Project } from "@prisma/client";

interface CreateTicketFormProps {
    projects: Project[];
    onCreateTicket: (formData: FormData) => Promise<{ success: boolean; ticket?: any }>;
}

export function CreateTicketForm({ projects, onCreateTicket }: CreateTicketFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await onCreateTicket(formData);
            if (result.success) {
                setIsOpen(false);
                router.refresh();
            }
        });
    };

    if (!isOpen) {
        return (
            <Card>
                <CardContent className="p-6">
                    <Button onClick={() => setIsOpen(true)} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Créer un nouveau ticket
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nouveau ticket de support</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-1">
                            Titre du ticket *
                        </label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Décrivez brièvement votre problème"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">
                            Description détaillée *
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Expliquez votre problème en détail..."
                            rows={4}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium mb-1">
                                Priorité
                            </label>
                            <Select name="priority" defaultValue="MEDIUM">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Faible</SelectItem>
                                    <SelectItem value="MEDIUM">Moyen</SelectItem>
                                    <SelectItem value="HIGH">Élevé</SelectItem>
                                    <SelectItem value="URGENT">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label htmlFor="projectId" className="block text-sm font-medium mb-1">
                                Projet concerné (optionnel)
                            </label>
                            <select
                                name="projectId"
                                className="flex h-11 w-full rounded-xl border border-subtle bg-gradient-card px-4 py-3 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:border-premium disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-card hover:shadow-interactive focus:shadow-interactive"
                            >
                                <option value="">Aucun projet</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={isPending}>
                            <Send className="h-4 w-4 mr-2" />
                            {isPending ? "Création..." : "Créer le ticket"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isPending}
                        >
                            Annuler
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
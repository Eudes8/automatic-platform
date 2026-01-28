"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/input";
import { ArrowLeft, User, Clock, MessageSquare, Send, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Ticket, TicketResponse, TicketStatus, TicketPriority, User as UserType } from "@prisma/client";

interface TicketDetailProps {
    ticket: Ticket & {
        client: { name: string | null; email: string };
        assignedTo?: { name: string | null } | null;
        project?: { title: string } | null;
        responses: (TicketResponse & { author: { name: string | null; role: string } })[];
    };
    users: UserType[];
    onUpdateStatus: (ticketId: string, status: TicketStatus) => Promise<{ success: boolean }>;
    onAssign: (ticketId: string, assignedToId: string) => Promise<{ success: boolean }>;
    onAddResponse: (ticketId: string, message: string, isInternal: boolean) => Promise<{ success: boolean; response?: TicketResponse }>;
}

function getStatusBadge(status: TicketStatus) {
    const variants = {
        OPEN: "bg-blue-100 text-blue-800",
        IN_PROGRESS: "bg-yellow-100 text-yellow-800",
        CLOSED: "bg-green-100 text-green-800",
        RESOLVED: "bg-purple-100 text-purple-800"
    };

    return (
        <Badge className={variants[status]}>
            {status === "OPEN" ? "Ouvert" :
             status === "IN_PROGRESS" ? "En cours" :
             status === "CLOSED" ? "Fermé" : "Résolu"}
        </Badge>
    );
}

function getPriorityBadge(priority: TicketPriority) {
    const variants = {
        LOW: "bg-gray-100 text-gray-800",
        MEDIUM: "bg-orange-100 text-orange-800",
        HIGH: "bg-red-100 text-red-800",
        URGENT: "bg-red-500 text-white"
    };

    return (
        <Badge className={variants[priority]}>
            {priority === "LOW" ? "Faible" :
             priority === "MEDIUM" ? "Moyen" :
             priority === "HIGH" ? "Élevé" : "Urgent"}
        </Badge>
    );
}

export function TicketDetail({ ticket, users, onUpdateStatus, onAssign, onAddResponse }: TicketDetailProps) {
    const [status, setStatus] = useState(ticket.status);
    const [assignedToId, setAssignedToId] = useState(ticket.assignedToId || "");
    const [responseMessage, setResponseMessage] = useState("");
    const [isInternal, setIsInternal] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleStatusChange = async (newStatus: TicketStatus) => {
        startTransition(async () => {
            const result = await onUpdateStatus(ticket.id, newStatus);
            if (result.success) {
                setStatus(newStatus);
            }
        });
    };

    const handleAssign = async (userId: string) => {
        startTransition(async () => {
            const result = await onAssign(ticket.id, userId);
            if (result.success) {
                setAssignedToId(userId);
            }
        });
    };

    const handleAddResponse = async () => {
        if (!responseMessage.trim()) return;

        startTransition(async () => {
            const result = await onAddResponse(ticket.id, responseMessage, isInternal);
            if (result.success) {
                setResponseMessage("");
                setIsInternal(false);
                // Refresh the page to show new response
                window.location.reload();
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/tickets">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour aux tickets
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">{ticket.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ticket Info */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Détails du ticket</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                {getStatusBadge(status)}
                                {getPriorityBadge(ticket.priority)}
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Créé le:</span>{" "}
                                    {format(new Date(ticket.createdAt), "dd/MM/yyyy à HH:mm", { locale: fr })}
                                </div>
                                <div>
                                    <span className="font-medium">Dernière mise à jour:</span>{" "}
                                    {format(new Date(ticket.updatedAt), "dd/MM/yyyy à HH:mm", { locale: fr })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Responses */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Réponses ({ticket.responses.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {ticket.responses.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                    Aucune réponse pour le moment
                                </p>
                            ) : (
                                ticket.responses.map((response) => (
                                    <div key={response.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span className="font-medium">{response.author.name}</span>
                                                {response.author.role === "ADMIN" && (
                                                    <Badge variant="secondary">Admin</Badge>
                                                )}
                                                {response.isInternal && (
                                                    <Badge variant="outline" className="text-orange-600">
                                                        <EyeOff className="h-3 w-3 mr-1" />
                                                        Interne
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(response.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                                            </div>
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-wrap">{response.message}</p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Add Response */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ajouter une réponse</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Tapez votre réponse..."
                                value={responseMessage}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponseMessage(e.target.value)}
                                rows={4}
                            />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="internal"
                                        checked={isInternal}
                                        onChange={(e) => setIsInternal(e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="internal" className="text-sm flex items-center gap-1">
                                        <EyeOff className="h-3 w-3" />
                                        Réponse interne (visible uniquement par les admins)
                                    </label>
                                </div>

                                <Button
                                    onClick={handleAddResponse}
                                    disabled={!responseMessage.trim() || isPending}
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Envoyer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations client</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <span className="font-medium">Nom:</span> {ticket.client.name}
                            </div>
                            <div>
                                <span className="font-medium">Email:</span> {ticket.client.email}
                            </div>
                            {ticket.project && (
                                <div>
                                    <span className="font-medium">Project:</span> {ticket.project.title}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Gestion du ticket</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Statut</label>
                                <select
                                    value={status}
                                    onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                                    disabled={isPending}
                                    className="flex h-11 w-full rounded-xl border border-subtle bg-gradient-card px-4 py-3 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:border-premium disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-card hover:shadow-interactive focus:shadow-interactive"
                                >
                                    <option value="OPEN">Ouvert</option>
                                    <option value="IN_PROGRESS">En cours</option>
                                    <option value="CLOSED">Fermé</option>
                                    <option value="RESOLVED">Résolu</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Assigner à</label>
                                <select
                                    value={assignedToId}
                                    onChange={(e) => handleAssign(e.target.value)}
                                    disabled={isPending}
                                    className="flex h-11 w-full rounded-xl border border-subtle bg-gradient-card px-4 py-3 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:border-premium disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-card hover:shadow-interactive focus:shadow-interactive"
                                >
                                    <option value="">Non assigné</option>
                                    {users.filter(u => u.role === "ADMIN").map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
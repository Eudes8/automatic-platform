"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { ArrowLeft, Clock, MessageSquare, Send } from "lucide-react";
import Link from "next/link";
import { Ticket, TicketResponse, TicketStatus, TicketPriority } from "@prisma/client";

interface ClientTicketDetailProps {
    ticket: Ticket & {
        assignedTo?: { name: string | null } | null;
        project?: { title: string } | null;
        responses: (TicketResponse & { author: { name: string | null; role: string } })[];
    };
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

export function ClientTicketDetail({ ticket, onAddResponse }: ClientTicketDetailProps) {
    const [responseMessage, setResponseMessage] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleAddResponse = async () => {
        if (!responseMessage.trim()) return;

        startTransition(async () => {
            const result = await onAddResponse(ticket.id, responseMessage, false);
            if (result.success) {
                setResponseMessage("");
                // Refresh the page to show new response
                window.location.reload();
            }
        });
    };

    const canRespond = ticket.status !== "CLOSED";

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/tickets">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour à mes tickets
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
                                {getStatusBadge(ticket.status)}
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

                            {ticket.project && (
                                <div>
                                    <span className="font-medium">Projet concerné:</span> {ticket.project.title}
                                </div>
                            )}

                            {ticket.assignedTo && (
                                <div>
                                    <span className="font-medium">Assigné à:</span> {ticket.assignedTo.name}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Responses */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Conversation ({ticket.responses.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {ticket.responses.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                    Aucune réponse pour le moment. Notre équipe vous répondra bientôt.
                                </p>
                            ) : (
                                ticket.responses.map((response) => (
                                    <div key={response.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{response.author.name}</span>
                                                {response.author.role === "ADMIN" && (
                                                    <Badge variant="secondary">Support</Badge>
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
                    {canRespond && (
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

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleAddResponse}
                                        disabled={!responseMessage.trim() || isPending}
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        {isPending ? "Envoi..." : "Envoyer"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {ticket.status === "CLOSED" && (
                        <Card>
                            <CardContent className="p-4 text-center text-gray-500">
                                <p>Ce ticket est fermé. Si vous avez besoin d'aide supplémentaire, créez un nouveau ticket.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Statut du ticket</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(ticket.status)}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {ticket.status === "OPEN" && "Votre ticket est ouvert et sera traité bientôt."}
                                    {ticket.status === "IN_PROGRESS" && "Notre équipe travaille sur votre ticket."}
                                    {ticket.status === "CLOSED" && "Ce ticket a été fermé."}
                                    {ticket.status === "RESOLVED" && "Ce ticket a été résolu."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informations utiles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-gray-600">
                            <p>• Notre équipe s'efforce de répondre dans les 24 heures</p>
                            <p>• Les tickets urgents sont prioritaires</p>
                            <p>• Vous recevrez une notification à chaque réponse</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
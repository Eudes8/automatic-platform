"use client";

import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Clock, ArrowRight } from "lucide-react";
import { Ticket, TicketStatus, TicketPriority } from "@prisma/client";

interface ClientTicketListProps {
    tickets: (Ticket & {
        assignedTo?: { name: string | null } | null;
        project?: { title: string } | null;
        responses: { id: string }[];
    })[];
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

export function ClientTicketList({ tickets }: ClientTicketListProps) {
    if (tickets.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun ticket de support
                    </h3>
                    <p className="text-gray-500">
                        Vous n'avez pas encore créé de ticket de support. Utilisez le formulaire ci-dessus pour créer votre premier ticket.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Mes tickets ({tickets.length})</h2>

            <div className="space-y-3">
                {tickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Link
                                            href={`/dashboard/tickets/${ticket.id}`}
                                            className="text-lg font-semibold hover:text-blue-600 transition-colors"
                                        >
                                            {ticket.title}
                                        </Link>
                                        {getStatusBadge(ticket.status)}
                                        {getPriorityBadge(ticket.priority)}
                                    </div>

                                    <p className="text-gray-600 mb-3 line-clamp-2">
                                        {ticket.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        {ticket.assignedTo && (
                                            <div>
                                                Assigné à: {ticket.assignedTo.name}
                                            </div>
                                        )}

                                        {ticket.project && (
                                            <div>
                                                Projet: {ticket.project.title}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-1">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>{ticket.responses.length} réponses</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                {format(new Date(ticket.createdAt), "dd/MM/yyyy", { locale: fr })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={`/dashboard/tickets/${ticket.id}`}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, MessageSquare, User, Clock } from "lucide-react";
import { Ticket, TicketStatus, TicketPriority } from "@prisma/client";

interface TicketListProps {
    tickets: (Ticket & {
        client: { name: string | null; email: string };
        assignedTo?: { name: string | null } | null;
        project?: { title: string } | null;
        responses: { id: string }[];
    })[];
    currentPage: number;
    totalPages: number;
    total: number;
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

export function TicketList({ tickets, currentPage, totalPages, total }: TicketListProps) {
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const filteredTickets = statusFilter === "ALL"
        ? tickets
        : tickets.filter(ticket => ticket.status === statusFilter);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">Tous les tickets ({total})</h2>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-subtle bg-gradient-card px-4 py-3 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:border-premium disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-card hover:shadow-interactive focus:shadow-interactive"
                    >
                        <option value="ALL">Tous</option>
                        <option value="OPEN">Ouverts</option>
                        <option value="IN_PROGRESS">En cours</option>
                        <option value="CLOSED">Fermés</option>
                        <option value="RESOLVED">Résolus</option>
                    </select>
                </div>
            </div>

            <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Link
                                            href={`/admin/tickets/${ticket.id}`}
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
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            <span>{ticket.client.name}</span>
                                        </div>

                                        {ticket.assignedTo && (
                                            <div className="flex items-center gap-1">
                                                <span>Assigné à: {ticket.assignedTo.name}</span>
                                            </div>
                                        )}

                                        {ticket.project && (
                                            <div className="flex items-center gap-1">
                                                <span>Projet: {ticket.project.title}</span>
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
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Page {currentPage} sur {totalPages}
                    </div>
                    <div className="flex gap-2">
                        {currentPage > 1 ? (
                            <Link href={`/admin/tickets?page=${currentPage - 1}`}>
                                <Button variant="outline" size="sm">
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Précédent
                                </Button>
                            </Link>
                        ) : (
                            <Button variant="outline" size="sm" disabled>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Précédent
                            </Button>
                        )}

                        {currentPage < totalPages ? (
                            <Link href={`/admin/tickets?page=${currentPage + 1}`}>
                                <Button variant="outline" size="sm">
                                    Suivant
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        ) : (
                            <Button variant="outline" size="sm" disabled>
                                Suivant
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
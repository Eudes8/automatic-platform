"use client";

import { useEffect } from "react";
import { getRealtimeClient } from "@/lib/supabase-browser";

/**
 * Abonnement temps réel aux exigences (cahier des charges) d'un projet.
 * Sans Supabase configuré, le hook ne fait rien : les vues se rafraîchissent
 * via les revalidations serveur classiques.
 */
export function useRequirementsRealtime(projectId: string, onUpdate: () => void) {
    useEffect(() => {
        if (!projectId) return;

        const client = getRealtimeClient();
        if (!client) return;

        const channel = client
            .channel(`requirements-${projectId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "Requirement",
                    filter: `projectId=eq.${projectId}`,
                },
                () => onUpdate()
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "RequirementComment",
                },
                () => onUpdate()
            )
            .subscribe();

        return () => {
            client.removeChannel(channel);
        };
    }, [projectId, onUpdate]);
}

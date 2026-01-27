"use client";

import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useRequirementsRealtime(projectId: string, onUpdate: () => void) {
    useEffect(() => {
        if (!projectId) return;

        const channel = supabase
            .channel(`requirements-${projectId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Requirement',
                    filter: `projectId=eq.${projectId}`
                },
                () => {
                    onUpdate();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'RequirementComment'
                },
                () => {
                    // This might need more filtering but for now it's okay to refetch on any comment 
                    // if we don't have a direct projectId on the comment table (we have requirementId).
                    onUpdate();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [projectId, onUpdate]);
}

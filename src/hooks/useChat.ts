"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getOrCreateConversation, sendMessage as sendMessageAction } from '@/lib/actions/chat';

export function useChat(projectId?: string) {
    const [messages, setMessages] = useState<any[]>([]);
    const [conversation, setConversation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen && !projectId) return; // Don't load global chat until opened

        let channel: any;

        const init = async () => {
            try {
                const conv = await getOrCreateConversation(projectId);
                setConversation(conv);
                setMessages(conv.messages || []);

                // Subscribe to new messages for this conversation
                channel = supabase
                    .channel(`chat:${conv.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'Message',
                            filter: `conversationId=eq.${conv.id}`
                        },
                        async (payload) => {
                            const newMessage = payload.new;
                            // Check if message already exists (e.g. sent by us optimistically or confirmed)
                            setMessages((prev) => {
                                if (prev.find(m => m.id === newMessage.id)) return prev;
                                return [...prev, newMessage];
                            });
                        }
                    )
                    .subscribe();

            } catch (e) {
                console.error("Error initializing chat:", e);
            } finally {
                setLoading(false);
            }
        };

        init();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [projectId, isOpen]);

    const sendMessage = async (text: string) => {
        if (!conversation) return;

        try {
            const savedMessage = await sendMessageAction(conversation.id, text);
            setMessages((prev) => {
                if (prev.find(m => m.id === savedMessage.id)) return prev;
                return [...prev, savedMessage];
            });
            return savedMessage;
        } catch (e) {
            console.error("Failed to send message", e);
            throw e;
        }
    };

    return {
        messages,
        conversation,
        sendMessage,
        loading,
        isOpen,
        setIsOpen
    };
}

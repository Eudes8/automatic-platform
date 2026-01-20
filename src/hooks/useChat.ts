"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getOrCreateConversation, sendMessage as sendMessageAction } from '@/lib/actions/chat';

interface Message {
    id: string;
    text: string;
    senderId: string;
    sender?: { name: string | null; role: string };
    createdAt: string;
    read: boolean;
    attachment?: string;
    status?: 'sending' | 'sent' | 'delivered' | 'read'; // Optimistic UI
    error?: string;
}

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

// Fonction pour formater les messages reçus de l'API
const formatMessage = (msg: any): Message => ({
    id: msg.id,
    text: msg.text,
    senderId: msg.senderId,
    sender: msg.sender ? {
        name: msg.sender.name || null,
        role: msg.sender.role
    } : undefined,
    createdAt: typeof msg.createdAt === 'string' ? msg.createdAt : msg.createdAt.toISOString(),
    read: msg.read || false,
    attachment: msg.attachment,
    status: 'delivered' as const
});

export function useChat(projectId?: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const isSubscribedRef = useRef(true);
    const pendingMessagesRef = useRef(new Map());

    // Mark messages as read
    const markMessagesAsRead = async () => {
        if (!conversation) return;

        const unreadIds = messages
            .filter(m => !m.read && m.senderId !== conversation.currentUserId)
            .map(m => m.id);

        if (unreadIds.length === 0) return;

        try {
            // Call API to mark as read
            await fetch('/api/chat/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageIds: unreadIds })
            });

            // Update local state
            setMessages(prev => prev.map(m =>
                unreadIds.includes(m.id) ? { ...m, read: true, status: 'read' } : m
            ));
        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
    };

    // Retry sending failed message
    const retrySendMessage = async (tempId: string, text: string) => {
        for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
            try {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                const savedMessage = await sendMessageAction(conversation.id, text);
                const formattedMessage = formatMessage(savedMessage);

                setMessages(prev => prev.map(m =>
                    m.id === tempId
                        ? { ...formattedMessage, status: 'delivered' as const }
                        : m
                ));
                pendingMessagesRef.current.delete(tempId);
                return;
            } catch (e) {
                if (attempt === RETRY_ATTEMPTS - 1) {
                    setMessages(prev => prev.map(m =>
                        m.id === tempId
                            ? { ...m, status: 'sent', error: 'Failed to send' }
                            : m
                    ));
                }
            }
        }
    };

    // Refresh messages fonction
    const refreshMessages = async (convId?: string) => {
        try {
            const conv = await getOrCreateConversation(projectId);
            if (isSubscribedRef.current) {
                const formattedMessages: Message[] = (conv.messages || []).map((m: any) => ({
                    id: m.id,
                    text: m.text,
                    senderId: m.senderId,
                    sender: m.sender,
                    createdAt: m.createdAt,
                    read: m.read || false,
                    attachment: m.attachment,
                    status: 'delivered' as const
                }));
                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error("Error refreshing messages:", error);
        }
    };

    useEffect(() => {
        if (!isOpen && !projectId) return;

        let channel: any;
        let updateChannel: any;
        isSubscribedRef.current = true;

        const init = async () => {
            try {
                const conv = await getOrCreateConversation(projectId);
                setConversation(conv);

                const formattedMessages: Message[] = (conv.messages || []).map((m: any) => ({
                    id: m.id,
                    text: m.text,
                    senderId: m.senderId,
                    sender: m.sender,
                    createdAt: m.createdAt,
                    read: m.read || false,
                    attachment: m.attachment,
                    status: 'delivered' as const
                }));
                setMessages(formattedMessages);

                // Subscribe to new messages
                channel = supabase
                    .channel(`chat-global-resilient:${conv.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'Message'
                            // No strict filter here, we filter in JS for maximum reliability
                        },
                        async (payload) => {
                            if (!isSubscribedRef.current) return;

                            // Check if message belongs to this conversation OR this project
                            const isMatch = payload.new.conversationId === conv.id ||
                                (projectId && payload.new.projectId === projectId);

                            if (!isMatch) return;

                            console.log('Chat [Client]: Valid message received in realtime:', payload.new);

                            try {
                                // Fetch extra info (sender)
                                const { data: newMessage, error } = await supabase
                                    .from('Message')
                                    .select('*, sender:User(*)')
                                    .eq('id', payload.new.id)
                                    .single();

                                const messageToDisplay = (newMessage && !error) ? newMessage : payload.new;

                                const formattedMessage: Message = {
                                    id: messageToDisplay.id,
                                    text: messageToDisplay.text,
                                    senderId: messageToDisplay.senderId,
                                    sender: messageToDisplay.sender ? (Array.isArray(messageToDisplay.sender) ? messageToDisplay.sender[0] : messageToDisplay.sender) : undefined,
                                    createdAt: messageToDisplay.createdAt,
                                    read: messageToDisplay.read || false,
                                    attachment: messageToDisplay.attachment,
                                    status: 'delivered'
                                };

                                setMessages((prev) => {
                                    if (prev.find(m => m.id === formattedMessage.id)) return prev;
                                    return [...prev, formattedMessage];
                                });
                            } catch (err) {
                                console.error('Chat [Client]: Error processing realtime:', err);
                            }
                        }
                    )
                    .subscribe((status) => {
                        console.log(`Chat [Client]: Realtime status:`, status);
                        setIsConnected(status === 'SUBSCRIBED');
                    });

                // Subscribe to message updates (read status)
                updateChannel = supabase
                    .channel(`chat-updates:${conv.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'Message',
                            filter: `conversationId=eq.${conv.id}`
                        },
                        (payload) => {
                            if (!isSubscribedRef.current) return;

                            setMessages(prev => prev.map(m =>
                                m.id === payload.new.id
                                    ? { ...m, read: payload.new.read, status: 'read' as const }
                                    : m
                            ));
                        }
                    )
                    .subscribe();

            } catch (e) {
                console.error("Error initializing chat:", e);
                setIsConnected(false);
            } finally {
                setLoading(false);
            }
        };

        init();

        // 1s Polling Fallback as requested
        const pollingInterval = setInterval(() => {
            if (isOpen || projectId) {
                refreshMessages();
            }
        }, 1000);

        return () => {
            isSubscribedRef.current = false;
            if (channel) supabase.removeChannel(channel);
            if (updateChannel) supabase.removeChannel(updateChannel);
            clearInterval(pollingInterval);
        };
    }, [projectId, isOpen]);

    // Mark as read when messages are viewed
    useEffect(() => {
        if (isOpen && messages.length > 0) {
            const timer = setTimeout(markMessagesAsRead, 1000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, messages]);

    const sendMessage = async (text: string) => {
        if (!conversation) return;

        const tempId = `temp-${Date.now()}`;

        // Optimistic UI: add message immediately with sending status
        const optimisticMessage: Message = {
            id: tempId,
            text,
            senderId: conversation.currentUserId,
            createdAt: new Date().toISOString(),
            read: false,
            status: 'sending'
        };

        setMessages(prev => [...prev, optimisticMessage]);
        pendingMessagesRef.current.set(tempId, text);

        try {
            const savedMessage = await sendMessageAction(conversation.id, text);
            const formattedMessage = formatMessage(savedMessage);

            setMessages(prev => prev.map(m =>
                m.id === tempId ? formattedMessage : m
            ));
            pendingMessagesRef.current.delete(tempId);
            return formattedMessage;
        } catch (e) {
            console.error("Failed to send message", e);

            // Update message with error status
            setMessages(prev => prev.map(m =>
                m.id === tempId
                    ? { ...m, status: 'sent' as const, error: 'Failed to send' }
                    : m
            ));

            // Retry
            retrySendMessage(tempId, text);
            throw e;
        }
    };

    return {
        messages,
        conversation,
        sendMessage,
        loading,
        isOpen,
        setIsOpen,
        refreshMessages,
        isConnected,
        typingUsers,
        markMessagesAsRead
    };
}

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

export type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_pinned?: boolean;
  is_archived?: boolean;
};

export const useConversations = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const { toast } = useToast();

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    
    setIsLoadingConversations(true);
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [userId]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(
        (data || []).map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          created_at: m.created_at,
        }))
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async () => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert({ user_id: userId })
        .select()
        .single();

      if (error) throw error;
      
      setConversations((prev) => [data, ...prev]);
      setCurrentConversationId(data.id);
      setMessages([]);
      return data.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive",
      });
      return null;
    }
  }, [userId, toast]);

  // Save a message
  const saveMessage = useCallback(
    async (conversationId: string, role: "user" | "assistant", content: string) => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            role,
            content,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error saving message:", error);
        return null;
      }
    },
    []
  );

  // Delete a conversation
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        const { error } = await supabase
          .from("conversations")
          .delete()
          .eq("id", conversationId);

        if (error) throw error;

        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        
        if (currentConversationId === conversationId) {
          setCurrentConversationId(null);
          setMessages([]);
        }

        toast({
          title: "Deleted",
          description: "Conversation removed",
        });
      } catch (error) {
        console.error("Error deleting conversation:", error);
        toast({
          title: "Error",
          description: "Failed to delete conversation",
          variant: "destructive",
        });
      }
    },
    [currentConversationId, toast]
  );

  // Delete all conversations
  const deleteAllConversations = useCallback(
    async () => {
      try {
        const { error } = await supabase
          .from("conversations")
          .delete()
          .neq("id", "");

        if (error) throw error;

        setConversations([]);
        setCurrentConversationId(null);
        setMessages([]);

        toast({
          title: "Deleted",
          description: "All conversations have been removed",
        });
      } catch (error) {
        console.error("Error deleting all conversations:", error);
        toast({
          title: "Error",
          description: "Failed to delete conversations",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Toggle pin status
  const togglePinConversation = useCallback(async (conversationId: string, isPinned: boolean) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ is_pinned: !isPinned })
        .eq("id", conversationId);

      if (error) throw error;

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, is_pinned: !isPinned } : c
        )
      );
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  }, []);

  // Toggle archive status
  const toggleArchiveConversation = useCallback(async (conversationId: string, isArchived: boolean) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ is_archived: !isArchived })
        .eq("id", conversationId);

      if (error) throw error;

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, is_archived: !isArchived } : c
        )
      );
      
      if (!isArchived && currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error toggling archive:", error);
    }
  }, [currentConversationId]);

  // Select a conversation
  const selectConversation = useCallback(
    async (conversationId: string) => {
      setCurrentConversationId(conversationId);
      await fetchMessages(conversationId);
    },
    [fetchMessages]
  );

  // Start new chat
  const startNewChat = useCallback(() => {
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  // Update local messages
  const addLocalMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant") {
        return prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, content } : m
        );
      }
      return [...prev, { role: "assistant" as const, content }];
    });
  }, []);

  // Refresh conversation list after message
  const refreshConversations = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId, fetchConversations]);

  return {
    conversations,
    currentConversationId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    createConversation,
    saveMessage,
    deleteConversation,
    deleteAllConversations,
    selectConversation,
    startNewChat,
    addLocalMessage,
    updateLastMessage,
    refreshConversations,
    setCurrentConversationId,
    togglePinConversation,
    toggleArchiveConversation,
  };
};

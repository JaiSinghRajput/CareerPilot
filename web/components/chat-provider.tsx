"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiRequest } from "@/lib/api";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface Chat {
  id: number;
  title: string | null;
  updatedAt: string;
}

interface ChatContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadingText: string;
  setLoadingText: React.Dispatch<React.SetStateAction<string>>;
  chatId: number | null;
  setChatId: React.Dispatch<React.SetStateAction<number | null>>;
  isInitializing: boolean;
  chatsList: Chat[];
  loadChatsList: () => Promise<void>;
  loadChat: (targetChatId?: number) => Promise<void>;
  createNewChat: () => void;
  deleteChat: (e: React.MouseEvent, idToDelete: number) => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing...");
  const [chatId, setChatId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [chatsList, setChatsList] = useState<Chat[]>([]);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const loadChatsList = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await apiRequest("/api/v1/ai/chats", token);
      if (res.success && res.data) {
        setChatsList(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadChat = async (targetChatId?: number) => {
    setIsInitializing(true);
    try {
      const token = await getToken();
      if (!token) return;
      const url = targetChatId ? `/api/v1/ai/chat-history?chatId=${targetChatId}` : "/api/v1/ai/chat-history";
      const result = await apiRequest(url, token);
      if (result.success && result.data && result.data.chat) {
        const { chat, messages: dbMessages } = result.data;
        setChatId(chat.id);
        if (dbMessages && dbMessages.length > 0) {
          const formattedMessages = dbMessages.map((msg: any) => ({
            id: msg.id.toString(),
            role: msg.role,
            content: msg.content || ""
          }));
          setMessages(formattedMessages);
        } else {
          setMessages([]);
        }
      } else {
        setChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        loadChatsList();
        loadChat();
      } else {
        setIsInitializing(false);
      }
    }
  }, [isLoaded, isSignedIn, getToken]);

  const createNewChat = () => {
    setChatId(null);
    setMessages([]);
  };

  const deleteChat = async (e: React.MouseEvent, idToDelete: number) => {
    e.stopPropagation();
    try {
      const token = await getToken();
      if (!token) return;
      await apiRequest(`/api/v1/ai/chats/${idToDelete}`, token, { method: "DELETE" });
      setChatsList(prev => prev.filter(c => c.id !== idToDelete));
      if (chatId === idToDelete) {
        createNewChat();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };

    let newLoadingText = "Analyzing...";
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("job") || lowerInput.includes("work") || lowerInput.includes("hire")) {
      newLoadingText = "Collecting Job Data...";
    } else if (lowerInput.includes("project")) {
      newLoadingText = "Finding Projects...";
    } else if (lowerInput.includes("resume") || lowerInput.includes("cv")) {
      newLoadingText = "Reviewing Resume...";
    }
    setLoadingText(newLoadingText);

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const data = await apiRequest("/api/v1/ai/chat", token, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userMessage.content, chatId }),
      });

      if (data.data?.chatId) {
        if (!chatId) {
          setTimeout(() => loadChatsList(), 100);
        }
        setChatId(data.data.chatId);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.data?.reply || "Done."
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: unknown) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        input,
        setInput,
        isLoading,
        setIsLoading,
        loadingText,
        setLoadingText,
        chatId,
        setChatId,
        isInitializing,
        chatsList,
        loadChatsList,
        loadChat,
        createNewChat,
        deleteChat,
        handleSubmit,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

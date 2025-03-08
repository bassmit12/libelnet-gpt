// app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react"; // Add useCallback
import { Chat } from "@/components/chat";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Conversation } from "@/types/conversation";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null,
  );

  // Load conversations from localStorage on initial render
  useEffect(() => {
    const savedConversations = localStorage.getItem("conversations");
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations, (key, value) => {
        if (key === "date") return new Date(value);
        return value;
      });
      setConversations(parsed);
      if (parsed.length > 0) {
        setActiveConversation(parsed[0].id);
      }
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  const handleNewConversation = useCallback(() => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: "New Conversation",
      date: new Date(),
      preview: "Start a new conversation with LibelNet AI",
      messages: [
        {
          id: "welcome-message",
          role: "assistant",
          content:
            "Hello! I'm the LibelNet AI assistant. How can I help you today?",
        },
      ],
    };

    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversation(newId);
  }, []);

  const updateConversation = useCallback(
    (conversationId: string, updates: Partial<Conversation>) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                ...updates,
                messages: updates.messages || conv.messages,
              }
            : conv,
        ),
      );
    },
    [],
  );

  const deleteConversation = useCallback(
    (conversationId: string) => {
      setConversations((prev) => {
        const newConversations = prev.filter(
          (conv) => conv.id !== conversationId,
        );
        if (activeConversation === conversationId) {
          setActiveConversation(newConversations[0]?.id || null);
        }
        return newConversations;
      });
    },
    [activeConversation],
  );

  return (
    <div className="flex flex-col min-h-screen h-screen">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={setActiveConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={deleteConversation}
        />

        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-r from-libelnet-blue/5 via-libelnet-orange/5 to-libelnet-red/5 animate-gradient-x dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
          <div className="container mx-auto px-4 py-6 max-w-screen-2xl flex-shrink-0">
            <div className="max-w-none mx-auto">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">
                  <span className="text-libelnet-gray dark:text-gray-400">
                    Libel
                  </span>
                  <span className="text-libelnet-blue">n</span>
                  <span className="text-libelnet-orange">e</span>
                  <span className="text-libelnet-red">t</span>
                  <span className="dark:text-white"> AI</span>
                </h1>
                <p className="text-muted-foreground dark:text-gray-400 text-sm">
                  Ask any question about our company, policies, or procedures
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 pb-4 overflow-hidden">
            <div className="h-full max-w-none mx-auto lg:max-w-[80%] xl:max-w-[70%] 2xl:max-w-[60%]">
              <div className="h-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <Chat
                  conversationId={activeConversation}
                  onUpdateConversation={updateConversation}
                  userProfilePic="https://www.bassmit.dev/_next/image?url=%2Fassets%2FBas_Smit_Enhanced.png&w=256&q=75"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

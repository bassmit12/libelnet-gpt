// components/chat.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { SendIcon, User, Sparkles, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, Conversation } from "@/types/conversation";

interface ChatProps {
  conversationId: string | null;
  onUpdateConversation: (
    conversationId: string,
    updates: Partial<Conversation>,
  ) => void;
  userProfilePic?: string;
}

const TIMEOUT_DURATION = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function Chat({
  conversationId,
  onUpdateConversation,
  userProfilePic = "/default-avatar.png",
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      const conversation = JSON.parse(
        localStorage.getItem("conversations") || "[]",
      ).find((c: Conversation) => c.id === conversationId);

      if (conversation) {
        setMessages(conversation.messages);
      } else {
        setMessages([
          {
            id: "welcome-message",
            role: "assistant",
            content:
              "Hello! I'm the LibelNet AI assistant, specifically trained on LibelNet's company information. How can I help you today?",
          },
        ]);
      }
    }
  }, [conversationId]);

  // Update conversation when messages change
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      const lastUserMessage = messages
        .filter((msg) => msg.role === "user")
        .pop();

      if (lastUserMessage) {
        onUpdateConversation(conversationId, {
          title:
            lastUserMessage.content.slice(0, 30) +
            (lastUserMessage.content.length > 30 ? "..." : ""),
          preview: lastUserMessage.content,
          date: new Date(),
          messages: messages,
        });
      }
    }
  }, [messages, conversationId, onUpdateConversation]);

  const handleSubmit = async (e: React.FormEvent, retryCount = 0) => {
    e.preventDefault();

    if (!input.trim() || isLoading || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const loadingId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: "assistant",
        content: "",
      },
    ]);

    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(
        () => abortController.abort(),
        TIMEOUT_DURATION,
      );

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingId
              ? {
                  ...msg,
                  content: assistantMessage,
                }
              : msg,
          ),
        );
      }
    } catch (error) {
      console.error("Chat error:", error);

      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying request (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        setIsLoading(false);
        return handleSubmit(e, retryCount + 1);
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                content:
                  "I apologize, but I encountered an error. Please try again.",
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a conversation or start a new one
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-libelnet-blue to-libelnet-red p-3 text-white flex items-center gap-3 dark:from-libelnet-blue/80 dark:to-libelnet-red/80">
        <Sparkles className="h-5 w-5" />
        <h3 className="font-medium">LibelNet AI Assistant</h3>
      </div>

      <ScrollArea className="flex-1 p-4 dark:bg-gray-900" ref={scrollAreaRef}>
        <div className="space-y-4 w-full max-w-[95%] mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3 w-full",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="mt-0.5 bg-gradient-to-r from-libelnet-blue to-libelnet-red text-white flex-shrink-0 ring-2 ring-white/10 dark:ring-white/5 transition-all duration-200 hover:scale-105 hover:ring-white/20">
                  <div className="w-full h-full flex items-center justify-center text-xs font-semibold">
                    LN
                  </div>
                </Avatar>
              )}

              <Card
                className={cn(
                  "transition-all duration-300",
                  message.role === "user"
                    ? "bg-libelnet-blue text-white dark:bg-libelnet-blue/80 ml-auto"
                    : "bg-muted dark:bg-gray-800 mr-auto",
                  "w-auto max-w-[85%] md:max-w-[80%] lg:max-w-[75%]",
                )}
              >
                <CardContent className="p-2.5 py-2">
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </CardContent>
              </Card>

              {message.role === "user" && (
                <Avatar className="mt-0.5 flex-shrink-0 ring-2 ring-white dark:ring-gray-700 transition-all duration-200 hover:scale-105 hover:ring-libelnet-blue/50 dark:hover:ring-libelnet-blue/30">
                  {userProfilePic ? (
                    <AvatarImage
                      src={userProfilePic}
                      alt="User"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                    </div>
                  )}
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-center w-full py-2">
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 bg-libelnet-blue rounded-full animate-bounce dark:bg-libelnet-blue/80" />
                <div className="w-2.5 h-2.5 bg-libelnet-orange rounded-full animate-bounce [animation-delay:0.2s] dark:bg-libelnet-orange/80" />
                <div className="w-2.5 h-2.5 bg-libelnet-red rounded-full animate-bounce [animation-delay:0.4s] dark:bg-libelnet-red/80" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 max-w-[95%] mx-auto"
        >
          <div className="relative flex-1">
            <MessageCircle className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <Textarea
              placeholder="Ask a question about LibelNet..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[50px] resize-none border-libelnet-blue/20 focus-visible:ring-libelnet-blue/50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white pl-10"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 bg-gradient-to-r from-libelnet-blue to-libelnet-red hover:opacity-90 text-white h-full rounded-md transition-all duration-300 flex items-center gap-2 dark:from-libelnet-blue/80 dark:to-libelnet-red/80 dark:hover:opacity-100"
          >
            <span className="hidden sm:inline">Send</span>
            <SendIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

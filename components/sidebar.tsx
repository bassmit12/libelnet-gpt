// components/sidebar.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlusCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Conversation } from "@/types/conversation";

interface SidebarProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export function Sidebar({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Function to format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Today";
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div
      className={cn(
        "h-full border-r dark:border-gray-800 bg-gray-50 dark:bg-gray-900 transition-all duration-300 flex flex-col",
        collapsed ? "w-[60px]" : "w-[280px] lg:w-[320px] xl:w-[350px]",
      )}
    >
      <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <h2 className="font-semibold text-sm dark:text-white">
            Conversations
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto text-gray-700 dark:text-gray-300"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="p-2">
        <Button
          onClick={onNewConversation}
          className={cn(
            "w-full bg-libelnet-blue hover:bg-libelnet-blue/90 text-white dark:bg-libelnet-blue/80 dark:hover:bg-libelnet-blue flex gap-2 items-center justify-center",
            collapsed ? "px-2" : "",
          )}
        >
          <PlusCircle className="h-4 w-4" />
          {!collapsed && <span>New Conversation</span>}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="flex items-center gap-2 group"
            >
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left h-auto py-3 px-3 transition-colors",
                  activeConversation === conversation.id
                    ? "bg-libelnet-blue/10 text-libelnet-blue hover:bg-libelnet-blue/15 dark:bg-libelnet-blue/20 dark:text-libelnet-blue/80 dark:hover:bg-libelnet-blue/25"
                    : "hover:bg-gray-100/80 text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800/90",
                  collapsed ? "px-2" : "",
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      collapsed ? "mr-0" : "mt-0.5",
                      activeConversation === conversation.id
                        ? "text-libelnet-blue dark:text-libelnet-blue/80"
                        : "text-gray-500 dark:text-gray-400",
                    )}
                  />
                  {!collapsed && (
                    <div className="flex flex-col overflow-hidden w-full">
                      <span
                        className="font-medium truncate overflow-hidden text-ellipsis"
                        title={conversation.title}
                      >
                        {truncateText(conversation.title, 30)}
                      </span>
                      <span
                        className="text-xs text-muted-foreground dark:text-gray-400"
                        title={conversation.date.toLocaleDateString()}
                      >
                        {formatDate(conversation.date)}
                      </span>
                      <span
                        className="text-xs text-muted-foreground dark:text-gray-400 truncate line-clamp-2 mt-1"
                        title={conversation.preview}
                      >
                        {truncateText(conversation.preview, 100)}
                      </span>
                    </div>
                  )}
                </div>
              </Button>

              {!collapsed && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this conversation? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteConversation(conversation.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))}

          {conversations.length === 0 && !collapsed && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground dark:text-gray-400">
              No previous conversations
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

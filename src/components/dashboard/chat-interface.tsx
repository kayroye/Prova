"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Plus, Pencil, Link2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfile } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatMessage {
  sender: "user" | "ai";
  message: string;
  created_at: string;
}

interface ChatInterfaceProps {
  selectedEndpoints?: Array<{ id: string; url: string; parameters?: string }>;
}

const CHAT_SESSION_KEY = "currentChatSession";

export function ChatInterface({ selectedEndpoints }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const { toast } = useToast();

  const loadUserProfile = useCallback(async () => {
    const response = await fetch("/api/user/profile");
    const data = await response.json();
    setUserProfile(data);
  }, []);

  // Load chat session from localStorage on mount
  useEffect(() => {
    loadUserProfile();
    const savedChatId = localStorage.getItem(CHAT_SESSION_KEY);
    if (savedChatId) {
      // Verify if the chat session exists before setting it
      fetch(`/api/chat/messages/${savedChatId}`)
        .then((response) => {
          if (!response.ok) {
            // If session doesn't exist, remove it from localStorage
            localStorage.removeItem(CHAT_SESSION_KEY);
            return;
          }
          setChatId(savedChatId);
        })
        .catch(() => {
          // On error, remove the invalid session
          localStorage.removeItem(CHAT_SESSION_KEY);
        });
    }
  }, [loadUserProfile]);

  const createChatSession = useCallback(async () => {
    try {
      const response = await fetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoints: selectedEndpoints }),
      });

      if (!response.ok) throw new Error("Failed to create chat session");

      const data = await response.json();
      setChatId(data.chatSessionId);
      localStorage.setItem(CHAT_SESSION_KEY, data.chatSessionId);

      // Add initial system message
      if (data.message) {
        setMessages([
          {
            id: uuidv4(),
            role: "assistant",
            content: data.message,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred");
      console.error("Failed to create chat session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start chat session",
      });
    }
  }, [selectedEndpoints, toast]);

  const loadExistingMessages = useCallback(async (sessionId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/chat/messages/${sessionId}`);
      if (!response.ok) throw new Error("Failed to load messages");

      const data = await response.json();
      const formattedMessages = data.messages.map((msg: ChatMessage) => {
        let content = msg.message;
        if (msg.sender === "ai") {
          try {
            content = JSON.parse(msg.message);
          } catch {
            // If parsing fails, use the message as is
            content = msg.message;
          }
        }

        return {
          id: uuidv4(),
          role: msg.sender === "user" ? "user" : "assistant",
          content,
          timestamp: new Date(msg.created_at),
        };
      });

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEndpoints?.length) {

      // Only create a new chat session if we don't have a valid chatId
      // and there's no saved chat in localStorage
      const savedChatId = localStorage.getItem(CHAT_SESSION_KEY);
      if (!chatId && !savedChatId) {
        createChatSession();
      }
    }
  }, [selectedEndpoints, createChatSession, chatId]);

  useEffect(() => {
    if (chatId) {
      loadExistingMessages(chatId);
    }
  }, [chatId, loadExistingMessages]);

  useEffect(() => {
    if (userProfile?.role === "free") {
      const userMessageCount = messages.filter(msg => msg.role === "user").length;
      setHasReachedLimit(userMessageCount >= 9);
    } else {
      setHasReachedLimit(false);
    }
  }, [messages, userProfile]);

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      requestAnimationFrame(() => {
        const lastChild = scrollContainerRef.current?.lastElementChild;
        lastChild?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleNewChat = () => {
    setChatId(null);
    setMessages([]);
    setHasReachedLimit(false);
    localStorage.removeItem(CHAT_SESSION_KEY);
    createChatSession();
  };


  const handleSubmit = async () => {
    if (!input.trim() || !chatId) return;

    // Count only user messages
    const userMessageCount = messages.filter(msg => msg.role === "user").length;

    // Block sending if user has reached the limit
    if (userProfile?.role === "free" && userMessageCount >= 8) {
      toast({
        variant: "destructive",
        title: "Message Limit Reached",
        description: "You've reached the message limit for this chat. Please start a new chat or upgrade to premium for unlimited messages.",
      });
    } else if (userProfile?.role === "free" && userMessageCount >= 6) {
      const remainingMessages = 8 - userMessageCount;
      toast({
        variant: "warning",
        title: "Message Limit Warning",
        description: `You have ${remainingMessages} message${remainingMessages === 1 ? '' : 's'} remaining in this chat. Consider upgrading to premium for unlimited messages.`,
      });
    }
    

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          chatId,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      if (data.message) {
        const content =
          typeof data.message.content === "string"
            ? data.message.content
            : JSON.stringify(data.message.content);

        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "assistant",
            content,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err: unknown) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred");
      console.error("Failed to get AI response:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response from AI",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-x-2">
        <CardTitle>Talk to Your APIs</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNewChat}
          disabled={!selectedEndpoints?.length}
          className="hidden sm:flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative">
        {!selectedEndpoints?.length && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center text-muted-foreground">
            Add an API endpoint to get started.
          </div>
        )}
        {isLoadingMessages && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div
            ref={scrollContainerRef}
            className="flex flex-col space-y-4 px-6 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div
                    className={`prose prose-sm max-w-none ${
                      message.role === "user"
                        ? "[&_*]:text-primary-foreground"
                        : "dark:prose-invert"
                    }`}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2 px-6 pb-6 pt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={!selectedEndpoints?.length}
                className="sm:hidden h-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" sideOffset={12}>
              <DropdownMenuItem onClick={handleNewChat}>
                <Pencil className="h-4 w-4 mr-2" />
                Start new chat
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link2 className="h-4 w-4 mr-2" />
                Add endpoint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              hasReachedLimit
                ? "Message limit reached. Start a new chat or upgrade to premium."
                : selectedEndpoints?.length
                ? "Type your message..."
                : "Add an API endpoint to get started"
            }
            className="resize-none h-10 min-h-0 py-2 px-3"
            disabled={isLoading || !chatId || !selectedEndpoints?.length || hasReachedLimit}
          />
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !input.trim() ||
              !chatId ||
              !selectedEndpoints?.length ||
              hasReachedLimit
            }
            size="icon"
            className="h-10 w-10 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

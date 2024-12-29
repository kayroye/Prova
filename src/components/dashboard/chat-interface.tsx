"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  selectedEndpoints?: Array<{id: string, url: string, parameters?: string}>;
}

export function ChatInterface({ selectedEndpoints }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

      // Add initial system message
      if (data.message) {
        setMessages([{
          id: uuidv4(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        }]);
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error("Failed to create chat session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start chat session",
      });
    }
  }, [selectedEndpoints, toast]);

  useEffect(() => {
    if (selectedEndpoints?.length) {
      // Create a new chat session when endpoints are selected
      createChatSession();
    }
  }, [selectedEndpoints, createChatSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!input.trim() || !chatId) return;

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
          messages: messages.concat(userMessage).map(m => ({
            role: m.role,
            content: m.content,
          })),
          chatId,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      
      if (data.message) {
        setMessages((prev) => [...prev, {
          id: uuidv4(),
          role: "assistant",
          content: typeof data.message.content === 'string' ? data.message.content : JSON.stringify(data.message.content),
          timestamp: new Date(),
        }]);
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
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
      <CardHeader>
        <CardTitle>Chat Interface</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="flex flex-col space-y-4 px-6 py-4">
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
                  <div className={`prose prose-sm max-w-none ${
                    message.role === "user"
                      ? "[&_*]:text-primary-foreground"
                      : "dark:prose-invert"
                  }`}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2 px-6 pb-6 pt-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="resize-none"
            disabled={isLoading || !chatId}
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim() || !chatId}
            size="icon"
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
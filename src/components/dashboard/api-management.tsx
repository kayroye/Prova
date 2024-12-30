"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface APIEndpoint {
  id: string;
  user_id: string;
  url: string;
  parameters: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiManagementProps {
  endpoints: APIEndpoint[];
  setEndpoints: Dispatch<SetStateAction<APIEndpoint[]>>;
}

export function ApiManagement({ endpoints, setEndpoints }: ApiManagementProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newParameters, setNewParameters] = useState("");
  const { toast } = useToast();

  const handleAddEndpoint = async () => {
    if (!newUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an API endpoint URL",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl, parameters: newParameters }),
      });

      if (!response.ok) throw new Error("Failed to add endpoint");

      const newEndpoint = await response.json();
      setEndpoints(prev => [...prev, newEndpoint]);
      setNewUrl("");
      setNewParameters("");
      
      toast({
        title: "Success",
        description: "API endpoint added successfully",
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error("Failed to add endpoint:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add API endpoint",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEndpoint = async (id: string) => {
    try {
      const response = await fetch(`/api/endpoints/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete endpoint");

      setEndpoints(prev => prev.filter(endpoint => endpoint.id !== id));
      
      toast({
        title: "Success",
        description: "API endpoint deleted successfully",
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error("Failed to delete endpoint:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete API endpoint",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved API Endpoints</CardTitle>
        <CardDescription>Manage your collection of reusable API endpoints</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-url">New Endpoint URL</Label>
            <Input
              id="new-url"
              placeholder="https://api.example.com/v1/endpoint"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-parameters">Parameters Template (Optional)</Label>
            <Input
              id="new-parameters"
              placeholder='{"key": "value"}'
              value={newParameters}
              onChange={(e) => setNewParameters(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleAddEndpoint}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Endpoint
              </>
            )}
          </Button>

          <div className="mt-6 space-y-4">
            {endpoints.map((endpoint) => (
              <div
                key={endpoint.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {endpoint.url}
                  </p>
                  {endpoint.parameters && (
                    <p className="text-sm text-muted-foreground truncate">
                      Parameters: {endpoint.parameters}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteEndpoint(endpoint.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
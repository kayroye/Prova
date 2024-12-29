"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash } from "lucide-react";

interface FormEndpoint {
  url: string;
  parameters: string;
}

interface ApiFormProps {
  onSubmit: (endpoints: FormEndpoint[]) => Promise<void>;
  isLoading?: boolean;
}

export function ApiForm({ onSubmit, isLoading = false }: ApiFormProps) {
  const [endpoints, setEndpoints] = useState<FormEndpoint[]>([{ url: "", parameters: "" }]);
  const { toast } = useToast();

  const addEndpoint = () => {
    setEndpoints([...endpoints, { url: "", parameters: "" }]);
  };

  const removeEndpoint = (index: number) => {
    if (endpoints.length > 1) {
      const newEndpoints = endpoints.filter((_, i) => i !== index);
      setEndpoints(newEndpoints);
    }
  };

  const updateEndpoint = (index: number, field: keyof FormEndpoint, value: string) => {
    const newEndpoints = endpoints.map((endpoint, i) => {
      if (i === index) {
        return { ...endpoint, [field]: value };
      }
      return endpoint;
    });
    setEndpoints(newEndpoints);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasEmptyEndpoints = endpoints.some(endpoint => !endpoint.url.trim());
    if (hasEmptyEndpoints) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter all API endpoints",
      });
      return;
    }

    try {
      await onSubmit(endpoints);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error("Failed to submit endpoints:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start New Chat</CardTitle>
        <CardDescription>Configure the API endpoints you want to interact with in this chat session</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg relative">
              <div className="space-y-2">
                <Label htmlFor={`endpoint-${index}`}>Endpoint URL {index + 1}</Label>
                <Input
                  id={`endpoint-${index}`}
                  placeholder="https://api.example.com/v1/endpoint"
                  value={endpoint.url}
                  onChange={(e) => updateEndpoint(index, 'url', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`parameters-${index}`}>Parameters</Label>
                <Input
                  id={`parameters-${index}`}
                  placeholder='{"key": "value"}'
                  value={endpoint.parameters}
                  onChange={(e) => updateEndpoint(index, 'parameters', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {endpoints.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeEndpoint(index)}
                  disabled={isLoading}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addEndpoint}
            disabled={isLoading}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Endpoint
          </Button>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Start Chat"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
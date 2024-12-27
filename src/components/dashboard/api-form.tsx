"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Loader2 } from "lucide-react";

interface ApiFormProps {
  onSubmit: (endpoints: Array<{url: string, parameters: string}>) => Promise<void>;
  isLoading?: boolean;
}

export function ApiForm({ onSubmit, isLoading = false }: ApiFormProps) {
  const [endpoints, setEndpoints] = useState<Array<{url: string, parameters: string}>>([{ url: "", parameters: "" }]);
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

  const updateEndpoint = (index: number, field: 'url' | 'parameters', value: string) => {
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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Endpoints</CardTitle>
        <CardDescription>Enter the API endpoints you want to interact with</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg relative">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`endpoint-${index}`}>Endpoint URL {index + 1}</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-4 w-4">
                          <HelpCircle className="h-3 w-3" />
                          <span className="sr-only">Endpoint URL format help</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter a complete URL including the protocol (http/https)</p>
                        <p className="text-xs text-muted-foreground mt-1">Example: https://api.example.com/v1/data</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id={`endpoint-${index}`}
                  placeholder="https://api.example.com/v1/endpoint"
                  value={endpoint.url}
                  onChange={(e) => updateEndpoint(index, 'url', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`parameters-${index}`}>Parameters (Optional)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-4 w-4">
                          <HelpCircle className="h-3 w-3" />
                          <span className="sr-only">Parameters format help</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>You can:</p>
                        <ul className="list-disc ml-4 text-xs space-y-1 mt-1">
                          <li>Enter JSON parameters</li>
                          <li>Describe what you want to do</li>
                          <li>Leave empty for simple GET requests</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id={`parameters-${index}`}
                  placeholder='{"key": "value"} or "Describe what you want to do"'
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
                  Remove
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
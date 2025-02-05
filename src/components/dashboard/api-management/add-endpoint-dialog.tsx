import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AddEndpointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddEndpointDialog({ open, onOpenChange, onSuccess }: AddEndpointDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [selectedMethods, setSelectedMethods] = useState<string[]>(["GET"]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    parameters: "",
    headers: "",
    environment: "development"
  });
  
  // New state for structured parameter and header inputs
  const [parameterPairs, setParameterPairs] = useState<Array<{ key: string; value: string }>>([{ key: "", value: "" }]);
  const [headerPairs, setHeaderPairs] = useState<Array<{ key: string; value: string }>>([{ key: "", value: "" }]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const toggleMethod = (method: string) => {
    setSelectedMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addNewPair = (type: 'parameter' | 'header') => {
    if (type === 'parameter') {
      setParameterPairs([...parameterPairs, { key: "", value: "" }]);
    } else {
      setHeaderPairs([...headerPairs, { key: "", value: "" }]);
    }
  };

  const updatePair = (type: 'parameter' | 'header', index: number, field: 'key' | 'value', value: string) => {
    if (type === 'parameter') {
      const newPairs = [...parameterPairs];
      newPairs[index][field] = value;
      setParameterPairs(newPairs);
      
      // Update JSON string
      const parametersObj = Object.fromEntries(
        newPairs
          .filter(pair => pair.key && pair.value)
          .map(pair => [pair.key, pair.value])
      );
      setFormData(prev => ({ ...prev, parameters: JSON.stringify(parametersObj, null, 2) }));
    } else {
      const newPairs = [...headerPairs];
      newPairs[index][field] = value;
      setHeaderPairs(newPairs);
      
      // Update JSON string
      const headersObj = Object.fromEntries(
        newPairs
          .filter(pair => pair.key && pair.value)
          .map(pair => [pair.key, pair.value])
      );
      setFormData(prev => ({ ...prev, headers: JSON.stringify(headersObj, null, 2) }));
    }
  };

  const removePair = (type: 'parameter' | 'header', index: number) => {
    if (type === 'parameter') {
      setParameterPairs(parameterPairs.filter((_, i) => i !== index));
    } else {
      setHeaderPairs(headerPairs.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.name.trim() || !formData.url.trim()) {
        toast({
          title: "Validation Error",
          description: "Name and URL are required",
          variant: "destructive",
        });
        return;
      }

      // Parse JSON fields
      let parsedParameters = {};
      let parsedHeaders = {};

      try {
        if (formData.parameters.trim()) {
          parsedParameters = JSON.parse(formData.parameters);
        }
        if (formData.headers.trim()) {
          parsedHeaders = JSON.parse(formData.headers);
        }
      } catch {
        toast({
          title: "Invalid JSON",
          description: "Invalid JSON in parameters or headers",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/endpoints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          url: formData.url,
          parameters: parsedParameters,
          headers: parsedHeaders,
          methods: selectedMethods,
          environment: formData.environment,
          tags
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Success",
        description: "Endpoint added successfully",
      });
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        url: "",
        parameters: "",
        headers: "",
        environment: "development"
      });
      setTags([]);
      setSelectedMethods(["GET"]);
      
    } catch (error) {
      console.error("Failed to add endpoint:", error);
      toast({
        title: "Error",
        description: "Failed to add endpoint",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Basic Information",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              placeholder="My API Endpoint" 
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this endpoint does..."
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Endpoint URL</Label>
            <Input
              id="url"
              placeholder="https://api.example.com/v1/endpoint"
              value={formData.url}
              onChange={handleInputChange}
            />
          </div>
        </div>
      )
    },
    {
      title: "Methods & Tags",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>HTTP Methods</Label>
            <div className="flex flex-wrap gap-2">
              {["GET", "POST", "PUT", "DELETE", "PATCH"].map((method) => (
                <Button
                  key={method}
                  variant={selectedMethods.includes(method) ? "default" : "outline"}
                  size="sm"
                  className="min-w-[80px]"
                  onClick={() => toggleMethod(method)}
                  type="button"
                >
                  {method}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              id="tags"
              placeholder="Add tags (press Enter)"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      )
    },
    {
      title: "Parameters & Headers",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Parameters</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNewPair('parameter')}
                type="button"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Parameter
              </Button>
            </div>
            
            <div className="space-y-3">
              {parameterPairs.map((pair, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Key"
                    value={pair.key}
                    onChange={(e) => updatePair('parameter', index, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={pair.value}
                    onChange={(e) => updatePair('parameter', index, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePair('parameter', index)}
                    className="px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {formData.parameters && (
              <div className="space-y-2">
                <Label>Parameters Preview</Label>
                <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
                  {formData.parameters}
                </pre>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Headers</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNewPair('header')}
                type="button"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Header
              </Button>
            </div>
            
            <div className="space-y-3">
              {headerPairs.map((pair, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Key"
                    value={pair.key}
                    onChange={(e) => updatePair('header', index, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={pair.value}
                    onChange={(e) => updatePair('header', index, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePair('header', index)}
                    className="px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {formData.headers && (
              <div className="space-y-2">
                <Label>Headers Preview</Label>
                <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
                  {formData.headers}
                </pre>
              </div>
            )}
          </div>
        </div>
      )
    }
  ];

  if (!open) return null;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Endpoint</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-6">
            <div className="space-y-6">
              {steps.map(step => (
                <div key={step.title}>
                  {step.content}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end pt-6">
            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Endpoint"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerHeader className="px-4">
        <DrawerTitle>{steps[currentStep].title}</DrawerTitle>
        <div className="flex justify-center mt-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 w-2 rounded-full mx-1",
                index === currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </DrawerHeader>
      <DrawerContent>
        <div className="px-4">
          <ScrollArea className="h-[calc(100vh-10rem)]">
            <div className="px-2">
              {steps[currentStep].content}
            </div>
          </ScrollArea>
          <div className="sticky bottom-0 bg-background pt-6 pb-8 space-y-2">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(current => current - 1)}
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(current => current + 1)}
                  className="flex-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Endpoint"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 
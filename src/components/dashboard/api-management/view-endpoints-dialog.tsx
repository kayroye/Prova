import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Endpoint } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search, X } from "lucide-react";

interface ViewEndpointsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpoints: Endpoint[];
}

export function ViewEndpointsDialog({
  open,
  onOpenChange,
  endpoints,
}: ViewEndpointsDialogProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const filteredEndpoints = endpoints.filter(endpoint => 
    endpoint.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    endpoint.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const EndpointList = (
    <div className="space-y-2">
      {endpoints.map((endpoint) => (
        <Button
          key={endpoint.id}
          variant="ghost"
          className={cn(
            "w-full justify-start",
            selectedEndpoint?.id === endpoint.id && "bg-muted"
          )}
          onClick={() => setSelectedEndpoint(endpoint)}
        >
          <div className="truncate text-left">
            <p className="font-medium">{endpoint.name || endpoint.url}</p>
            <p className="text-sm text-muted-foreground">
              Added {new Date(endpoint.created_at).toLocaleDateString()}
            </p>
          </div>
        </Button>
      ))}
    </div>
  );

  const EndpointDetails = selectedEndpoint ? (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">{selectedEndpoint.name || "Unnamed Endpoint"}</h3>
        <p className="text-sm text-muted-foreground">{selectedEndpoint.description}</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">URL</label>
          <p className="mt-1">{selectedEndpoint.url}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Methods</label>
          <div className="flex gap-2 mt-1">
            {selectedEndpoint.methods.map((method) => (
              <span key={method} className="px-2 py-1 bg-muted rounded text-sm">
                {method}
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Environment</label>
          <p className="mt-1">{selectedEndpoint.environment}</p>
        </div>
        {selectedEndpoint.parameters && (
          <div>
            <label className="text-sm font-medium">Parameters</label>
            <pre className="mt-1 p-2 bg-muted rounded-md text-sm overflow-x-auto">
              {typeof selectedEndpoint.parameters === 'string' ? selectedEndpoint.parameters : JSON.stringify(selectedEndpoint.parameters, null, 2)}
            </pre>
          </div>
        )}
        {selectedEndpoint.tags?.length > 0 && (
          <div>
            <label className="text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedEndpoint.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-muted rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        <div>
          <label className="text-sm font-medium">Created</label>
          <p className="mt-1">
            {new Date(selectedEndpoint.created_at).toLocaleString()}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Last Updated</label>
          <p className="mt-1">
            {new Date(selectedEndpoint.updated_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="h-full flex items-center justify-center text-muted-foreground">
      Select an endpoint to view details
    </div>
  );

  if (!open) return null;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>API Endpoints</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 border-r pr-6">
              <ScrollArea className="h-[60vh]">
                {EndpointList}
              </ScrollArea>
            </div>
            <div className="col-span-2">
              <ScrollArea className="h-[60vh]">
                {EndpointDetails}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile Drawer Implementation
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerHeader>
        <DrawerTitle>API Endpoints</DrawerTitle>
      </DrawerHeader>
      <DrawerContent className="h-[85vh] focus:outline-none max-w-full">
        <div className="h-full flex flex-col">
          {/* Dynamic Header based on view */}
          <div className="border-b">
            {selectedEndpoint ? (
              <div className="px-3 py-3 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setSelectedEndpoint(null)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="font-semibold truncate pr-3">
                  {selectedEndpoint.name || "Unnamed Endpoint"}
                </h2>
              </div>
            ) : (
              <div className="px-3 py-3 space-y-3">
                <h2 className="font-semibold text-lg">API Endpoints</h2>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search endpoints..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-8 w-full"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {!selectedEndpoint ? (
              <div className="p-3 space-y-2">
                {filteredEndpoints.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No endpoints found
                  </p>
                ) : (
                  filteredEndpoints.map((endpoint) => (
                    <Button
                      key={endpoint.id}
                      variant="ghost"
                      className="w-full justify-start py-3 px-3 h-auto"
                      onClick={() => setSelectedEndpoint(endpoint)}
                    >
                      <div className="w-full text-left">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-base truncate">
                            {endpoint.name || endpoint.url}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {endpoint.url}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {endpoint.methods.map((method) => (
                            <span
                              key={method}
                              className="px-1.5 py-0.5 bg-muted rounded text-xs"
                            >
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            ) : (
              <div className="px-3 py-3">
                <div className="space-y-5">
                  {selectedEndpoint.description && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {selectedEndpoint.description}
                      </p>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium block mb-1.5">URL</label>
                      <div className="p-2.5 bg-muted rounded-md text-sm break-all">
                        {selectedEndpoint.url}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Methods</label>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEndpoint.methods.map((method) => (
                          <span key={method} className="px-2 py-1 bg-muted rounded-md text-xs">
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Environment</label>
                      <div className="p-2.5 bg-muted rounded-md text-sm">
                        {selectedEndpoint.environment}
                      </div>
                    </div>
                    {selectedEndpoint.parameters && (
                      <div>
                        <label className="text-sm font-medium block mb-1.5">Parameters</label>
                        <pre className="p-2.5 bg-muted rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-words">
                          {typeof selectedEndpoint.parameters === 'string'
                            ? selectedEndpoint.parameters
                            : JSON.stringify(selectedEndpoint.parameters, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedEndpoint.tags?.length > 0 && (
                      <div>
                        <label className="text-sm font-medium block mb-1.5">Tags</label>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedEndpoint.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-muted rounded-md text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Created</label>
                      <div className="p-2.5 bg-muted rounded-md text-sm">
                        {new Date(selectedEndpoint.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Last Updated</label>
                      <div className="p-2.5 bg-muted rounded-md text-sm">
                        {new Date(selectedEndpoint.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 
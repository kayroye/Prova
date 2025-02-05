"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { ViewEndpointsDialog } from "./api-management/view-endpoints-dialog";
import { AddEndpointDialog } from "./api-management/add-endpoint-dialog";
import { Endpoint } from "@/lib/types";
interface ApiManagementProps {
  endpoints: Endpoint[];
  setEndpoints: Dispatch<SetStateAction<Endpoint[]>>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ApiManagement({ endpoints, setEndpoints }: ApiManagementProps) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Get the 3 most recent endpoints
  const latestEndpoints = [...endpoints]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>Manage your collection of reusable API endpoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Latest Endpoints */}
          <div className="space-y-4">
            {latestEndpoints.map((endpoint) => (
              <div
                key={endpoint.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <p className="font-medium truncate">{endpoint.url}</p>
                {endpoint.parameters && (
                  <p className="text-sm text-muted-foreground truncate">
                    Parameters: {typeof endpoint.parameters === 'string' ? endpoint.parameters : JSON.stringify(endpoint.parameters)}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Added {new Date(endpoint.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setViewDialogOpen(true)}
          >
            View all {endpoints.length} endpoints
          </Button>

          {/* Add New Button */}
          <Button
            className="w-full"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Endpoint
          </Button>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {viewDialogOpen && (
        <ViewEndpointsDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          endpoints={endpoints}
        />
      )}
      {addDialogOpen && (
        <AddEndpointDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
        />
      )}
    </>
  );
} 
"use client";

import { useState, useEffect } from "react";
import { ApiManagement } from "./api-management";
import { DashboardContent } from "./dashboard-content";

// Type for stored endpoints from the API
interface StoredEndpoint {
  id: string;
  url: string;
  parameters: string | null;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

// Type for chat interface endpoints
interface ChatEndpoint {
  id: string;
  url: string;
  parameters?: string;
}

const SELECTED_ENDPOINTS_KEY = "selectedEndpoints";

export function DashboardWrapper() {
  const [selectedEndpoints, setSelectedEndpoints] = useState<ChatEndpoint[]>(
    []
  );
  const [endpoints, setEndpoints] = useState<StoredEndpoint[]>([]);

  // Load selected endpoints from localStorage on mount
  useEffect(() => {
    const savedEndpoints = localStorage.getItem(SELECTED_ENDPOINTS_KEY);
    if (savedEndpoints) {
      setSelectedEndpoints(JSON.parse(savedEndpoints));
    }
  }, []);

  // Save selected endpoints to localStorage whenever they change
  useEffect(() => {
    if (selectedEndpoints.length > 0) {
      localStorage.setItem(
        SELECTED_ENDPOINTS_KEY,
        JSON.stringify(selectedEndpoints)
      );
    }
  }, [selectedEndpoints]);

  // Fetch endpoints on component mount
  useEffect(() => {
    const fetchEndpoints = async () => {
      try {
        const response = await fetch("/api/endpoints");
        if (!response.ok) throw new Error("Failed to fetch endpoints");
        const data = await response.json();
        setEndpoints(data);

        // Only set selected endpoints if none are currently selected and none are in localStorage
        if (
          data.length > 0 &&
          selectedEndpoints.length === 0 &&
          !localStorage.getItem(SELECTED_ENDPOINTS_KEY)
        ) {
          const chatEndpoints: ChatEndpoint[] = data.map(
            (e: StoredEndpoint) => ({
              id: e.id,
              url: e.url,
              parameters: e.parameters || undefined,
            })
          );
          setSelectedEndpoints(chatEndpoints);
        }
      } catch (error) {
        console.error("Failed to fetch endpoints:", error);
      }
    };

    fetchEndpoints();
  }, [selectedEndpoints.length]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8">
        <DashboardContent selectedEndpoints={selectedEndpoints} />
      </div>
      <div className="lg:col-span-4">
        <ApiManagement endpoints={endpoints} setEndpoints={setEndpoints} />
      </div>
    </div>
  );
}

export interface Endpoint {
  id: string;
  user_id: string;
  url: string;
  parameters: string | null;
  methods: string[];
  headers: string | null;
  environment: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
}

export interface ChatEndpoint {
  id: string;   
  url: string;
  parameters?: string;
}

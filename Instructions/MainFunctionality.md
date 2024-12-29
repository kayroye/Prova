# Project Overview: Interactive API Chat with OpenAI Integration

## Objective

Develop a **Next.js/React** application that allows authenticated users to interact with their custom APIs using natural language. Leveraging the **OpenAI SDK** with function calling, users can define API endpoints which the AI can invoke, explain responses, and generate related artifacts like unit tests.

## Key Features

1. **Dynamic API Integration**
   - Users can add, manage, and utilize their own API endpoints.
   - The AI dynamically recognizes and interacts with these user-defined APIs.

2. **Conversational Interface**
   - Users engage in natural language conversations with the AI.
   - The AI can call relevant APIs based on user queries, explain responses, and assist in tasks like unit test creation.

3. **Authentication & User Management**
   - Secure user authentication using **Supabase Auth** and **NextAuth**.
   - Role-based access control (e.g., free, premium) to manage feature access.

## Technology Stack

- **Frontend:** Next.js, React
- **Backend:** Next.js API Routes
- **Authentication:** Supabase Auth, NextAuth
- **Database:** Supabase (PostgreSQL)
- **AI Integration:** OpenAI SDK with Function Calling

## Database Schema Insights

### Relevant Tables

- **users**
  - Stores user authentication details.
  
- **user_profiles**
  - Contains user roles and additional metadata.

- **api_endpoints**
  - Stores user-defined API endpoints that the AI can call.
  
- **chat_sessions**
  - Manages ongoing conversations between the user and the AI.

- **chat_messages**
  - Stores individual messages within a chat session, capturing both user and AI interactions.

### Relationships

- **User** has many **APIEndpoints**.
- **User** has one **UserProfile**.
- **User** has many **ChatSessions**.
- **ChatSession** has many **ChatMessages**.

## Implementation Plan

### 1. **User Authentication & Profile Management**

- **Setup Authentication:**
  - Utilize **Supabase Auth** integrated with **NextAuth** for user sign-up, login, and session management.
  
- **Manage User Roles:**
  - Use the `role` field in `user_profiles` to differentiate between free and premium users.
  - Control access to features based on user roles.

### 2. **API Endpoint Management**

- **Create API Management Interface:**
  - Develop frontend components under `components/dashboard` (e.g., `api-form.tsx`, `api-history.tsx`) to allow users to add, edit, and view their API endpoints.
  
- **Backend API Routes:**
  - Implement API routes in `src/app/api` to handle CRUD operations for `api_endpoints`.
  - Ensure that each API action is authenticated and scoped to the requesting user.

- **Store API Details:**
  - When a user adds an API endpoint, store details in the `api_endpoints` table, including `url`, `parameters`, and timestamps.

### 3. **Integrating OpenAI Function Calling**

- **Dynamic Function Array:**
  - Upon initiating a chat session, fetch the user's `api_endpoints` from the database.
  - Dynamically construct the `functions` array based on these endpoints to provide to the OpenAI SDK.
  
- **AI Interaction Workflow:**
  1. **Initiate Conversation:**
     - User starts a chat session via the frontend.
     - A new entry is created in `chat_sessions` to track the conversation.
  
  2. **Handle User Queries:**
     - User inputs a natural language query related to their APIs.
     - The backend sends this query to OpenAI, along with the dynamically generated `functions` array.
  
  3. **Function Calling by AI:**
     - If the AI determines that an API call is necessary, it invokes the appropriate function from the `functions` array.
     - The backend receives the function call, executes the corresponding API endpoint, and returns the response to the AI.
  
  4. **AI Response:**
     - AI processes the API response, explains it to the user, and can perform additional tasks like generating unit tests or providing usage examples.
  
  5. **Logging & Usage Tracking:**
     - All interactions are logged in `api_logs` and `chat_sessions` for monitoring and analytics.
     - Update `api_usage` to track API call counts based on user subscriptions.

### 4. **Conversation Management**

- **Chat Interface:**
  - Develop chat components under `components/dashboard` (e.g., `chat-interface.tsx`) to facilitate real-time conversations.
  
- **Session Handling:**
  - Each conversation is associated with a `chat_sessions` entry to persist chat history and context.
  
- **Message Logging:**
  - Implement functionality to record each message in `chat_messages`. This includes both user messages and AI responses.
  
- **State Management:**
  - Utilize React hooks and context to manage chat state on the frontend, ensuring a seamless user experience.
  - Ensure synchronization between frontend state and the `chat_messages` stored in the database.

#### Detailed Steps for Message Logging

1. **Sending a Message:**
   - When a user sends a message, it is immediately displayed in the chat interface.
   - The message is sent to the backend API, which saves it in the `chat_messages` table with `sender` set to `user`.

2. **Processing AI Response:**
   - The backend processes the message, interacts with OpenAI, and receives a response.
   - The AI's response is saved in the `chat_messages` table with `sender` set to `ai`.

3. **Displaying Chat History:**
   - On loading a chat session, fetch all related `chat_messages` and display them in the chat interface in chronological order.

4. **Maintaining Context:**
   - Use the `chat_messages` to maintain conversation context, allowing the AI to reference previous messages for coherent interactions.

### 5. **Security & Permissions**

- **API Access Control:**
  - Ensure that users can only access and invoke their own API endpoints.
  - Implement middleware (`middleware.ts`) to verify user permissions on each API request.
  
- **Data Validation:**
  - Validate all user-provided API details to prevent malicious inputs.
  
- **Rate Limiting:**
  - Implement rate limiting based on user roles to manage API call frequencies.

### 6. **Additional Features**

- **Unit Test Generation:**
  - Allow the AI to generate unit tests for user-defined APIs, enhancing development workflow.

- **API Documentation:**
  - Enable the AI to provide explanations and documentation for API responses and usage.

- **Subscription Handling:**
  - Manage user subscriptions in the `subscriptions` table to control access to premium features.

## Folder Structure Highlights
- **API Routes:** Located under `src/app/api`, handling authentication and chat functionalities.
- **Components:** Reusable UI components organized by feature under `src/components`.
- **Hooks & Lib:** Custom React hooks and utility functions to support application logic.

## Summary Workflow

1. **User Authentication:**
   - Users sign up/login using Supabase Auth via NextAuth.

2. **API Endpoint Management:**
   - Users add/manage their APIs through the dashboard interface.
   - APIs are stored in the `api_endpoints` table.

3. **Initiating a Chat:**
   - Users start a conversation in the chat interface.
   - The backend retrieves the user's APIs and configures the OpenAI functions accordingly.
   - A new `chat_sessions` entry is created to track the conversation.

4. **AI Interaction:**
   - User messages are sent to OpenAI with the dynamic functions.
   - AI determines when to call user-defined APIs, executes them, and responds appropriately.
   - All messages are logged in `chat_messages` for history and context.

5. **Logging & Monitoring:**
   - All interactions and API calls are logged in `api_logs` and `chat_sessions` for tracking and analytics.
   - `chat_messages` maintains the detailed conversation history.
   - Subscription status impacts API usage limits and feature access.

## Next Steps

- **Implement API Management Interface:**
  - Build frontend components for users to add/edit/view APIs.
  
- **Develop Backend Functionality:**
  - Create API routes to handle API endpoint CRUD operations.
  - Integrate OpenAI SDK with dynamic function arrays based on user APIs.
  
- **Enhance Security Measures:**
  - Ensure robust authentication and authorization across all endpoints.
  
- **Testing & Deployment:**
  - Write unit and integration tests to ensure application reliability.
  - Deploy the application using a suitable platform (e.g., Vercel) with proper environment configurations.

---
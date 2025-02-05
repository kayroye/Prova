# Prova

A modern web application that allows users to interact with APIs through natural language conversations. Built with Next.js and powered by AI, this platform makes API interaction intuitive and accessible.

## Features

### Authentication & Security
- Multiple sign-in options:
  - Email/Password authentication
  - Google OAuth integration
  - GitHub OAuth integration
- Multi-factor authentication (MFA) support with backup codes
- Secure password reset functionality
- Session persistence across page reloads

### API Management
- Add and manage custom API endpoints
- Store and organize API configurations
- View API call history and logs
- Parameter management for API endpoints

### AI-Powered Chat Interface
- Natural language interaction with APIs
- Context-aware conversations
- Real-time API response interpretation
- Markdown support for formatted responses

### User Management
- User profiles with customizable settings
- Role-based access control (Free/Premium tiers)
- Usage tracking and rate limiting
- Subscription management

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Hooks
- **Authentication**: NextAuth.js

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth integrated with NextAuth.js
- **AI Integration**: OpenAI SDK with function calling
- **API Integration**: Native fetch with custom middleware

### Key Dependencies
- `@supabase/supabase-js` for database operations
- `next-auth` for authentication
- `openai` for AI capabilities
- `react-markdown` for message formatting
- `zod` for schema validation
- `otplib` for MFA implementation

## Getting Started

First, set up your environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=your_nextauth_url
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
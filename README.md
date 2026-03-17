# Falsafa

A modern web application for chatting with characters from your favorite books, powered by AI.

## Project info

Falsafa allows users to upload books, which are then processed to extract characters. Users can then have interactive conversations with these characters through a chat interface.

## How can I run this project?

**Prerequisites**

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

**Setup Steps**

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd falsafa-frontend

# Step 3: Install dependencies
npm install

# Step 4: Copy environment variables
cp .env.example .env
# Then edit .env with your actual values

# Step 5: Start the development server
npm run dev
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:3001
VITE_API_TOKEN=your-static-api-token
```

## What technologies are used for this project?

- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Supabase** - Backend-as-a-Service (auth, database, storage)
- **Zod** - Schema validation
- **React Hook Form** - Form handling

## Features

- **User Authentication** - Sign up, sign in, and sign out via Supabase Auth
- **Book Upload** - Upload PDF/EPUB books for processing
- **Character Extraction** - AI-powered character extraction from uploaded books
- **Chat with Characters** - Interactive conversations with book characters
- **User Library** - Manage your collection of books
- **Role-based Access** - Admin and moderator functionality

## Available Scripts

```bash
# Development server (runs on port 8080)
npm run dev

# Production build
npm run build

# Development build
npm run build:dev

# Lint all files
npm run lint

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui components
│   ├── auth/        # Authentication components
│   └── layout/      # Layout components
├── contexts/        # React contexts (Auth, etc.)
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and API client
├── pages/           # Page components
│   ├── admin/       # Admin panel pages
│   └── settings/    # Settings sub-pages
├── types/           # TypeScript type definitions
└── data/            # Mock data (to be removed)
```

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
VITE_API_URL=http://localhost:7001
VITE_API_TOKEN=your-static-api-token
```

## What technologies are used for this project?

- **Vite** - Build tool and dev server (port 8080)
- **TypeScript** - Type-safe JavaScript
- **React** 18 - UI framework
- **React Router** - Client-side routing
- **TanStack Query** - Server state management & caching
- **shadcn/ui** - UI components (Radix UI based)
- **Tailwind CSS** - Styling
- **Supabase** - Backend-as-a-Service (auth, database, storage)
- **Zod** - Schema validation
- **React Hook Form** - Form handling
- **Framer Motion** - Animations
- **Recharts** - Charts for admin dashboard
- **date-fns** - Date utilities
- **lucide-react** - Icons
- **Vitest** - Testing framework

## Features

### User Features
- **User Authentication** - Sign up, sign in, and sign out via Supabase Auth
- **Book Discovery** - Browse books by category with filtering
- **Book Upload** - Upload PDF/EPUB books for processing
- **Character Chat** - Interactive conversations with AI-powered book characters
- **User Library** - Personal book collection with reading progress
- **Wishlist** - Save books for later
- **Book Reviews & Ratings** - Rate and review books
- **Book Comments** - Discussion on books
- **User Profiles** - Public/private profile customization

### Admin & Moderation
- **Admin Dashboard** - Overview with analytics charts
- **Book Management** - Approve/reject books, view processing status
- **Category Management** - Organize books by category
- **User Management** - View and manage users
- **Content Moderation** - Moderate reviews and comments
- **Report Handling** - Process user reports
- **App Settings** - Configure application settings
- **Notification Management** - Send system notifications
- **Audit Logs** - Track administrative actions

### Role-based Access
- **User** - Standard registered user
- **Moderator** - Content moderation privileges
- **Admin** - Full administrative access

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
├── components/              # Reusable UI components
│   ├── ui/                 # shadcn/ui base components
│   ├── auth/               # Authentication components (ProtectedRoute, RoleRoute)
│   └── layout/             # Layout components (AppLayout, Sidebar, Header)
├── contexts/               # React contexts
│   └── AuthContext.tsx     # Authentication state management
├── hooks/                  # Custom React hooks
│   ├── useAuth*            # Auth-related hooks
│   ├── useBooks*           # Book management hooks
│   ├── useChat*            # Chat functionality hooks
│   ├── useAdmin*           # Admin functionality hooks
│   └── use*.ts(x)          # Various utility hooks
├── lib/                    # Core libraries
│   ├── api.ts              # API client configuration
│   ├── supabase.ts         # Supabase client setup
│   └── utils.ts            # Utility functions
├── pages/                  # Page components
│   ├── admin/             # Admin panel pages
│   │   ├── AdminOverview.tsx
│   │   ├── AdminBooks.tsx
│   │   ├── AdminCategories.tsx
│   │   ├── AdminUsers.tsx
│   │   ├── AdminComments.tsx
│   │   ├── AdminReports.tsx
│   │   ├── AdminSettings.tsx
│   │   └── AdminNotifications.tsx
│   ├── settings/          # Settings sub-pages
│   │   ├── ProfileSettings.tsx
│   │   ├── NotificationSettings.tsx
│   │   ├── AppearanceSettings.tsx
│   │   ├── PrivacySettings.tsx
│   │   └── HelpSupportSettings.tsx
│   └── *.tsx              # Main page components
├── test/                   # Test setup and examples
│   ├── setup.ts
│   └── example.test.ts
├── types/                  # TypeScript type definitions
│   ├── database.ts         # Supabase database types
│   └── api.ts              # API response types
└── main.tsx                # Application entry point
```

## Database Schema

### Core Tables
- **profiles** - User profiles with display name, avatar, bio
- **categories** - Book categories with slug, description, cover image
- **books** - Book metadata, processing status, ratings, stats
- **book_files** - File storage for PDF/EPUB/MOBI formats
- **characters** - Extracted characters with AI prompts
- **chat_sessions** - User-character chat sessions
- **messages** - Chat messages with role (user/assistant/character)

### User Data Tables
- **user_library** - User's book collection with reading progress
- **user_wishlist** - User's saved books
- **book_purchases** - Purchase history
- **book_ratings** - User ratings (1-5)
- **book_reviews** - User reviews with spoiler flags
- **book_comments** - Threaded comments on books
- **notifications** - User notifications

### Moderation Tables
- **reports** - User-submitted reports
- **user_roles** - Role assignments (user/moderator/admin)
- **audit_logs** - Administrative action logs
- **app_settings** - Application configuration

# Business Manager - Modernized Version

This is a modernized version of the multi-company management suite, upgraded with Next.js, Prisma, PostgreSQL, and React Query while preserving the original UI and functionality.

## Features

- **Multi-company Management**: Manage multiple businesses from a single interface
- **Comprehensive Modules**: Clients, Employees, Products, Suppliers, Sales, Expenses, Reports, and Settings
- **Admin Panel**: Administrative tasks and overview
- **Role-based Access**: Admin and Manager roles with appropriate permissions
- **Real-time Dashboard**: Financial overview with charts and statistics

## Technology Stack

- **Frontend**: Next.js 16 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query for server state management
- **Database**: Prisma ORM with SQLite (can be configured for PostgreSQL)
- **Authentication**: Custom JWT-based authentication
- **Charts**: Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd nextjs-version
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database (using SQLite for local development)
DATABASE_URL="file:./dev.db"

# Authentication
AUTH_SECRET="your-super-secret-auth-key-change-this-in-production"

# Gemini API (if needed)
GEMINI_API_KEY="your-gemini-api-key"
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
├── actions/             # Server actions
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and libraries
├── types.ts             # TypeScript types
└── constants.ts         # Application constants
```

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run start` - Starts the production server
- `npm run seed` - Seeds the database with initial data

## Key Improvements

1. **Modern Framework**: Migrated from Vite to Next.js for better performance and SEO
2. **Database Integration**: Replaced in-memory data with Prisma ORM and SQLite/PostgreSQL
3. **Server State Management**: Implemented React Query for efficient data fetching and caching
4. **Server Actions**: Used Next.js server actions for data mutations
5. **Authentication**: Enhanced authentication system with JWT tokens
6. **Type Safety**: Full TypeScript support throughout the application

## Testing

The application has been tested to ensure all functionality works as expected without regression from the original version.

## Deployment

The application can be deployed to any platform that supports Next.js, such as Vercel, Netlify, or a custom Node.js server.

## License

This project is licensed under the MIT License.
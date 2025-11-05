# Electrotech Management System

Internal management software for electrotechnical companies featuring job scheduling, cost/revenue tracking, employee management, CRM, and offline capabilities.

## Features

✅ **Job Scheduling**: Calendar-based job scheduling with mobile-friendly interface  
✅ **Cost/Revenue Tracking**: Track expenses and revenue per job and overall  
✅ **Employee Management**: Employee profiles, roles, and management  
✅ **Simple CRM**: Customer relationship management  
✅ **Mobile Access**: Fully responsive, mobile-first design  
✅ **Offline Mode**: Works offline with sync when connection restored  
✅ **Data Visualizations**: Dashboards with charts and analytics  

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database)
- **Offline**: Service Workers, IndexedDB (via idb)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Utilities**: date-fns

## Setup

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run migration: `supabase/migrations/001_initial_schema.sql`
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Install dependencies: `npm install`
5. Start development server: `npm run dev`

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Main application routes
│   └── layout.tsx           # Root layout
├── components/              # Reusable React components
├── lib/                     # Utilities and helpers
│   └── supabase/           # Supabase client configuration
├── types/                   # TypeScript definitions
└── supabase/               # Database migrations
```

## User Roles

- **Management**: Full access to all features
- **Electricians**: Field access to assigned jobs, mobile-friendly interface


## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## License

Proprietary - Internal use only

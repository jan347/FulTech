# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be ready (takes ~2 minutes)

## Step 3: Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)

## Step 4: Get Your API Keys

1. In Supabase dashboard, go to **Settings** > **API**
2. Copy your **Project URL**
3. Copy your **anon/public key**

## Step 5: Create Environment File

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 6: Create Your First User

### Option A: Via Supabase Dashboard (Easiest)

1. Go to **Authentication** > **Users** in Supabase dashboard
2. Click **Add User** > **Create new user**
3. Enter email and password
4. Copy the user's **UUID** (user ID)

5. Go to **SQL Editor** and run:
```sql
INSERT INTO public.users (id, email, full_name, role)
VALUES ('paste-user-uuid-here', 'your-email@example.com', 'Your Name', 'management');
```

### Option B: Programmatically

Use Supabase Auth API or the Supabase dashboard to create auth users, then link them to the `users` table as shown above.

## Step 7: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in!

## Troubleshooting

### "Relation does not exist" error
- Make sure you ran the migration SQL in Step 3

### "Invalid API key" error
- Check that your `.env.local` file has the correct values
- Make sure there are no extra spaces or quotes

### Can't log in
- Make sure you created both:
  1. An auth user (in Authentication > Users)
  2. A corresponding entry in the `users` table (via SQL)

### Offline mode not working
- Make sure you're accessing via HTTPS (localhost works, but production needs HTTPS)
- Check browser console for service worker errors

## Next Steps

1. Create more users (management and electricians)
2. Add customers
3. Create your first job
4. Add employees
5. Start tracking costs and revenue!

## Mobile Testing

To test on your phone:
1. Find your computer's IP address (e.g., `192.168.1.100`)
2. Access `http://192.168.1.100:3000` from your phone (same WiFi network)
3. Or use ngrok/tunneling service for external access


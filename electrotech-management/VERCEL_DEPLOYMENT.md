# Vercel Deployment Guide

## Quick Fix Steps

### 1. Set Environment Variables in Vercel

**This is REQUIRED** - Without these, the build will fail.

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. Make sure to set them for **Production**, **Preview**, and **Development** environments
5. Click **Save**

### 2. Verify Root Directory Configuration

The `vercel.json` file in the repository root should have:
```json
{
  "rootDirectory": "electrotech-management"
}
```

### 3. Redeploy

After setting environment variables:
- Push a new commit, OR
- Go to **Deployments** tab and click **Redeploy** on the latest deployment

## Why This Was Needed

The NOT_FOUND error occurred because:

1. **Missing Environment Variables**: During build, Next.js tries to prerender pages. When it encounters Supabase client initialization without environment variables, the build fails.

2. **Build Failure**: When the build fails, Vercel can't create the deployment output, resulting in a NOT_FOUND error.

3. **Root Directory**: The `vercel.json` tells Vercel where your Next.js app is located (in the `electrotech-management` subdirectory).

## What We Fixed

1. ✅ Added `vercel.json` with correct root directory
2. ✅ Made server-side pages dynamic (`export const dynamic = 'force-dynamic'`) to prevent build-time prerendering errors
3. ✅ Documented environment variable setup

## After Deployment

Once deployed successfully:
1. Verify your Supabase project is set up (run migrations)
2. Test the login page
3. Create your first user in Supabase Auth + database

## Troubleshooting

### Still getting NOT_FOUND?
- Check Vercel build logs for errors
- Verify environment variables are set correctly (no extra spaces/quotes)
- Ensure `vercel.json` is in the repository root (not in `electrotech-management/`)

### Build succeeds but app shows errors?
- Check browser console for runtime errors
- Verify Supabase URL and keys are correct
- Ensure database migrations have been run


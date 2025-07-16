# GRND - Fitness Tracking App

Track the grind. Build the body.

## Authentication Setup with Supabase

This project uses Supabase for authentication. Follow these steps to set up authentication:

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Note your project URL and anon/public key (you'll need these for environment variables)

### 2. Configure Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Configure Authentication Providers

1. In the Supabase dashboard, go to Authentication > Providers
2. Enable Email provider
3. Configure any additional providers you want (Google, GitHub, etc.)
4. Set your site URL and redirect URLs:
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: 
     - `http://localhost:3000/auth/callback`
     - Your production URLs when deployed

### 4. Configure Email Templates (Optional)

1. In the Supabase dashboard, go to Authentication > Email Templates
2. Customize the templates for:
   - Confirmation email
   - Invitation email
   - Magic link email
   - Reset password email

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication Flow

The authentication system includes:

- Sign up with email/password
- Sign in with email/password
- Password reset
- Protected routes
- User profile management

## Project Structure

- `/app/auth/` - Authentication pages and components
- `/lib/supabase/` - Supabase client configuration
- `/lib/hooks/` - Custom hooks including authentication
- `/middleware.ts` - Auth middleware for protected routes

## Deployment

When deploying to production:

1. Update your Supabase project's Site URL and Redirect URLs
2. Set the environment variables in your hosting provider
3. Deploy your application

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

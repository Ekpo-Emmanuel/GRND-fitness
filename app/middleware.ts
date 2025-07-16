import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Skip middleware for non-HTML requests and static files
  if (
    !path.endsWith('/') &&
    !path.includes('.') &&
    !path.startsWith('/_next') &&
    !path.startsWith('/api')
  ) {
    // Create a Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // We're not setting cookies in middleware
          },
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    
    // If user is authenticated and not on onboarding page, check if onboarding is complete
    if (
      session &&
      !path.startsWith('/onboarding') &&
      !path.startsWith('/auth') &&
      path !== '/'
    ) {
      // Fetch user profile from Convex API
      const response = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/query?name=users:isOnboardingComplete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          args: { userId: session.user.id },
        }),
      });
      
      if (response.ok) {
        const { result: isComplete } = await response.json();
        
        // If onboarding is not complete, redirect to onboarding
        if (!isComplete) {
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }
      }
    }
  }
  
  return NextResponse.next();
} 
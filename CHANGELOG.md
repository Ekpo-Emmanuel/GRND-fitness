# Changelog

All notable changes to the GRND project will be documented in this file.

## [Unreleased]

### Features Added
- Initial project setup with Next.js
- Tailwind CSS integration
- Responsive layout foundation
- Authentication system with Supabase
- User onboarding with name, age, height, weight
- Training days + muscle focus setup
- Dashboard showing today's split
- Start workout screen with exercise logging UI
- Customizable workout setup with day and muscle group selection
- Exercise selection from predefined lists for each muscle group
- Enhanced workout logging UI with collapsible sections and progress tracking

### Pages Created
- Home page (`/`) with conditional rendering based on auth status
- Dashboard page (`/dashboard`) - protected route for authenticated users
- Onboarding flow (`/onboarding`) - 4-step process for new users
- Workout setup page (`/workout/setup`) - for selecting day and muscle groups
- Exercise selection page (`/workout/exercises`) - for choosing exercises for each muscle group
- Workout page (`/workout/new`) - for logging exercises and sets
- Progress page (`/progress`) - for tracking workout history
- Profile page (`/profile`) - for user account management
- Auth pages:
  - Sign In (`/auth/signin`)
  - Sign Up (`/auth/signup`)
  - Forgot Password (`/auth/forgot-password`)
  - Reset Password (`/auth/reset-password`)
  - Profile (`/auth/profile`)
  - Auth Error (`/auth/error`)
  - Auth Callback (`/auth/callback`)

### Logic and Data Flow
- Implemented Supabase authentication
- Redirect un-onboarded users to onboarding flow
- Fetch muscle groups for today's training day
- Dynamic exercise and set management
- Workout data structure with muscle groups, exercises, and sets
- Customizable workout creation with day and muscle group selection
- Exercise database with common exercises for each muscle group
- Session storage for workout setup data and selected exercises
- Progress tracking with completion percentage and volume calculation

### Auth-Related Changes
- Created auth components:
  - SignInForm
  - SignUpForm
  - ForgotPasswordForm
  - ResetPasswordForm
  - UserProfile
  - SignOutButton
  - ProtectedRoute
- Added auth middleware for protected routes
- Set up server-side and client-side Supabase clients
- Implemented auth context provider
- Added auth utility functions (getSession, getUserDetails, requireAuth)
- Configured email/password authentication flow
- Added session management and refresh

### Developer Experience
- Added README with setup instructions
- Added environment variable type definitions
- Created database types for Supabase
- Set up Convex schema for user profiles

## [0.1.0] - Initial Setup

- Project initialization with Next.js
- Basic folder structure setup
- Git repository initialization 
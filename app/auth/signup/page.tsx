import Link from 'next/link';
import SignUpForm from '../components/SignUpForm';
import { ChevronLeft } from 'lucide-react';
import Logo from '@/components/logo';

export const metadata = {
  title: 'Sign Up | GRND',
  description: 'Create a new GRND account',
};

export default function SignUpPage() {
  return (
    <>
      <div className="h-screen flex items-start justify-center bg-background-dark py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="">
            <Logo className="text-2xl" />
            <h2 className="text-xl tracking-[-0.16px] font-bold mt-6">
              Create an GRND account
            </h2>
            <p className="text-text-white-dark/60 text-sm">
                Already have an account?{" "}
                <Link href="/sign-in" className="font-medium text-blue-500 hover:text-primary/90">
                  Log in
                </Link>
            </p>
          </div>
          
          <SignUpForm />
        </div>
      </div>
    </>
  );
} 
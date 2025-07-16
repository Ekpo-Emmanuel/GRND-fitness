'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import TrainingDaysStep from './components/TrainingDaysStep';
import MuscleGroupStep from './components/MuscleGroupStep';
import BasicInfoStep from './components/BasicInfoStep';
import ConfirmationStep from './components/ConfirmationStep';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    trainingDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    muscleFocus: [] as string[],
  });

  const userProfile = useQuery(api.users.getProfile, 
    user?.id ? { userId: user.id } : 'skip'
  );
  const updateProfile = useMutation(api.users.updateProfile);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  useEffect(() => {
    // If user is already onboarded, redirect to dashboard
    if (userProfile?.onboardingComplete) {
      router.push('/dashboard');
    }
    
    // Pre-fill data if available
    if (userProfile) {
      setOnboardingData(prev => ({
        ...prev,
        name: userProfile.name || user?.email?.split('@')[0] || '',
        age: userProfile.age?.toString() || '',
        height: userProfile.height?.toString() || '',
        weight: userProfile.weight?.toString() || '',
        trainingDays: userProfile.trainingDays || prev.trainingDays,
        muscleFocus: userProfile.muscleFocus || [],
      }));
    }
  }, [userProfile, user, router]);

  const handleNext = async () => {
    if (currentStep < 4) {
      // Save current step data
      if (currentStep === 1) {
        await updateProfile({
          userId: user?.id || '',
          name: onboardingData.name,
          age: parseInt(onboardingData.age),
          height: onboardingData.height ? parseFloat(onboardingData.height) : undefined,
          weight: onboardingData.weight ? parseFloat(onboardingData.weight) : undefined,
        });
      } else if (currentStep === 2) {
        await updateProfile({
          userId: user?.id || '',
          trainingDays: onboardingData.trainingDays,
        });
      } else if (currentStep === 3) {
        await updateProfile({
          userId: user?.id || '',
          muscleFocus: onboardingData.muscleFocus,
        });
      }
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and redirect to dashboard
      if (user?.id) {
        await completeOnboarding({ userId: user.id });
        router.push('/dashboard');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (data: Partial<typeof onboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Welcome to GRND</h1>
          <p className="text-gray-600 text-center">Let's set up your profile</p>
        </div>
        
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === currentStep 
                      ? 'bg-blue-500 text-white' 
                      : step < currentStep 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                <div className="text-xs mt-1 text-gray-500">
                  {step === 1 && 'Info'}
                  {step === 2 && 'Days'}
                  {step === 3 && 'Focus'}
                  {step === 4 && 'Review'}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 h-1 w-full bg-gray-200 rounded"></div>
            <div 
              className="absolute top-0 h-1 bg-blue-500 rounded transition-all duration-300" 
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Step content */}
        <div className="mb-8">
          {currentStep === 1 && (
            <BasicInfoStep data={onboardingData} updateData={updateData} />
          )}
          {currentStep === 2 && (
            <TrainingDaysStep data={onboardingData} updateData={updateData} />
          )}
          {currentStep === 3 && (
            <MuscleGroupStep data={onboardingData} updateData={updateData} />
          )}
          {currentStep === 4 && (
            <ConfirmationStep data={onboardingData} />
          )}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-md ${
              currentStep === 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {currentStep === 4 ? 'Build My Plan' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
} 
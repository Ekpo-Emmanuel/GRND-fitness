'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardDescription, CardTitle, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Dumbbell, ArrowRight, ArrowLeft, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Suspense } from 'react';

// Predefined muscle groups
const ALL_MUSCLE_GROUPS = [
  { name: 'chest' },
  { name: 'back' },
  { name: 'shoulders' },
  { name: 'biceps' },
  { name: 'triceps' },
  { name: 'legs' },
  { name: 'glutes' },
  { name: 'abs' },
  { name: 'calves' }
];

// Define exercise database by muscle group
const exerciseDatabase: Record<string, string[]> = {
  chest: [
    "Bench Press",
    "Incline Bench Press",
    "Decline Bench Press",
    "Dumbbell Fly",
    "Cable Crossover",
    "Chest Dip",
    "Push-Up",
    "Machine Chest Press",
    "Pec Deck",
    "Landmine Press"
  ],
  back: [
    "Pull-Up",
    "Lat Pulldown",
    "Bent Over Row",
    "T-Bar Row",
    "Seated Cable Row",
    "Deadlift",
    "Single-Arm Dumbbell Row",
    "Face Pull",
    "Straight-Arm Pulldown",
    "Inverted Row"
  ],
  shoulders: [
    "Overhead Press",
    "Lateral Raise",
    "Front Raise",
    "Reverse Fly",
    "Upright Row",
    "Arnold Press",
    "Face Pull",
    "Shrug",
    "Military Press",
    "Pike Push-Up"
  ],
  arms: [
    "Bicep Curl",
    "Tricep Extension",
    "Hammer Curl",
    "Skull Crusher",
    "Preacher Curl",
    "Cable Pushdown",
    "Concentration Curl",
    "Dip",
    "Chin-Up",
    "Close-Grip Bench Press"
  ],
  legs: [
    "Squat",
    "Deadlift",
    "Leg Press",
    "Lunge",
    "Leg Extension",
    "Leg Curl",
    "Calf Raise",
    "Romanian Deadlift",
    "Hip Thrust",
    "Bulgarian Split Squat"
  ],
  core: [
    "Plank",
    "Crunch",
    "Russian Twist",
    "Leg Raise",
    "Mountain Climber",
    "Ab Rollout",
    "Hanging Leg Raise",
    "Side Plank",
    "Bicycle Crunch",
    "Dead Bug"
  ],
  fullBody: [
    "Burpee",
    "Clean and Press",
    "Thruster",
    "Turkish Get-Up",
    "Kettlebell Swing",
    "Medicine Ball Slam",
    "Battle Rope",
    "Mountain Climber",
    "Jumping Jack",
    "Bear Crawl"
  ]
};

// Map from muscle group names to exercise database keys
const muscleGroupToExerciseKey: Record<string, string> = {
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  biceps: 'arms',
  triceps: 'arms',
  legs: 'legs',
  glutes: 'legs',
  abs: 'core',
  calves: 'legs',
  fullBody: 'fullBody'
};

// Muscle group labels for display
const muscleGroupLabels: Record<string, string> = {
  chest: 'Chest',
  back: 'Back',
  arms: 'Arms',
  legs: 'Legs',
  core: 'Core',
  shoulders: 'Shoulders',
  fullBody: 'Full Body',
  biceps: 'Biceps',
  triceps: 'Triceps',
  glutes: 'Glutes',
  abs: 'Abs',
  calves: 'Calves'
};

// Types
interface WorkoutSetup {
  day: string;
  muscleGroups: string[];
  notes: string;
  timestamp: string;
  startTime: number;
}

interface SelectedExercises {
  [muscleGroup: string]: string[];
}

// Step 1: Muscle Group Selection Component
function MuscleGroupSelection({
  selectedMuscleGroups,
  setSelectedMuscleGroups,
  notes,
  setNotes,
  onNext,
  userHasSelectedGroups,
  setUserHasSelectedGroups
}: {
  selectedMuscleGroups: string[];
  setSelectedMuscleGroups: (groups: string[]) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onNext: () => void;
  userHasSelectedGroups: boolean;
  setUserHasSelectedGroups: (value: boolean) => void;
}) {
  // Get today's day of the week
  const today = new Date();
  
  // Handle muscle group selection
  const toggleMuscleGroup = (group: string) => {
    // Normalize the group name to lowercase for consistency
    const normalizedGroup = group.toLowerCase();
    
    // If this is the user's first manual selection, clear the profile-loaded groups
    if (!userHasSelectedGroups) {
      setUserHasSelectedGroups(true);
      
      // If the user is selecting the same group that was pre-loaded, keep just that one
      if (selectedMuscleGroups.includes(normalizedGroup)) {
        setSelectedMuscleGroups([normalizedGroup]);
        return;
      }
      
      // Otherwise, start fresh with just this new selection
      setSelectedMuscleGroups([normalizedGroup]);
      return;
    }
    
    // After the first selection, handle normally
    const updatedGroups = [...selectedMuscleGroups];
    
    if (updatedGroups.includes(normalizedGroup)) {
      // Remove the group if it exists
      setSelectedMuscleGroups(updatedGroups.filter(g => g !== normalizedGroup));
    } else {
      // Check if we have any case variations of this group already selected
      const similarIndex = updatedGroups.findIndex(g => g.toLowerCase() === normalizedGroup);
      
      if (similarIndex >= 0) {
        // Replace the existing one with our normalized version
        updatedGroups[similarIndex] = normalizedGroup;
        setSelectedMuscleGroups(updatedGroups);
      } else {
        // Add the new group
        setSelectedMuscleGroups([...updatedGroups, normalizedGroup]);
      }
    }
  };

  return (
    <Card className="flex flex-col border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-blue-600" />
          Select Muscle Groups
        </CardTitle>
        <CardDescription>Choose the muscle groups you want to train today</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pb-4">
        <div className="grid grid-cols-3 gap-2">
          {ALL_MUSCLE_GROUPS.map(group => (
            <button
              key={group.name}
              onClick={() => toggleMuscleGroup(group.name)}
              className={`px-3 py-2 text-sm rounded-md text-center transition-colors ${selectedMuscleGroups.includes(group.name)
                ? 'bg-blue-100 text-blue-800 border border-blue-300 shadow-sm'
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
            >
              {group.name.charAt(0).toUpperCase() + group.name.slice(1)}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Workout Notes <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-sm"
            rows={3}
            placeholder="How are you feeling today? Any specific goals?"
          />
        </div>

        <div className="flex space-x-3 w-full mt-4">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
          >
            Cancel
          </Button>
          <Button
            onClick={onNext}
            disabled={selectedMuscleGroups.length === 0}
            className="flex-1 items-center justify-center gap-2"
          >
            <span>Continue to Exercises</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="pb-4 flex flex-col gap-4">
        
        
        {selectedMuscleGroups.length === 0 && (
          <p className="text-center text-sm text-amber-600">
            Please select at least one muscle group to continue
          </p>
        )}
      </CardFooter>
    </Card>
  );
}

// Step 2: Exercise Selection Component
function ExerciseSelection({
  workoutSetup,
  selectedExercises,
  setSelectedExercises,
  onBack,
  onNext
}: {
  workoutSetup: WorkoutSetup;
  selectedExercises: SelectedExercises;
  setSelectedExercises: (exercises: SelectedExercises) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [customExercise, setCustomExercise] = useState<{[key: string]: string}>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // Initialize state on mount
  useEffect(() => {
    // Initialize custom exercise inputs
    const initialCustom: {[key: string]: string} = {};
    workoutSetup.muscleGroups.forEach(group => {
      initialCustom[group] = '';
    });
    setCustomExercise(initialCustom);
    
    // Initialize all groups as expanded
    const initialExpandedState: Record<string, boolean> = {};
    workoutSetup.muscleGroups.forEach(group => {
      initialExpandedState[group] = true;
    });
    setExpandedGroups(initialExpandedState);
  }, [workoutSetup.muscleGroups]);
  
  const toggleExercise = (muscleGroup: string, exercise: string) => {
    const currentSelected = selectedExercises[muscleGroup] || [];
    
    if (currentSelected.includes(exercise)) {
      // Remove exercise if already selected
      const updated = {
        ...selectedExercises,
        [muscleGroup]: currentSelected.filter(ex => ex !== exercise)
      };
      setSelectedExercises(updated);
    } else {
      // Add exercise if not selected
      const updated = {
        ...selectedExercises,
        [muscleGroup]: [...currentSelected, exercise]
      };
      setSelectedExercises(updated);
    }
  };
  
  // Toggle muscle group expansion
  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };
  
  const addCustomExercise = (muscleGroup: string) => {
    if (customExercise[muscleGroup]?.trim()) {
      // Add the custom exercise
      const updated = {
        ...selectedExercises,
        [muscleGroup]: [...(selectedExercises[muscleGroup] || []), customExercise[muscleGroup].trim()]
      };
      setSelectedExercises(updated);
      
      // Clear the input
      setCustomExercise({
        ...customExercise,
        [muscleGroup]: ''
      });
    }
  };
  
  // Check if all muscle groups have at least one exercise selected
  const isValid = workoutSetup.muscleGroups.every(group => 
    selectedExercises[group] && selectedExercises[group].length > 0
  );

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <div className="flex items-center space-x-2 mb-1">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-1 px-0 text-black"
              size="icon"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          <h1 className="text-2xl font-bold text-gray-900">Select Exercises</h1>
        </div>
        <p className="text-gray-500 text-sm">
          {workoutSetup.day} - {new Date(workoutSetup.timestamp).toLocaleDateString()}
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Choose exercises for each muscle group in your workout
        </p>
      </header>
      
      {/* Summary card */}
      <div className="mb-6 bg-white rounded-xl shadow-sm p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-medium text-gray-700">Exercise Selection</h2>
          <span className="text-sm font-bold text-blue-600">
            {Object.values(selectedExercises).reduce((sum, exercises) => sum + exercises.length, 0)} selected
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {workoutSetup.muscleGroups.map(group => (
            <button
              key={group}
              onClick={() => {
                toggleGroupExpansion(group);
                // Scroll to the group
                document.getElementById(`group-${group}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                selectedExercises[group]?.length > 0
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {muscleGroupLabels[group] || group.charAt(0).toUpperCase() + group.slice(1)}: {selectedExercises[group]?.length || 0}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-6 mb-20">
        {workoutSetup.muscleGroups.map(muscleGroup => (
          <div key={muscleGroup} id={`group-${muscleGroup}`} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div 
              className="p-4 bg-blue-50 border-b border-blue-100 cursor-pointer"
              onClick={() => toggleGroupExpansion(muscleGroup)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-blue-800 flex items-center">
                    {muscleGroupLabels[muscleGroup] || muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1)} Exercises
                    {selectedExercises[muscleGroup]?.length === 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Required
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-blue-600 mt-1">
                    Selected: {selectedExercises[muscleGroup]?.length || 0} exercises
                  </p>
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 text-blue-600 transition-transform ${expandedGroups[muscleGroup] ? 'transform rotate-180' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {expandedGroups[muscleGroup] && (
              <div className="p-4">
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {exerciseDatabase[muscleGroupToExerciseKey[muscleGroup]]?.map(exercise => (
                    <button
                      key={exercise}
                      onClick={() => toggleExercise(muscleGroup, exercise)}
                      className={`p-3 text-left rounded-lg flex items-center ${
                        selectedExercises[muscleGroup]?.includes(exercise)
                          ? 'bg-blue-100 border border-blue-300 text-blue-700'
                          : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3">
                        {selectedExercises[muscleGroup]?.includes(exercise) ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                      </span>
                      {exercise}
                    </button>
                  ))}
                  
                  {(!exerciseDatabase[muscleGroupToExerciseKey[muscleGroup]] || 
                    exerciseDatabase[muscleGroupToExerciseKey[muscleGroup]]?.length === 0) && (
                    <div className="p-4 text-center bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600">No predefined exercises available for {muscleGroup}.</p>
                      <p className="text-sm text-gray-500 mt-1">Please add custom exercises below.</p>
                    </div>
                  )}
                </div>
                
                {/* Custom exercise input */}
                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={customExercise[muscleGroup] || ''}
                      onChange={(e) => setCustomExercise(prev => ({
                        ...prev,
                        [muscleGroup]: e.target.value
                      }))}
                      placeholder="Add custom exercise..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addCustomExercise(muscleGroup);
                        }
                      }}
                    />
                    <button
                      onClick={() => addCustomExercise(muscleGroup)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                {/* Show selected custom exercises */}
                {selectedExercises[muscleGroup]?.filter(ex => {
                  const dbKey = muscleGroupToExerciseKey[muscleGroup];
                  return !dbKey || !exerciseDatabase[dbKey]?.includes(ex);
                }).length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Custom Exercises</h3>
                    <div className="space-y-2">
                      {selectedExercises[muscleGroup]
                        .filter(ex => {
                          const dbKey = muscleGroupToExerciseKey[muscleGroup];
                          return !dbKey || !exerciseDatabase[dbKey]?.includes(ex);
                        })
                        .map(customEx => (
                          <div 
                            key={customEx} 
                            className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200"
                          >
                            <span>{customEx}</span>
                            <button 
                              onClick={() => toggleExercise(muscleGroup, customEx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">
              Total exercises: {Object.values(selectedExercises).reduce((sum, exercises) => sum + exercises.length, 0)}
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
                  window.location.href = '/dashboard';
                }
              }}
              className="bg-red-100 text-red-700 hover:bg-red-200"
            >
              Cancel
            </Button>
            <Button
              onClick={onNext}
              disabled={!isValid}
              className="flex-1 items-center justify-center gap-2"
            >
              <span>Start Workout</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* {!isValid && (
            <p className="text-center text-sm text-amber-600 mt-2">
              Please select at least one exercise for each muscle group
            </p>
          )} */}
        </div>
      </div>
    </div>
  );
}

// Main Component
function WorkoutSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercises>({});
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [userHasSelectedGroups, setUserHasSelectedGroups] = useState(false);

  // Check if coming from "Today's Workout" context
  const fromTodaysWorkout = searchParams.get('from') === 'todaysWorkout';

  // Get user profile from Convex
  const userProfile = useQuery(api.users.getProfile,
    user?.id ? { userId: user.id } : 'skip'
  );

  // Get today's day of the week
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Create workout mutation
  const createWorkout = useMutation(api.workouts.createWorkout);

  // Initialize selected muscle groups based on user profile
  useEffect(() => {
    // Only load profile data if the user hasn't made any manual selections yet
    // AND they came from the "Today's Workout" context
    if (userProfile && !userHasSelectedGroups && fromTodaysWorkout) {
      // Get muscle groups for today based on user's profile
      const todayMuscleGroups = userProfile?.muscleFocus || [];
      
      if (userProfile?.trainingDays?.[dayOfWeek as keyof typeof userProfile.trainingDays] && 
          todayMuscleGroups.length > 0) {
        // Only set muscle groups if today is a training day and there are muscle groups defined
        setSelectedMuscleGroups([...todayMuscleGroups]);
      }
    }
  }, [userProfile, dayOfWeek, userHasSelectedGroups, fromTodaysWorkout]);

  // Initialize selected exercises when muscle groups change
  useEffect(() => {
    const initialSelected: SelectedExercises = {};
    selectedMuscleGroups.forEach(group => {
      initialSelected[group] = [];
    });
    setSelectedExercises(initialSelected);
  }, [selectedMuscleGroups]);

  // Handle moving to exercise selection
  const handleContinueToExercises = () => {
    setStep(2);
  };

  // Handle going back to muscle group selection
  const handleBackToMuscleGroups = () => {
    setStep(1);
  };

  // Handle starting the workout
  const handleStartWorkout = () => {
    if (!user?.id) return;

    setIsCreating(true);

    try {
      // Create workout setup object
      const workoutSetup = {
        day: today.toLocaleDateString('en-US', { weekday: 'long' }),
        muscleGroups: selectedMuscleGroups,
        notes: notes,
        timestamp: today.toISOString(),
        startTime: Date.now()
      };

      // Navigate to workout page
      router.push('/workout/new');

      // Store data in localStorage (this is temporary until we implement proper state management)
      localStorage.setItem('workoutSetup', JSON.stringify(workoutSetup));
      localStorage.setItem('selectedExercises', JSON.stringify(selectedExercises));
      
    } catch (error) {
      console.error('Error setting up workout:', error);
      alert('Failed to set up workout. Please try again.');
      setIsCreating(false);
    }
  };

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Workout setup object
  const workoutSetup: WorkoutSetup = {
    day: today.toLocaleDateString('en-US', { weekday: 'long' }),
    muscleGroups: selectedMuscleGroups,
    notes: notes,
    timestamp: today.toISOString(),
    startTime: Date.now()
  };

  return (
    <div className="min-h-screen bg-gray-50" key="workout-setup-page">
      <div className="max-w-md mx-auto px-4 py-8 pb-24">
        {step === 1 && (
    <>
            <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Workout</h1>
            <p className="text-gray-600 text-sm mt-1">
              {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </header>

            <MuscleGroupSelection 
              selectedMuscleGroups={selectedMuscleGroups}
              setSelectedMuscleGroups={setSelectedMuscleGroups}
              notes={notes}
              setNotes={setNotes}
              onNext={handleContinueToExercises}
              userHasSelectedGroups={userHasSelectedGroups}
              setUserHasSelectedGroups={setUserHasSelectedGroups}
            />
          </>
        )}
        
        {step === 2 && (
          <ExerciseSelection 
            workoutSetup={workoutSetup}
            selectedExercises={selectedExercises}
            setSelectedExercises={setSelectedExercises}
            onBack={handleBackToMuscleGroups}
            onNext={handleStartWorkout}
          />
        )}
      </div>
    </div>
  );
}

export default function WorkoutSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <WorkoutSetupContent />
    </Suspense>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import Link from 'next/link';

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

export default function ExerciseSelectionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [workoutSetup, setWorkoutSetup] = useState<WorkoutSetup | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercises>({});
  const [customExercise, setCustomExercise] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
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
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }
    
    // Check if we have workout setup data
    if (typeof window !== 'undefined') {
      // Clear any existing selected exercises data first
      localStorage.removeItem('selectedExercises');
      
      const setupData = localStorage.getItem('workoutSetup');
      
      if (!setupData) {
        // No setup data, redirect to setup page
        router.push('/workout/setup');
        return;
      }
      
      try {
        const parsedSetup = JSON.parse(setupData) as WorkoutSetup;
        setWorkoutSetup(parsedSetup);
        
        // Initialize selected exercises object
        const initialSelected: SelectedExercises = {};
        parsedSetup.muscleGroups.forEach(group => {
          initialSelected[group] = [];
        });
        setSelectedExercises(initialSelected);
        
        // Initialize custom exercise inputs
        const initialCustom: {[key: string]: string} = {};
        parsedSetup.muscleGroups.forEach(group => {
          initialCustom[group] = '';
        });
        setCustomExercise(initialCustom);
        
        // Initialize all groups as expanded
        const initialExpandedState: Record<string, boolean> = {};
        parsedSetup.muscleGroups.forEach(group => {
          initialExpandedState[group] = true;
        });
        setExpandedGroups(initialExpandedState);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing workout setup data:', error);
        router.push('/workout/setup');
      }
    }
  }, [user, authLoading, router]);
  
  const toggleExercise = (muscleGroup: string, exercise: string) => {
    setSelectedExercises(prev => {
      const currentSelected = prev[muscleGroup] || [];
      
      if (currentSelected.includes(exercise)) {
        // Remove exercise if already selected
        return {
          ...prev,
          [muscleGroup]: currentSelected.filter(ex => ex !== exercise)
        };
      } else {
        // Add exercise if not selected
        return {
          ...prev,
          [muscleGroup]: [...currentSelected, exercise]
        };
      }
    });
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
      setSelectedExercises(prev => ({
        ...prev,
        [muscleGroup]: [...(prev[muscleGroup] || []), customExercise[muscleGroup].trim()]
      }));
      
      // Clear the input
      setCustomExercise(prev => ({
        ...prev,
        [muscleGroup]: ''
      }));
    }
  };
  
  const continueToWorkout = () => {
    // Check if at least one exercise is selected for each muscle group
    const isValid = workoutSetup?.muscleGroups.every(group => 
      selectedExercises[group] && selectedExercises[group].length > 0
    );
    
    if (!isValid) {
      alert('Please select at least one exercise for each muscle group');
      return;
    }
    
    // Store selected exercises in local storage
    localStorage.setItem('selectedExercises', JSON.stringify(selectedExercises));
    
    // Navigate to workout page
    router.push('/workout/new');
  };
  
  if (authLoading || isLoading || !workoutSetup) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Select Exercises</h1>
            <Link 
              href="/workout/setup" 
              className="text-blue-600 text-sm hover:underline flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Setup
            </Link>
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
                    {exerciseDatabase[muscleGroupToExerciseKey[muscleGroup]]?.map((exercise: string) => (
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
              <Link
                href="/workout/setup"
                className="py-3 px-4 bg-gray-200 rounded-lg text-gray-800 font-medium text-center hover:bg-gray-300"
              >
                Back
              </Link>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
                    // Clear local storage
                    localStorage.removeItem('workoutSetup');
                    localStorage.removeItem('selectedExercises');
                    localStorage.removeItem('workoutNotes');
                    // Navigate to dashboard
                    router.push('/dashboard');
                  }
                }}
                className="py-3 px-4 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={continueToWorkout}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                Continue to Workout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
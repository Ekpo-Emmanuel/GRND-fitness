'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import BottomNav from '@/app/components/BottomNav';
import { ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Exercise {
  id: string;
  name: string;
  sets: {
    id: string;
    reps: string;
    weight: string;
  }[];
  notes?: string;
}

interface MuscleGroup {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface ExerciseSuggestion {
  name: string;
  muscleGroup: string;
}

export default function CreateTemplatePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [targetDay, setTargetDay] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exerciseName, setExerciseName] = useState('');
  
  // Create template mutation
  const createTemplate = useMutation(api.workouts.createWorkoutTemplate);
  
  // Exercise suggestions - using mock data since the API endpoint doesn't exist
  const exerciseSuggestions: ExerciseSuggestion[] = selectedMuscleGroup ? getMockExerciseSuggestions(selectedMuscleGroup) : [];
  
  // Days of the week
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Predefined muscle groups
  const predefinedMuscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
    'Legs', 'Glutes', 'Abs', 'Calves'
  ];
  
  // Mock exercise suggestions function
  function getMockExerciseSuggestions(muscleGroup: string): ExerciseSuggestion[] {
    const suggestions: Record<string, string[]> = {
      'chest': ['Bench Press', 'Incline Bench Press', 'Chest Fly', 'Push-ups', 'Dips'],
      'back': ['Pull-ups', 'Lat Pulldown', 'Bent Over Row', 'Deadlift', 'T-Bar Row'],
      'shoulders': ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Face Pull', 'Upright Row'],
      'biceps': ['Bicep Curl', 'Hammer Curl', 'Preacher Curl', 'Chin-ups', 'Concentration Curl'],
      'triceps': ['Tricep Pushdown', 'Skull Crushers', 'Tricep Kickback', 'Close-Grip Bench Press', 'Dips'],
      'legs': ['Squat', 'Leg Press', 'Lunges', 'Leg Extension', 'Leg Curl'],
      'glutes': ['Hip Thrust', 'Glute Bridge', 'Bulgarian Split Squat', 'Deadlift', 'Cable Kickback'],
      'abs': ['Crunches', 'Leg Raises', 'Plank', 'Russian Twist', 'Ab Rollout'],
      'calves': ['Calf Raise', 'Seated Calf Raise', 'Donkey Calf Raise', 'Jump Rope', 'Box Jumps']
    };
    
    const group = muscleGroup.toLowerCase();
    const exercises = suggestions[group] || [];
    
    return exercises.map(name => ({
      name,
      muscleGroup: group
    }));
  }
  
  // Add muscle group
  const addMuscleGroup = (name: string) => {
    const id = name.toLowerCase().replace(/\s/g, '-');
    
    // Check if muscle group already exists
    if (muscleGroups.some(group => group.id === id)) {
      return;
    }
    
    setMuscleGroups([
      ...muscleGroups,
      {
        id,
        name,
        exercises: []
      }
    ]);
  };
  
  // Remove muscle group
  const removeMuscleGroup = (id: string) => {
    setMuscleGroups(muscleGroups.filter(group => group.id !== id));
  };
  
  // Open add exercise modal
  const openAddExerciseModal = (muscleGroupId: string) => {
    setSelectedMuscleGroup(muscleGroupId);
    setSelectedExercises([]);
    setExerciseName('');
    setShowAddExerciseModal(true);
  };
  
  // Toggle exercise selection
  const toggleExerciseSelection = (exerciseName: string) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseName)) {
        return prev.filter(name => name !== exerciseName);
      } else {
        return [...prev, exerciseName];
      }
    });
  };
  
  // Add exercise to muscle group
  const addExercise = () => {
    if (!selectedMuscleGroup || selectedExercises.length === 0) return;
    
    const updatedMuscleGroups = muscleGroups.map(group => {
      if (group.id === selectedMuscleGroup) {
        return {
          ...group,
          exercises: [
            ...group.exercises,
            ...selectedExercises.map(name => ({
              id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
              name: name,
              sets: [{ id: '1', reps: '10', weight: '' }],
              notes: ''
            }))
          ]
        };
      }
      return group;
    });
    
    setMuscleGroups(updatedMuscleGroups);
    setShowAddExerciseModal(false);
  };
  
  // Remove exercise
  const removeExercise = (muscleGroupId: string, exerciseId: string) => {
    const updatedMuscleGroups = muscleGroups.map(group => {
      if (group.id === muscleGroupId) {
        return {
          ...group,
          exercises: group.exercises.filter(exercise => exercise.id !== exerciseId)
        };
      }
      return group;
    });
    
    setMuscleGroups(updatedMuscleGroups);
  };
  
  // Handle template creation
  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    setIsCreating(true);
    
    try {
      if (!user?.id) return;
      
      // Create a new template with exercises
      await createTemplate({
        userId: user.id,
        name: templateName,
        description: description,
        targetDay: targetDay || undefined,
        muscleGroups: muscleGroups
      });
      
      // Navigate back to templates page
      router.push('/templates');
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
    } finally {
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8 pb-24">
        <header className="mb-6">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()}
              className="mr-3 p-2 rounded-full hover:bg-gray-200"
            >
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">New Template</h1>
          </div>
          <p className="text-gray-600 text-sm ml-10">Create a custom workout template</p>
        </header>
        
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="space-y-6">
            {/* Template name */}
            <div>
              <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-2">
                Template Name*
              </label>
              <Input
                id="templateName"
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Push Day, Leg Day, Full Body"
                className="text-black"
              />
            </div>
            
            {/* Description */}
            <div> 
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about this template"
                className="text-black"
                rows={3}
              />
            </div>
            
            {/* Target day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Day (Optional)
              </label>
              <div className="grid grid-cols-7 gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setTargetDay(targetDay === day ? '' : day)}
                    className={`p-2 rounded-md flex items-center justify-center ${
                      targetDay === day
                        ? 'bg-blue-100 border border-blue-300 text-blue-800'
                        : 'bg-gray-50 border border-gray-200 text-gray-700'
                    }`}
                  >
                    {day.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {targetDay 
                  ? `This template will be suggested on ${targetDay.charAt(0).toUpperCase() + targetDay.slice(1)}s` 
                  : 'No specific day selected'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Muscle Groups and Exercises */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Muscle Groups & Exercises</h2>
          
          {/* Add Muscle Group */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Muscle Group
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {predefinedMuscleGroups.map(group => (
                <button
                  key={group}
                  onClick={() => addMuscleGroup(group)}
                  className={`py-1 px-3 text-sm rounded-full ${
                    muscleGroups.some(g => g.name === group)
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
          
          {/* Muscle Groups List */}
          {muscleGroups.length > 0 ? (
            <div className="space-y-4">
              {muscleGroups.map(group => (
                <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">{group.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openAddExerciseModal(group.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Add exercise"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeMuscleGroup(group.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Remove muscle group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {group.exercises.length > 0 ? (
                    <div className="p-3">
                      <div className="space-y-3">
                        {group.exercises.map(exercise => (
                          <div key={exercise.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium text-sm">{exercise.name}</div>
                              <button
                                onClick={() => removeExercise(group.id, exercise.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Remove exercise"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            
                            <div className="flex text-xs text-gray-600 space-x-4">
                              {/* <div>Sets: {exercise.sets.length}</div>
                              {exercise.sets[0]?.reps && (
                                <div>Reps: {exercise.sets[0].reps}</div>
                              )} */}
                              {exercise.sets[0]?.weight && (
                                <div>Weight: {exercise.sets[0].weight} lbs</div>
                              )}
                            </div>
                            
                            {exercise.notes && (
                              <div className="mt-1 text-xs text-gray-500 italic">
                                Note: {exercise.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No exercises added yet. Click the + button to add exercises.
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-1">Add Muscle Groups</h3>
              <p className="text-sm text-gray-500">
                Select muscle groups to add exercises to your template
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={handleCreateTemplate}
          disabled={isCreating || !templateName.trim() || muscleGroups.length === 0}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Creating...
            </div>
          ) : (
            'Create Template'
          )}
        </button>
        
        {/* Add Exercise Modal */}
        {showAddExerciseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add Exercises to {muscleGroups.find(g => g.id === selectedMuscleGroup)?.name}
              </h3>
              
              {/* Exercise Suggestions - Multi-select Grid */}
              {selectedMuscleGroup && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Select Exercises:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {getMockExerciseSuggestions(selectedMuscleGroup).map((exercise, index) => (
                      <button
                        key={index}
                        onClick={() => toggleExerciseSelection(exercise.name)}
                        className={`py-2 px-3 text-sm rounded-lg border ${
                          selectedExercises.includes(exercise.name)
                            ? 'bg-blue-100 border-blue-300 text-blue-800'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {exercise.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Custom Exercise Input */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Or add a custom exercise:</p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    placeholder="Enter custom exercise name"
                    className="flex-1 p-3 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => {
                      if (exerciseName.trim()) {
                        toggleExerciseSelection(exerciseName.trim());
                        setExerciseName('');
                      }
                    }}
                    disabled={!exerciseName.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {/* Selected Exercises List */}
              {selectedExercises.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected ({selectedExercises.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercises.map((name, index) => (
                      <div key={index} className="flex items-center bg-blue-50 text-blue-800 px-3 py-1 rounded-full">
                        <span className="text-sm">{name}</span>
                        <button
                          onClick={() => toggleExerciseSelection(name)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddExerciseModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addExercise}
                  disabled={selectedExercises.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Exercises ({selectedExercises.length})
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Bottom navigation */}
        <BottomNav />
      </div>
    </div>
  );
} 
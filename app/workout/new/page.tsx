"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Pencil, Trash, Minus, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";


// Define types for our workout
interface Set {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  type?: 'normal' | 'warmup' | 'drop' | 'failure';
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  notes: string;
}

interface MuscleGroup {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface WorkoutSetup {
  day: string;
  muscleGroups: string[];
  notes: string;
  timestamp: string;
  startTime: number;
  name?: string;
  fromTemplate?: boolean;
  templateId?: Id<'workoutTemplates'>;
}

// Add interface for saved workout progress
interface SavedWorkoutProgress {
  muscleGroups: MuscleGroup[];
  elapsedTime: number;
  lastSaved: number;
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [workoutSetup, setWorkoutSetup] = useState<WorkoutSetup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [editingNotes, setEditingNotes] = useState<{ groupId: string, exerciseId: string } | null>(null);
  const [tempInputs, setTempInputs] = useState<Record<string, string>>({});  // Track temporary input values while typing
  const [activeInputId, setActiveInputId] = useState<string | null>(null); // Track which input is currently active
  const [invalidSetInputs, setInvalidSetInputs] = useState<Record<string, boolean>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  // Get user profile from Convex
  const userProfile = useQuery(api.users.getProfile,
    user?.id ? { userId: user.id } : 'skip'
  );

  // Get Convex mutations
  const createWorkout = useMutation(api.workouts.createWorkout);
  const completeWorkout = useMutation(api.workouts.completeWorkout);
  const saveWorkoutAsTemplate = useMutation(api.workouts.saveWorkoutAsTemplate);
  const createWorkoutFromTemplate = useMutation(api.workouts.createWorkoutFromTemplate); // Added for template workouts

  // Auto-save workout progress to localStorage
  const saveWorkoutProgress = (muscleGroups: MuscleGroup[], elapsedTime: number) => {
    if (typeof window !== 'undefined') {
      const progress: SavedWorkoutProgress = {
        muscleGroups,
        elapsedTime,
        lastSaved: Date.now()
      };
      localStorage.setItem('workoutProgress', JSON.stringify(progress));
      setLastSaved(Date.now());
    }
  };

  // Load saved workout progress from localStorage
  const loadWorkoutProgress = (): SavedWorkoutProgress | null => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('workoutProgress');
      if (saved) {
        try {
          return JSON.parse(saved) as SavedWorkoutProgress;
        } catch (error) {
          console.error('Error parsing saved workout progress:', error);
          localStorage.removeItem('workoutProgress');
        }
      }
    }
    return null;
  };

  // Clear saved workout progress
  const clearWorkoutProgress = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('workoutProgress');
    }
  };

  // Auto-save effect - save progress whenever muscleGroups or elapsedTime changes
  useEffect(() => {
    if (muscleGroups.length > 0 && workoutSetup) {
      saveWorkoutProgress(muscleGroups, elapsedTime);
    }
  }, [muscleGroups, elapsedTime, workoutSetup]);

  // Warn user before leaving page with unsaved progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if there's any progress to save
      const hasProgress = muscleGroups.some(group => 
        group.exercises.some(exercise => 
          exercise.sets.some(set => set.completed || set.weight || set.reps)
        )
      );
      
      if (hasProgress) {
        e.preventDefault();
        e.returnValue = 'You have unsaved workout progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [muscleGroups]);

  // Timer effect to track workout duration
  useEffect(() => {
    if (!workoutSetup?.startTime) return;

    // Initialize elapsed time based on start time
    setElapsedTime(Math.floor((Date.now() - workoutSetup.startTime) / 1000));

    // Update timer every second
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - workoutSetup.startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [workoutSetup?.startTime]);

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    // Prevent re-initialization if already done
    if (isInitialized) {
      return;
    }

    // Check if we have workout setup data
    if (typeof window !== 'undefined') {
      const setupData = localStorage.getItem('workoutSetup');
      const exercisesData = localStorage.getItem('selectedExercises');

      if (!setupData || !exercisesData) {
        // No setup data or exercises data, redirect to setup page
        router.push('/workout/setup');
        return;
      }

      try {
        const parsedSetup = JSON.parse(setupData) as WorkoutSetup;
        const selectedExercises = JSON.parse(exercisesData) as Record<string, string[]>;

        // Validate that selectedExercises contains entries for all muscle groups in setup
        const hasAllMuscleGroups = parsedSetup.muscleGroups.every(group =>
          selectedExercises.hasOwnProperty(group)
        );

        if (!hasAllMuscleGroups) {
          console.error('Selected exercises data does not match workout setup');
          // Clear invalid data and redirect to setup
          localStorage.removeItem('selectedExercises');
          router.push('/workout/setup');
          return;
        }

        setWorkoutSetup(parsedSetup);

        // Check for saved progress first
        const savedProgress = loadWorkoutProgress();
        
        if (savedProgress && savedProgress.muscleGroups.length > 0) {
          // Restore saved progress
          setMuscleGroups(savedProgress.muscleGroups);
          setElapsedTime(savedProgress.elapsedTime);
          setLastSaved(savedProgress.lastSaved);
          
          // Show recovery message
          toast.success('Workout progress restored!', {
            description: 'Your previous workout session has been recovered.'
          });
        } else {
          // Initialize muscle groups based on setup data
          const muscleGroupLabels: Record<string, string> = {
            chest: 'Chest',
            back: 'Back',
            arms: 'Arms',
            legs: 'Legs',
            core: 'Core',
            shoulders: 'Shoulders',
            fullBody: 'Full Body',
          };

          // Create initial muscle groups with selected exercises
          const initialMuscleGroups = parsedSetup.muscleGroups.map(groupId => {
            const exercises = selectedExercises[groupId] || [];

            return {
              id: groupId,
              name: muscleGroupLabels[groupId] || groupId,
              exercises: exercises.length > 0
                ? exercises.map(exerciseName => ({
                  id: generateId(),
                  name: exerciseName,
                  sets: [createEmptySet()],
                  notes: '',
                }))
                : [createEmptyExercise(groupId)]
            };
          });

          setMuscleGroups(initialMuscleGroups);
        }

        // Initialize all groups as expanded
        const initialExpandedState: Record<string, boolean> = {};
        parsedSetup.muscleGroups.forEach(groupId => {
          initialExpandedState[groupId] = true;
        });
        setExpandedGroups(initialExpandedState);

        setIsLoading(false);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error parsing workout data:', error);
        router.push('/workout/setup');
      }
    }
  }, [user, authLoading, router, isInitialized]);

  // Helper to create a unique ID
  const generateId = () => Math.random().toString(36).substring(2, 10);

  // Create an empty exercise
  const createEmptyExercise = (muscleGroupId: string): Exercise => ({
    id: generateId(),
    name: '',
    sets: [createEmptySet()],
    notes: '',
  });

  // Create an empty set
  const createEmptySet = (): Set => ({
    id: generateId(),
    weight: '',
    reps: '',
    completed: false,
    type: 'normal',
  });

  // Add a new exercise to a muscle group
  const addExercise = (muscleGroupId: string) => {
    const newExerciseId = generateId();
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? { ...group, exercises: [...group.exercises, { ...createEmptyExercise(muscleGroupId), id: newExerciseId }] }
          : group
      )
    );
    // Auto-focus the new exercise
    setActiveExercise(newExerciseId);
  };

  // Add a new set to an exercise
  const addSet = (muscleGroupId: string, exerciseId: string) => {
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? {
            ...group,
            exercises: group.exercises.map(exercise =>
              exercise.id === exerciseId
                ? { ...exercise, sets: [...exercise.sets, createEmptySet()] }
                : exercise
            )
          }
          : group
      )
    );
  };

  // Update exercise name
  const updateExerciseName = (muscleGroupId: string, exerciseId: string, name: string) => {
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? {
            ...group,
            exercises: group.exercises.map(exercise =>
              exercise.id === exerciseId
                ? { ...exercise, name }
                : exercise
            )
          }
          : group
      )
    );
  };

  // Update set data
  const updateSet = (muscleGroupId: string, exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? {
            ...group,
            exercises: group.exercises.map(exercise =>
              exercise.id === exerciseId
                ? {
                  ...exercise,
                  sets: exercise.sets.map(set =>
                    set.id === setId
                      ? { ...set, [field]: value }
                      : set
                  )
                }
                : exercise
            )
          }
          : group
      )
    );
  };

  // Toggle set completion
  const toggleSetCompletion = (muscleGroupId: string, exerciseId: string, setId: string) => {
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? {
            ...group,
            exercises: group.exercises.map(exercise =>
              exercise.id === exerciseId
                ? {
                  ...exercise,
                  sets: exercise.sets.map(set =>
                    set.id === setId
                      ? { ...set, completed: !set.completed }
                      : set
                  )
                }
                : exercise
            )
          }
          : group
      )
    );
  };

  // Update exercise notes
  const updateNotes = (muscleGroupId: string, exerciseId: string, notes: string) => {
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? {
            ...group,
            exercises: group.exercises.map(exercise =>
              exercise.id === exerciseId
                ? { ...exercise, notes }
                : exercise
            )
          }
          : group
      )
    );
  };

  // Toggle muscle group expansion
  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Handle weight input change
  const handleWeightChange = (muscleGroupId: string, exerciseId: string, setId: string, value: string) => {
    // Store the raw input temporarily
    setTempInputs(prev => ({
      ...prev,
      [setId]: value
    }));

    // If input is empty or not a valid number, update with the raw value
    if (!value || isNaN(parseFloat(value))) {
      updateSet(muscleGroupId, exerciseId, setId, 'weight', value);
      return;
    }

    // Store the value directly (in lbs)
    updateSet(muscleGroupId, exerciseId, setId, 'weight', value);
  };

  // Get the weight value to display
  const displayWeight = (weight: string, setId: string): string => {
    // If this input is being actively edited, show the temporary input
    if (activeInputId === setId && tempInputs[setId] !== undefined) {
      return tempInputs[setId];
    }

    return weight;
  };

  // Calculate total volume (weight * reps)
  const calculateTotalVolume = (): number => {
    let totalVolume = 0;

    muscleGroups.forEach(group => {
      group.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.completed && set.weight && set.reps) {
            const weight = parseFloat(set.weight);
            const reps = parseInt(set.reps);

            if (!isNaN(weight) && !isNaN(reps)) {
              totalVolume += weight * reps;
            }
          }
        });
      });
    });

    return totalVolume;
  };

  // Calculate exercise completion percentage
  const calculateCompletionPercentage = (): number => {
    let totalSets = 0;
    let completedSets = 0;

    muscleGroups.forEach(group => {
      group.exercises.forEach(exercise => {
        if (exercise.name.trim() !== '') {
          exercise.sets.forEach(set => {
            totalSets++;
            if (set.completed) {
              completedSets++;
            }
          });
        }
      });
    });

    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  };

  // Finish workout
  const finishWorkout = async () => {
    if (!user?.id || !workoutSetup) return;

    try {
      setIsSaving(true);

      // Filter out empty exercises (no name)
      const filteredMuscleGroups = muscleGroups.map(group => ({
        ...group,
        exercises: group.exercises.filter(ex => ex.name.trim() !== '')
      })).filter(group => group.exercises.length > 0);

      let workoutId;

      // If this workout was started from a template, use createWorkoutFromTemplate
      if (workoutSetup.fromTemplate && workoutSetup.templateId) {
        workoutId = await createWorkoutFromTemplate({
          userId: user.id,
          templateId: workoutSetup.templateId
        });
      } else {
        // Otherwise create a new workout from scratch
        workoutId = await createWorkout({
          userId: user.id,
          muscleGroups: filteredMuscleGroups,
          name: workoutSetup.name
        });
      }

      // Mark as complete with volume and actual duration
      await completeWorkout({
        workoutId,
        totalVolume: calculateTotalVolume(),
        duration: elapsedTime 
      });

      // Clear the session storage
      localStorage.removeItem('workoutSetup');
      localStorage.removeItem('selectedExercises');
      clearWorkoutProgress(); // Clear saved progress on completion

      // Show success toast
      toast.success('Workout completed successfully!', {
        description: `Total volume: ${calculateTotalVolume().toLocaleString()} lbs • Duration: ${formatTime(elapsedTime)}`
      });

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Remove a set from an exercise
  const removeSet = (muscleGroupId: string, exerciseId: string, setId: string) => {
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? {
            ...group,
            exercises: group.exercises.map(exercise =>
              exercise.id === exerciseId
                ? {
                  ...exercise,
                  // Filter out the set to remove, but ensure we keep at least one set
                  sets: exercise.sets.length > 1
                    ? exercise.sets.filter(set => set.id !== setId)
                    : exercise.sets
                }
                : exercise
            )
          }
          : group
      )
    );
  };

  // Add state for template saving modal
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateDay, setTemplateDay] = useState('');
  const [includeWeights, setIncludeWeights] = useState(false);

  // Function to save the current workout as a template
  const handleSaveAsTemplate = async () => {
    if (!user?.id) return;

    try {
      // Filter out empty exercises (no name)
      const filteredMuscleGroups = muscleGroups.map(group => ({
        ...group,
        exercises: group.exercises.filter(ex => ex.name.trim() !== '')
      })).filter(group => group.exercises.length > 0);

      // First create a workout to get an ID
      const workoutId = await createWorkout({
        userId: user.id,
        muscleGroups: filteredMuscleGroups
      });

      // Then save it as a template
      await saveWorkoutAsTemplate({
        userId: user.id,
        workoutId,
        name: templateName,
        description: templateDescription || undefined,
        targetDay: templateDay || undefined,
        includeWeights
      });

      // Close the modal and reset form
      setIsSavingTemplate(false);
      setTemplateName('');
      setTemplateDescription('');
      setTemplateDay('');
      setIncludeWeights(false);

      // Show success message
      alert('Workout template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save workout template. Please try again.');
    }
  };

  // Handler to update set type
  const updateSetType = (muscleGroupId: string, exerciseId: string, setId: string, type: 'normal' | 'warmup' | 'drop' | 'failure') => {
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? {
            ...group,
            exercises: group.exercises.map(exercise =>
              exercise.id === exerciseId
                ? {
                  ...exercise,
                  sets: exercise.sets.map(set =>
                    set.id === setId ? { ...set, type } : set
                  )
                }
                : exercise
            )
          }
          : group
      )
    );
  };

  // Helper to check if set is valid
  const isSetValid = (set: Set) => {
    const weightValid = set.weight && !isNaN(parseFloat(set.weight));
    const repsValid = set.reps && !isNaN(parseInt(set.reps));
    return weightValid && repsValid;
  };

  // Modified toggleSetCompletion to validate inputs
  const tryToggleSetCompletion = (muscleGroupId: string, exerciseId: string, set: Set) => {
    if (isSetValid(set)) {
      setInvalidSetInputs(prev => {
        const n = { ...prev };
        delete n[set.id];
        return n;
      });
      toggleSetCompletion(muscleGroupId, exerciseId, set.id);
    } else {
      setInvalidSetInputs(prev => ({ ...prev, [set.id]: true }));
    }
  };

  // --- UI starts here ---
  if (authLoading || isLoading || !user || !workoutSetup) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const completionPercentage = calculateCompletionPercentage();

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header Card */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{workoutSetup.name || "Workout"}</span>
              <span className="bg-blue-50 px-3 py-1 rounded-full text-blue-600 font-bold text-base tracking-wider">{formatTime(elapsedTime)}</span>
            </CardTitle>
            <div className="text-gray-500 text-sm flex justify-between items-center">
              <span>{workoutSetup.day} - {new Date(workoutSetup.timestamp).toLocaleDateString()}</span>
              {lastSaved && (
                <span className="text-xs text-green-600">
                  Saved {Math.floor((Date.now() - lastSaved) / 1000)}s ago
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={completionPercentage} className="flex-1" />
              <span className="text-xs font-medium text-gray-700">{completionPercentage}%</span>
              <span className="text-xs text-gray-500">{calculateTotalVolume().toLocaleString()} lbs</span>
            </div>
          </CardContent>
        </Card>

        {/* Notes Alert */}
        {workoutSetup.notes && (
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <AlertTitle className="text-yellow-800">Workout Notes</AlertTitle>
            <AlertDescription className="text-yellow-700">{workoutSetup.notes}</AlertDescription>
          </Alert>
        )}

        {/* Muscle Groups Accordion */}
        <Accordion type="multiple" className="mb-24">
          {muscleGroups.map(group => (
            <AccordionItem value={group.id} key={group.id}>
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{group.name.charAt(0)}</span>
                  <span className="text-lg font-semibold text-black">{group.name}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-5">
                  {group.exercises.map(exercise => (
                    <Card key={exercise.id} className="border border-gray-200 py-4">
                      <CardContent className="px-4">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Input
                              type="text"
                              value={exercise.name}
                              onChange={e => updateExerciseName(group.id, exercise.id, e.target.value)}
                              placeholder="Exercise name"
                              className="font-medium text-base bg-transparent border-none px-0 focus:ring-0 focus:border-blue-500"
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="p-1">
                                  <span className="sr-only">Exercise options</span>
                                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" fill="currentColor" /><circle cx="12" cy="12" r="2" fill="currentColor" /><circle cx="19" cy="12" r="2" fill="currentColor" /></svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingNotes({ groupId: group.id, exerciseId: exercise.id })}>
                                  <Pencil className="w-4 h-4" />
                                  {exercise.notes ? "Edit Notes" : "Add Notes"}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => {
                                  setMuscleGroups(prevGroups =>
                                    prevGroups.map(g =>
                                      g.id === group.id
                                        ? { ...g, exercises: g.exercises.filter(ex => ex.id !== exercise.id) }
                                        : g
                                    )
                                  );
                                }}>
                                  <Trash className="w-4 h-4" />
                                  Remove Exercise
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {/* Notes Editor */}
                        {editingNotes && editingNotes.groupId === group.id && editingNotes.exerciseId === exercise.id && (
                          <div className="mt-3 p-3 bg-white border border-gray-200 rounded-md">
                            <Label htmlFor="exercise-notes" className="block mb-1">Notes</Label>
                            <textarea
                              id="exercise-notes"
                              value={exercise.notes}
                              onChange={e => updateNotes(group.id, exercise.id, e.target.value)}
                              placeholder="Add notes for this exercise..."
                              className="w-full h-20 resize-none border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <div className="flex justify-end mt-2 gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingNotes(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => setEditingNotes(null)}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        )}
                        {/* Display notes when not editing */}
                        {exercise.notes && (!editingNotes || editingNotes.groupId !== group.id || editingNotes.exerciseId !== exercise.id) && (
                          <div className="mb-3 bg-yellow-50 p-3 rounded-md text-sm text-yellow-800 border border-yellow-100">
                            {exercise.notes}
                          </div>
                        )}
                        {/* Sets Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead className="-translate-y-1">
                              <tr className="text-gray-500">
                                <th className="w-10 text-left">Set</th>
                                <th className="w-24 text-center">Lbs</th>
                                <th className="w-24 text-center">Reps</th>
                                <th className="w-10 text-center">
                                  <Check className="w-4 h-4 mx-auto" />
                                </th>
                                <th className="w-10"></th>
                              </tr>
                            </thead>
                            <tbody className="">
                              {exercise.sets.map((set, idx) => {
                                const prevSet = idx > 0 ? exercise.sets[idx - 1] : null;
                                const weightPlaceholder = prevSet && prevSet.weight ? prevSet.weight : "0";
                                const repsPlaceholder = prevSet && prevSet.reps ? prevSet.reps : "0";
                                return (
                                  <tr
                                    key={set.id}
                                    className={`border-t last:border-b mt-4  ${set.completed ? "bg-green-100  border-green-200" : ""}`}
                                  >
                                    <td className={`text-center border-r ${set.completed ? 'border-green-200' : ''}`}>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="p-0 rounded-none w-full">
                                            <span className="font-semibold">
                                              {set.type && set.type !== 'normal'
                                                ? (set.type === 'warmup' && 'W') ||
                                                  (set.type === 'drop' && 'D') ||
                                                  (set.type === 'failure' && 'F')
                                                : (() => {
                                                    // If previous set is warmup or drop, reset numbering to 1
                                                    let displayNum = 1;
                                                    for (let i = 0; i < idx; i++) {
                                                      if (
                                                        exercise.sets[i].type === 'warmup' ||
                                                        exercise.sets[i].type === 'drop'
                                                      ) {
                                                        displayNum = 1;
                                                      } else {
                                                        displayNum++;
                                                      }
                                                    }
                                                    return displayNum;
                                                  })()
                                              }
                                            </span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                          <DropdownMenuItem onClick={() => updateSetType(group.id, exercise.id, set.id, 'warmup')}>Warmup Set</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => updateSetType(group.id, exercise.id, set.id, 'drop')}>Drop Set</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => updateSetType(group.id, exercise.id, set.id, 'failure')}>Failure</DropdownMenuItem>
                                          {set.type && set.type !== 'normal' && (
                                            <DropdownMenuItem onClick={() => updateSetType(group.id, exercise.id, set.id, 'normal')}>Normal Set</DropdownMenuItem>
                                          )}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </td>
                                    <td className={`border-r ${set.completed ? 'border-green-200' : ''}`}>
                                      <Input
                                        type="text"
                                        inputMode="decimal"
                                        value={displayWeight(set.weight, set.id)}
                                        onChange={e => handleWeightChange(group.id, exercise.id, set.id, e.target.value)}
                                        onFocus={() => setActiveInputId(set.id)}
                                        onBlur={() => {
                                          if (activeInputId === set.id) setActiveInputId(null);
                                          setTempInputs(prev => { const n = { ...prev }; delete n[set.id]; return n; });
                                        }}
                                        placeholder={weightPlaceholder}
                                        className={`text-center rounded-none w-full mx-auto px-2 font-medium border-none placeholder:text-gray-400 ${set.completed ? 'bg-transparent' : ''} ${invalidSetInputs[set.id] && (!set.weight || isNaN(parseFloat(set.weight))) ? 'border border-red-500 bg-red-100' : ''}`}
                                      />
                                    </td>
                                    <td className={`border-r ${set.completed ? 'border-green-200' : ''}`}>
                                      <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={set.reps}
                                        onChange={e => updateSet(group.id, exercise.id, set.id, "reps", e.target.value)}
                                        placeholder={repsPlaceholder}
                                        className={`text-center rounded-none w-full mx-auto px-2 font-medium border-none placeholder:text-gray-400 ${set.completed ? 'bg-transparent' : ' '} ${invalidSetInputs[set.id] && (!set.weight || isNaN(parseFloat(set.weight))) ? 'border border-red-500 bg-red-100' : ''}`}
                                      />
                                    </td>
                                    <td className={`text-center ${set.completed ? 'border-green-200' : 'border-r'}`}>
                                      <Button
                                        variant={set.completed ? "default" : "outline"}
                                        size="icon"
                                        className={` mx-auto w-full rounded-none border-none ${set.completed ? "bg-green-500 text-white" : "bg-transparent text-black"} `}
                                        onClick={() => tryToggleSetCompletion(group.id, exercise.id, set)}
                                        title={set.completed ? "Completed" : "Mark as complete"}
                                      >
                                        <Check
                                          className="w-4 h-4"
                                          strokeWidth={set.completed ? 3 : 2.5}
                                        />
                                      </Button>
                                    </td>
                                    <td className="text-center">
                                      {exercise.sets.length > 1 && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-red-500"
                                          onClick={() => removeSet(group.id, exercise.id, set.id)}
                                          title="Remove set"
                                        >
                                          <Minus className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addSet(group.id, exercise.id)}
                            className="w-full shadow-none"
                          >
                            + Add Set
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    variant="secondary"
                    className="w-full mt-2"
                    onClick={() => addExercise(group.id)}
                  >
                    + Add Exercise
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
        <div className="max-w-md mx-auto flex gap-2">
          <Button variant="secondary" onClick={() => setIsSavingTemplate(true)}>
            Save Template
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
                localStorage.removeItem('workoutSetup');
                localStorage.removeItem('selectedExercises');
                clearWorkoutProgress(); // Clear saved progress on cancellation
                router.push('/dashboard');
              }
            }}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={finishWorkout} disabled={isSaving}>
            {isSaving ? "Saving..." : "Finish Workout"}
          </Button>
        </div>
      </div>

      {/* Save as Template Dialog */}
      <Dialog open={isSavingTemplate} onOpenChange={setIsSavingTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Workout as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input id="template-name" value={templateName} onChange={e => setTemplateName(e.target.value)} />
            <Label htmlFor="template-description">Description (Optional)</Label>
            <textarea
              id="template-description"
              value={templateDescription}
              onChange={e => setTemplateDescription(e.target.value)}
              placeholder="Add notes about this workout template..."
              className="w-full h-20 resize-none border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Label htmlFor="template-day">Target Day (Optional)</Label>
            <select
              id="template-day"
              value={templateDay}
              onChange={e => setTemplateDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a day</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeWeights"
                checked={includeWeights}
                onChange={e => setIncludeWeights(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="includeWeights">Include weights in template</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSavingTemplate(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAsTemplate} disabled={!templateName.trim()}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
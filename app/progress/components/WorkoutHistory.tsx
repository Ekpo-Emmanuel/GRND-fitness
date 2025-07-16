"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Clock, Dumbbell, Repeat, X, ArrowRight, Weight, Calendar, Filter, ChevronDown, ArrowUpDown, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Workout {
    _id: string;
    date: string;
    name: string;
    duration?: number;
    totalVolume?: number;
    muscleGroups?: {
        id: string;
        name: string;
        exercises: {
            id: string;
            name: string;
            sets: {
                id: string;
                weight: string;
                reps: string;
                completed: boolean;
            }[];
        }[];
    }[];
}

// Define sorting and filtering types
type SortOption = 'date-newest' | 'date-oldest' | 'volume-highest' | 'volume-lowest' | 'duration-longest' | 'duration-shortest';
type FilterOption = 'all' | string;

export default function WorkoutHistory({ workouts }: { workouts: Workout[] }) {
    const router = useRouter();
    const [sortBy, setSortBy] = useState<SortOption>('date-newest');
    const [filterMuscleGroup, setFilterMuscleGroup] = useState<FilterOption>('all');
    const [isFiltered, setIsFiltered] = useState(false);

    // Reset all filters and sorts
    const resetFiltersAndSorts = () => {
        setSortBy('date-newest');
        setFilterMuscleGroup('all');
        setIsFiltered(false);
    };

    // Update isFiltered state when filter or sort changes
    useMemo(() => {
        const isCurrentlyFiltered = 
            sortBy !== 'date-newest' || 
            filterMuscleGroup !== 'all';
        
        setIsFiltered(isCurrentlyFiltered);
    }, [sortBy, filterMuscleGroup]);

    const isEmpty = !workouts || workouts.length === 0;

    // Extract all unique muscle groups from workouts
    const allMuscleGroups = useMemo(() => {
        if (!workouts || workouts.length === 0) return [];
        
        const muscleGroupSet = new Set<string>();
        workouts.forEach(workout => {
            workout.muscleGroups?.forEach(group => {
                if (group.name) {
                    muscleGroupSet.add(group.name);
                }
            });
        });
        
        return Array.from(muscleGroupSet).sort();
    }, [workouts]);

    return (
        <div className="">
            {isEmpty ? (
                <>
                    <div className="text-center py-12 bg-white rounded-lg border">
                    <Dumbbell className="mx-auto text-gray-300 w-12 h-12 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No workouts yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Start logging your workouts to track progress.</p>
                        <Button
                        onClick={() => router.push("/workout/setup")}
                            variant="outline"
                            className="bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                        Start Your First Workout
                        </Button>
                </div>
                </>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Workout History</h2>
                        <div className="flex items-center gap-2">
                            {isFiltered && (
                                <button 
                                    onClick={resetFiltersAndSorts}
                                    className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                            
                            {/* Filter Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        size="icon" 
                                        className={`flex items-center gap-1 bg-transparent hover:bg-gray-200 shadow-none ${filterMuscleGroup !== 'all' ? 'text-blue-600' : 'text-gray-500'}`}
                                    >
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Muscle Groups</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup value={filterMuscleGroup} onValueChange={(value) => setFilterMuscleGroup(value as FilterOption)}>
                                        <DropdownMenuRadioItem value="all">
                                            All
                                            {filterMuscleGroup === 'all' && <Check className="h-4 w-4 ml-auto" />}
                                        </DropdownMenuRadioItem>
                                        {allMuscleGroups.map((group) => (
                                            <DropdownMenuRadioItem key={group} value={group}>
                                                {group}
                                                {filterMuscleGroup === group && <Check className="h-4 w-4 ml-auto" />}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Sort Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        size="icon" 
                                        className={`flex items-center gap-1 bg-transparent hover:bg-gray-200 shadow-none ${sortBy !== 'date-newest' ? 'text-blue-600' : 'text-gray-500'}`}
                                    >
                                        <ArrowUpDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <Calendar className="h-4 w-4 mr-2" />
                                                <span>Date</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem onClick={() => setSortBy('date-newest')}>
                                                        Newest First
                                                        {sortBy === 'date-newest' && <Check className="h-4 w-4 ml-auto" />}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setSortBy('date-oldest')}>
                                                        Oldest First
                                                        {sortBy === 'date-oldest' && <Check className="h-4 w-4 ml-auto" />}
                                                    </DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <Weight className="h-4 w-4 mr-2" />
                                                <span>Volume</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem onClick={() => setSortBy('volume-highest')}>
                                                        Highest First
                                                        {sortBy === 'volume-highest' && <Check className="h-4 w-4 ml-auto" />}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setSortBy('volume-lowest')}>
                                                        Lowest First
                                                        {sortBy === 'volume-lowest' && <Check className="h-4 w-4 ml-auto" />}
                                                    </DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <Clock className="h-4 w-4 mr-2" />
                                                <span>Duration</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem onClick={() => setSortBy('duration-longest')}>
                                                        Longest First
                                                        {sortBy === 'duration-longest' && <Check className="h-4 w-4 ml-auto" />}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setSortBy('duration-shortest')}>
                                                        Shortest First
                                                        {sortBy === 'duration-shortest' && <Check className="h-4 w-4 ml-auto" />}
                                                    </DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <WorkoutCardList 
                        workouts={workouts || []} 
                        sortBy={sortBy} 
                        filterMuscleGroup={filterMuscleGroup} 
                    />
                </>
            )}
        </div>
    );
}

function WorkoutCardList({ 
    workouts, 
    sortBy, 
    filterMuscleGroup 
}: { 
    workouts: Workout[]; 
    sortBy: SortOption;
    filterMuscleGroup: FilterOption;
}) {
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const calculateTotalReps = (workout: Workout): number => {
        let reps = 0;
        workout.muscleGroups?.forEach((group) =>
            group.exercises.forEach((ex) =>
                ex.sets.forEach((s) => {
                    if (s.completed) {
                        reps += parseInt(s.reps) || 0;
                    }
                })
            )
        );
        return reps;
    };

    // Get exercises with completed set counts
    const getExercisesWithSets = (workout: Workout): { name: string; completedSets: number }[] => {
        const exerciseMap = new Map<string, number>();
        
        workout.muscleGroups?.forEach((group) => {
            group.exercises.forEach((exercise) => {
                if (!exercise.name) return;
                
                // Count completed sets for this exercise
                const completedSets = exercise.sets.filter(set => set.completed).length;
                
                // If the exercise already exists, add to its completed sets count
                if (exerciseMap.has(exercise.name)) {
                    exerciseMap.set(exercise.name, exerciseMap.get(exercise.name)! + completedSets);
                } else {
                    exerciseMap.set(exercise.name, completedSets);
                }
            });
        });
        
        // Convert map to array of objects
        return Array.from(exerciseMap.entries()).map(([name, completedSets]) => ({
            name,
            completedSets
        }));
    };

    const formatDuration = (seconds?: number): string => {
        if (!seconds) return "0m";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    // Calculate estimated 1RM using Brzycki formula: weight * (36 / (37 - reps))
    const calculate1RM = (weight: string, reps: string): number => {
        const weightNum = parseFloat(weight);
        const repsNum = parseInt(reps);
        
        if (isNaN(weightNum) || isNaN(repsNum) || repsNum <= 0 || repsNum >= 37) {
            return 0;
        }
        
        return Math.round(weightNum * (36 / (37 - repsNum)));
    };

    // Get the best set for each exercise (highest 1RM)
    const getBestSets = (workout: Workout) => {
        const bestSets = new Map<string, { weight: string; reps: string; oneRM: number }>();
        
        workout.muscleGroups?.forEach(group => {
            group.exercises.forEach(exercise => {
                if (!exercise.name) return;
                
                let bestOneRM = 0;
                let bestSet = { weight: "0", reps: "0" };
                
                exercise.sets.forEach(set => {
                    if (set.completed && set.weight && set.reps) {
                        const oneRM = calculate1RM(set.weight, set.reps);
                        if (oneRM > bestOneRM) {
                            bestOneRM = oneRM;
                            bestSet = { weight: set.weight, reps: set.reps };
                        }
                    }
                });
                
                if (bestOneRM > 0) {
                    // If we already have this exercise, only update if the new 1RM is higher
                    if (bestSets.has(exercise.name)) {
                        const existing = bestSets.get(exercise.name)!;
                        if (bestOneRM > existing.oneRM) {
                            bestSets.set(exercise.name, { ...bestSet, oneRM: bestOneRM });
                        }
                    } else {
                        bestSets.set(exercise.name, { ...bestSet, oneRM: bestOneRM });
                    }
                }
            });
        });
        
        return bestSets;
    };

    // Check if a workout contains a specific muscle group
    const workoutContainsMuscleGroup = (workout: Workout, muscleGroup: string): boolean => {
        if (muscleGroup === 'all') return true;
        
        return !!workout.muscleGroups?.some(group => 
            group.name.toLowerCase() === muscleGroup.toLowerCase()
        );
    };

    // Filter and sort workouts
    const filteredAndSortedWorkouts = useMemo(() => {
        // First, filter by muscle group
        const filtered = workouts.filter(workout => 
            workoutContainsMuscleGroup(workout, filterMuscleGroup)
        );
        
        // Then sort according to the selected option
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'date-newest':
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'date-oldest':
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'volume-highest':
                    return (b.totalVolume || 0) - (a.totalVolume || 0);
                case 'volume-lowest':
                    return (a.totalVolume || 0) - (b.totalVolume || 0);
                case 'duration-longest':
                    return (b.duration || 0) - (a.duration || 0);
                case 'duration-shortest':
                    return (a.duration || 0) - (b.duration || 0);
                default:
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        });
    }, [workouts, sortBy, filterMuscleGroup]);

    return (
        <div className="space-y-4">
            {filteredAndSortedWorkouts.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border">
                    <p className="text-gray-500">No workouts match your filter criteria.</p>
                </div>
            ) : (
                filteredAndSortedWorkouts.map((workout) => {
                const totalReps = calculateTotalReps(workout);
                    const exercisesWithSets = getExercisesWithSets(workout);
                const duration = formatDuration(workout.duration);

                return (
                    <div
                        key={workout._id}
                            className="rounded-xl bg-white border border-gray-200 p-4 hover:shadow-md transition cursor-pointer"
                            onClick={() => setSelectedWorkout(workout)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-md font-semibold text-gray-900">
                                    {workout.name || "Workout"}
                                </h3>
                                <p className="text-xs text-gray-500">{formatDate(workout.date)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-3 text-sm text-gray-700">
                            <div className="flex items-center gap-1">
                                <Dumbbell className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{workout.totalVolume?.toLocaleString() || 0}</span>
                                <span className="text-xs text-gray-400 ml-0.5">lbs</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Repeat className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{totalReps}</span>
                                <span className="text-xs text-gray-400 ml-0.5">reps</span>
                            </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{duration}</span>
                                </div>
                        </div>

                            {exercisesWithSets.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs text-gray-500 mb-1">Exercises:</p>
                                <div className="flex flex-wrap gap-2">
                                        {exercisesWithSets.slice(0, 4).map((exercise, i) => (
                                        <span
                                            key={i}
                                            className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                                        >
                                                {exercise.completedSets}x {exercise.name}
                                            </span>
                                        ))}
                                        {exercisesWithSets.length > 4 && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                                +{exercisesWithSets.length - 4} more
                                        </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}

            {/* Detailed Workout Modal */}
            {selectedWorkout && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-black">{selectedWorkout.name || "Workout Details"}</h3>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWorkout(null);
                                }}
                                className="p-1 rounded-full hover:bg-gray-100"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="p-4">
                            <div className="flex flex-col space-y-4">
                                {/* Workout Info */}
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-500">{formatDate(selectedWorkout.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-500">{formatTime(selectedWorkout.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-500">{formatDuration(selectedWorkout.duration)}</span>
                                    </div>
                                </div>
                                
                                {/* Workout Stats */}
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-xs text-blue-700 mb-1">Total Volume</p>
                                        <p className="text-xl font-bold text-blue-900">{selectedWorkout.totalVolume?.toLocaleString() || 0} <span className="text-sm font-normal">lbs</span></p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <p className="text-xs text-green-700 mb-1">Total Reps</p>
                                        <p className="text-xl font-bold text-green-900">{calculateTotalReps(selectedWorkout)}</p>
                                    </div>
                                </div>
                                
                                {/* Exercises */}
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Exercise Details</h4>
                                    
                                    {selectedWorkout.muscleGroups?.map((group) => (
                                        <div key={group.id} className="mb-4">
                                            <h5 className="text-sm font-medium text-gray-600 mb-2">{group.name}</h5>
                                            
                                            <div className="space-y-4">
                                                {group.exercises.filter(e => e.name).map((exercise) => {
                                                    // Get best set (highest 1RM) for this exercise
                                                    const bestSets = getBestSets(selectedWorkout);
                                                    const bestSet = bestSets.get(exercise.name);
                                                    
                                                    // Only show exercises with completed sets
                                                    const completedSets = exercise.sets.filter(set => set.completed);
                                                    if (completedSets.length === 0) return null;
                                                    
                                                    return (
                                                        <div key={exercise.id} className="border border-gray-200 rounded-lg p-3">
                                                            <div className="flex justify-between items-center">
                                                                <h6 className="font-medium text-gray-900">{exercise.name}</h6>
                                                                {bestSet && (
                                                                    <div className="bg-yellow-100 px-2 py-1 rounded text-xs text-yellow-800">
                                                                        e1RM: {bestSet.oneRM} lbs
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="mt-2">
                                                                <div className="grid grid-cols-4 gap-1 text-xs font-medium text-gray-500 mb-1">
                                                                    <div>SET</div>
                                                                    <div>WEIGHT</div>
                                                                    <div>REPS</div>
                                                                    <div>VOLUME</div>
                                                                </div>
                                                                
                                                                {completedSets.map((set, idx) => {
                                                                    const weight = parseFloat(set.weight) || 0;
                                                                    const reps = parseInt(set.reps) || 0;
                                                                    const volume = weight * reps;
                                                                    
                                                                    return (
                                                                        <div key={set.id} className="grid grid-cols-4 gap-1 text-sm py-1 text-gray-500 border-t border-gray-100">
                                                                            <div>{idx + 1}</div>
                                                                            <div>{set.weight} lbs</div>
                                                                            <div>{set.reps}</div>
                                                                            <div>{volume.toLocaleString()}</div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

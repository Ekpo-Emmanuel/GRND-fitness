'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';

import { Card, CardContent } from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { Calendar, Play, BatteryCharging, Dumbbell, Clock, Weight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';



export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const userProfile = useQuery(api.users.getProfile,
    user?.id ? { userId: user.id } : 'skip'
  );

  // Get last workout
  const lastWorkout = useQuery(api.workouts.getLastWorkout,
    user?.id ? { userId: user.id } : 'skip'
  );

  // Get recent workouts for this week's progress calculation
  const workouts = useQuery(api.workouts.getRecentWorkouts,
    user?.id ? { userId: user.id, limit: 20 } : 'skip'
  );

  // Get the 2 most recent workouts
  const recentWorkouts = workouts ? [...workouts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2) : [];

  // Get day of week
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Determine if today is a training day
  const isTodayTrainingDay = userProfile?.trainingDays?.[dayOfWeek as keyof typeof userProfile.trainingDays
  ] || false;

  // Get muscle groups for today based on user's muscle focus
  const todayMuscleGroups = userProfile?.muscleFocus || [];

  // Format workout date
  const formatWorkoutDate = (workout: any) => {
    if (!workout?.date) return null;

    const date = new Date(workout.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

    // Get muscle groups from workout
    const muscleGroups = workout.muscleGroups?.map((group: any) => group.name).join(', ') || '';

    return {
      day: dayName,
      focus: muscleGroups
    };
  };

  // Format workout duration from seconds to readable time
  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return '0m';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate training progress this week
  const calculateWeekProgress = () => {
    if (!workouts || !userProfile?.trainingDays) return { completed: 0, total: 0, percentage: 0 };

    // Get current week's start and end dates
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    // Count workouts completed this week
    const workoutsThisWeek = workouts.filter((workout: any) => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startOfWeek && workoutDate <= endOfWeek && workout.completed;
    });

    // Count total planned training days for the week
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const plannedDays = weekdays.reduce((count, day) => {
      return count + ((userProfile.trainingDays && userProfile.trainingDays[day as keyof typeof userProfile.trainingDays]) ? 1 : 0);
    }, 0);

    return {
      completed: workoutsThisWeek.length,
      total: plannedDays,
      percentage: plannedDays > 0 ? (workoutsThisWeek.length / plannedDays) * 100 : 0
    };
  };

  const weekProgress = calculateWeekProgress();
  const lastWorkoutInfo = formatWorkoutDate(lastWorkout);

  const startWorkout = () => {
    router.push('/workout/setup?from=todaysWorkout');
  };

  useEffect(() => {
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
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userProfile?.name?.split(' ')[0] || user.email?.split('@')[0] || 'Athlete'}
          </h1>
          <p className="text-gray-600 mt-1">Ready to GRND?</p>
        </header>

        <div className='space-y-8'>
          {/* Today's Workout Card */}
          <Card className="shadow-md  bg-white/80 ">
            <CardContent >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">
                    {isTodayTrainingDay ? "Today's Workout" : "Rest Day"}
                  </h2>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  {/* Progress circle */}
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <circle
                        cx="18" cy="18" r="16"
                        fill="#dbebff"
                        stroke="#e6e6e6"
                        strokeWidth="1"
                      />
                      <circle
                        cx="18" cy="18" r="16"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1"
                        strokeDasharray="100"
                        strokeDashoffset={100 - weekProgress.percentage}
                        strokeLinecap="round"
                        transform="rotate(-90 18 18)"
                      />
                      <text
                        x="18" y="20"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#3b82f6"
                        fontWeight="bold"
                      >
                        {weekProgress.completed}/{weekProgress.total}
                      </text>
                    </svg>
                  </div>
                </div>
              </div>

              {isTodayTrainingDay ? (
                <>
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Dumbbell className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Today's focus: </span>
                    </div>
                    <p className="text-sm text-blue-700">
                      {todayMuscleGroups.join(' • ')}
                    </p>
                  </div>

                  <Button onClick={startWorkout} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-medium shadow-lg">
                    <Play className="w-5 h-5" />
                    Start Workout
                  </Button>
                </>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BatteryCharging className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Rest Day</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Today is your scheduled rest day. Take time to recover!
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button
                      onClick={startWorkout}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-medium shadow-lg"
                    >
                      <Play className="w-5 h-5" />
                      Start Workout
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-md  bg-white/80 ">
            <CardContent>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>

              <div className="space-y-4">
                {recentWorkouts.length > 0 ? (
                  <>
                    {recentWorkouts.map((workout, index) => {
                      const workoutInfo = formatWorkoutDate(workout);
                      return (
                        <div key={workout._id} className="border-l-2 border-gray-200 pl-4 py-1 pr-1 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-full">
                                <Dumbbell className="text-green-600 w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {index === 0 ? "Last trained" : "Previous workout"}
                                </p>
                                <p className="text-sm text-gray-500">{workoutInfo?.day} ({workoutInfo?.focus})</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            {workout?.totalVolume && (
                              <p className="text-gray-500 text-sm flex items-center space-x-2">
                                <Weight className="w-4 h-4 text-gray-500" />
                                <span className="font-bold text-slate-900">{workout.totalVolume.toLocaleString()}</span>
                                <span className="text-gray-500">lbs</span>
                              </p>
                            )}
                            {workout?.duration && (
                              <div className="text-gray-500 text-sm flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <div>
                                  <span className="font-bold text-slate-900">{formatDuration(workout.duration)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <p className="text-sm text-gray-600">No recent workouts</p>
                )}



                {/* View Workout History and My Templates */}
                <div className="pt-6 flex justify-between">
                  <Link
                    href="/progress"
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Workout History
                  </Link>
                  <Link
                    href="/templates"
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    My Routines
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
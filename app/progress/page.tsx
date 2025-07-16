'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import CalendarView from '@/app/components/CalendarView';
import { CalendarDays, Dumbbell, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WorkoutHistory from './components/WorkoutHistory';
import Analytics from './components/Analytics';

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

export default function ProgressPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showCalendar, setShowCalendar] = useState(false);

  const workouts = useQuery(api.workouts.getRecentWorkouts,
    user?.id ? { userId: user.id, limit: 100 } : 'skip'
  ) as Workout[] | undefined;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Process workout data for charts
  const processWorkoutData = () => {
    if (!workouts || workouts.length === 0) return {
      volumeData: [],
      muscleGroupData: [],
      frequencyData: []
    };

    // Sort workouts by date
    const sortedWorkouts = [...workouts].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Volume data - total volume per workout over time
    const volumeData = sortedWorkouts.map(workout => ({
      date: formatDate(workout.date),
      volume: workout.totalVolume || 0
    }));

    // Muscle group data - count exercises per muscle group
    const muscleGroupCounts: Record<string, number> = {};

    workouts.forEach(workout => {
      if (workout.muscleGroups) {
        workout.muscleGroups.forEach(group => {
          muscleGroupCounts[group.name] = (muscleGroupCounts[group.name] || 0) + 1;
        });
      }
    });

    const muscleGroupData = Object.entries(muscleGroupCounts).map(([name, count]) => ({
      name,
      count
    }));

    // Workout frequency data - workouts per week
    const weekMap: Record<string, number> = {};

    sortedWorkouts.forEach(workout => {
      const date = new Date(workout.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
    });

    const frequencyData = Object.entries(weekMap).map(([week, count]) => ({
      week: `Week of ${formatDate(week)}`,
      count
    }));

    return {
      volumeData,
      muscleGroupData,
      frequencyData
    };
  };

  const { volumeData, muscleGroupData, frequencyData } = processWorkoutData();

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
        {/* Header */}
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Progress</h1>
              <p className="text-sm text-gray-500">Track your workout history</p>
            </div>
            <button onClick={() => setShowCalendar(!showCalendar)} className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <CalendarDays className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Calendar View */}
        {showCalendar && (
          <div className="bg-white rounded-xl border p-4 mb-6">
            <div className="calendar-grid">
              <CalendarView workouts={workouts || []} />
            </div>
          </div>
        )}

        {/* Stats overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Total Workouts</p>
            <p className="text-xl font-bold text-black">{workouts?.length || 0}</p>
          </div>
          <div className="bg-white border p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">
              This Month
            </p>
            <p className="text-xl font-bold text-black">
              {workouts?.filter((w: Workout) => {
                const date = new Date(w.date);
                const now = new Date();
                return date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();
              }).length || 0}
            </p>
          </div>
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="history">Workout History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="history">
            <WorkoutHistory 
              workouts={workouts || []} 
            />
          </TabsContent>
          <TabsContent value="analytics">
            <Analytics
              volumeData={volumeData}
              muscleGroupData={muscleGroupData}
              frequencyData={frequencyData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

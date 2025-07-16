'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import BottomNav from '@/app/components/BottomNav';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

interface Workout {
  _id: string;
  date: string;
  name: string;
  duration?: number;
  totalVolume?: number;
  exercises?: {
    name: string;
    muscleGroup: string;
    sets: {
      setNumber: number;
      reps: number;
      weight: number;
      completed: boolean;
    }[];
    notes: string;
  }[];
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

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('volume');
  
  // Get user workouts from Convex
  const workouts = useQuery(api.workouts.getRecentWorkouts,
    user?.id ? { userId: user.id, limit: 100 } : 'skip'
  ) as Workout[] | undefined;
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);
  
  // Process workout data for charts
  const processWorkoutData = () => {
    if (!workouts || workouts.length === 0) return {
      volumeData: [],
      muscleGroupData: [],
      frequencyData: [],
      progressData: []
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
      if (workout.exercises) {
        workout.exercises.forEach(exercise => {
          const group = exercise.muscleGroup;
          muscleGroupCounts[group] = (muscleGroupCounts[group] || 0) + 1;
        });
      } else if (workout.muscleGroups) {
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
    
    // Progress data - track specific exercises
    const progressMap: Record<string, any[]> = {};
    
    sortedWorkouts.forEach(workout => {
      if (workout.exercises) {
        workout.exercises.forEach(exercise => {
          if (!progressMap[exercise.name]) {
            progressMap[exercise.name] = [];
          }
          
          // Calculate 1RM estimate for this exercise
          const maxSet = exercise.sets.reduce((max, set) => {
            const oneRM = set.weight * (1 + set.reps / 30);
            return oneRM > max ? oneRM : max;
          }, 0);
          
          progressMap[exercise.name].push({
            date: formatDate(workout.date),
            estimatedMax: Math.round(maxSet)
          });
        });
      } else if (workout.muscleGroups) {
        workout.muscleGroups.forEach(group => {
          group.exercises.forEach(exercise => {
            if (!progressMap[exercise.name]) {
              progressMap[exercise.name] = [];
            }
            
            // Calculate total volume for this exercise
            let totalVolume = 0;
            exercise.sets.forEach(set => {
              if (set.completed) {
                const weight = parseInt(set.weight) || 0;
                const reps = parseInt(set.reps) || 0;
                totalVolume += weight * reps;
              }
            });
            
            progressMap[exercise.name].push({
              date: formatDate(workout.date),
              volume: totalVolume
            });
          });
        });
      }
    });
    
    // Get top 3 exercises by frequency
    const exerciseFrequency: Record<string, number> = {};
    Object.keys(progressMap).forEach(exercise => {
      exerciseFrequency[exercise] = progressMap[exercise].length;
    });
    
    const topExercises = Object.entries(exerciseFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
    
    const progressData = topExercises.map(exercise => ({
      name: exercise,
      data: progressMap[exercise]
    }));
    
    return {
      volumeData,
      muscleGroupData,
      frequencyData,
      progressData
    };
  };
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const { volumeData, muscleGroupData, frequencyData, progressData } = processWorkoutData();
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 text-sm mt-1">Visualize your progress</p>
            </div>
            <button 
              onClick={() => router.push('/progress')}
              className="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
              aria-label="Back to progress"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </header>
        
        {/* Tab navigation */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('volume')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                activeTab === 'volume' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setActiveTab('muscles')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                activeTab === 'muscles' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Muscles
            </button>
            <button
              onClick={() => setActiveTab('frequency')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                activeTab === 'frequency' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Frequency
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
                activeTab === 'progress' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Progress
            </button>
          </div>
        </div>
        
        {/* Charts */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {activeTab === 'volume' && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Volume Over Time</h2>
              {volumeData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={volumeData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="volume" stroke="#0088FE" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No volume data available yet.</p>
              )}
            </>
          )}
          
          {activeTab === 'muscles' && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Muscle Group Focus</h2>
              {muscleGroupData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={muscleGroupData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {muscleGroupData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No muscle group data available yet.</p>
              )}
            </>
          )}
          
          {activeTab === 'frequency' && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Workout Frequency</h2>
              {frequencyData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={frequencyData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="week" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No frequency data available yet.</p>
              )}
            </>
          )}
          
          {activeTab === 'progress' && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Exercise Progress</h2>
              {progressData.length > 0 ? (
                <>
                  {progressData.map((exercise, index) => (
                    <div key={exercise.name} className={index > 0 ? 'mt-6' : ''}>
                      <h3 className="text-md font-medium text-gray-700 mb-2">{exercise.name}</h3>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={exercise.data}
                            margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              angle={-45}
                              textAnchor="end"
                              height={40}
                              tick={{ fontSize: 10 }}
                            />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey={exercise.data[0].estimatedMax !== undefined ? "estimatedMax" : "volume"} 
                              stroke={COLORS[index % COLORS.length]} 
                              activeDot={{ r: 8 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-center text-gray-500 py-8">No progress data available yet.</p>
              )}
            </>
          )}
        </div>
        
        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500 mb-1">Total Workouts</p>
            <p className="text-2xl font-bold text-gray-900">{workouts?.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500 mb-1">Total Volume</p>
            <p className="text-2xl font-bold text-gray-900">
              {workouts?.reduce((sum, workout) => sum + (workout.totalVolume || 0), 0).toLocaleString()} kg
            </p>
          </div>
        </div>
        
        {/* Bottom navigation */}
        <BottomNav />
      </div>
    </div>
  );
} 
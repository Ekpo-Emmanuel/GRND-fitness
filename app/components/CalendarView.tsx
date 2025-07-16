'use client';

import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Workout {
  _id: string;
  date: string;
  name: string;
}

interface CalendarViewProps {
  workouts: Workout[];
}

export default function CalendarView({ workouts }: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Function to check if a date has a workout
  const hasWorkout = (date: Date | undefined): boolean => {
    if (!date) return false;
    
    const dateToCheck = date.toISOString().split('T')[0];
    return workouts.some(workout => {
      const workoutDate = new Date(workout.date).toISOString().split('T')[0];
      return workoutDate === dateToCheck;
    });
  };
  
  // Get workouts for the selected date
  const getWorkoutsForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    const dateToCheck = date.toISOString().split('T')[0];
    return workouts.filter(workout => {
      const workoutDate = new Date(workout.date).toISOString().split('T')[0];
      return workoutDate === dateToCheck;
    });
  };
  
  const selectedDateWorkouts = getWorkoutsForDate(date);
  
  return (
    <div className="w-full">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border w-full"
        modifiers={{
          workout: (date) => hasWorkout(date),
        }}
        modifiersClassNames={{
          workout: "bg-green-100 rounded font-medium text-green-900",
        }}
      />
      
      {selectedDateWorkouts.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2 text-black">
            Workouts on {date ? format(date, 'MMMM d, yyyy') : ''}
          </h3>
          <div className="space-y-2">
            {selectedDateWorkouts.map((workout) => (
              <div key={workout._id} className="p-2 border rounded-md bg-white">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm text-gray-500">{workout.name}</span>
                  {/* <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    Completed
                  </Badge> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-center space-x-4 mt-4 text-xs text-gray-600">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-blue-100 mr-1"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-green-100 mr-1"></div>
          <span>Workout</span>
        </div>
      </div>
    </div>
  );
} 
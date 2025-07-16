import { Button } from '@/components/ui/button';
import { Id } from '@/convex/_generated/dataModel';
import { Play } from 'lucide-react';

interface StartWorkoutButtonProps {
  templateId: Id<'workoutTemplates'> | null;
  isStartingWorkout: boolean;
  handleStartWorkout: (templateId: Id<'workoutTemplates'>) => void;
  inModal?: boolean;
}

export default function StartWorkoutButton({ 
  templateId, 
  isStartingWorkout, 
  handleStartWorkout,
  inModal = false
}: StartWorkoutButtonProps) {
  if (!templateId) {
    return null;
  }
  
  // If used inside a modal, don't render the fixed container
  if (inModal) {
    return (
      <Button
        onClick={() => handleStartWorkout(templateId)}
        disabled={isStartingWorkout}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
      >
        {isStartingWorkout ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Starting...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Start Workout
          </>
        )}
      </Button>
    );
  }
  
  // Default fixed bottom button
  return (
    <div className="fixed bottom-18 left-0 right-0 bg-white px-4 pb-6 z-10">
      <div className="max-w-md mx-auto">
        <Button
          onClick={() => handleStartWorkout(templateId)}
          disabled={isStartingWorkout}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          {isStartingWorkout ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Starting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Workout
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 
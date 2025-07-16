'use client';

interface ConfirmationStepProps {
  data: {
    name: string;
    age: string;
    height: string;
    weight: string;
    trainingDays: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
    muscleFocus: string[];
  };
}

export default function ConfirmationStep({ data }: ConfirmationStepProps) {
  const selectedDays = Object.entries(data.trainingDays)
    .filter(([_, selected]) => selected)
    .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));

  const muscleGroupLabels: Record<string, string> = {
    chest: 'Chest',
    back: 'Back',
    arms: 'Arms',
    legs: 'Legs',
    core: 'Core',
    shoulders: 'Shoulders',
    fullBody: 'Full Body',
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Confirm Your Information</h2>
      <p className="text-gray-600 mb-6">Please review your information before we build your plan.</p>
      
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-500">Name:</div>
            <div className="font-medium">{data.name}</div>
            
            <div className="text-gray-500">Age:</div>
            <div className="font-medium">{data.age} years</div>
            
            {data.height && (
              <>
                <div className="text-gray-500">Height:</div>
                <div className="font-medium">{data.height} cm</div>
              </>
            )}
            
            {data.weight && (
              <>
                <div className="text-gray-500">Weight:</div>
                <div className="font-medium">{data.weight} kg</div>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Training Schedule</h3>
          <div className="text-gray-500 mb-1">Training Days:</div>
          <div className="font-medium">
            {selectedDays.length > 0 ? selectedDays.join(', ') : 'None selected'}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Muscle Focus</h3>
          <div className="text-gray-500 mb-1">Target Areas:</div>
          <div className="font-medium">
            {data.muscleFocus.length > 0 
              ? data.muscleFocus.map(id => muscleGroupLabels[id]).join(', ') 
              : 'None selected'}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Click "Build My Plan" to create your personalized workout plan
        </p>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';

interface MuscleGroupStepProps {
  data: {
    muscleFocus: string[];
  };
  updateData: (data: Partial<{
    muscleFocus: string[];
  }>) => void;
}

export default function MuscleGroupStep({ data, updateData }: MuscleGroupStepProps) {
  const [error, setError] = useState('');

  const muscleGroups = [
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'arms', label: 'Arms' },
    { id: 'legs', label: 'Legs' },
    { id: 'core', label: 'Core' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'fullBody', label: 'Full Body' },
  ];

  const validateForm = () => {
    if (data.muscleFocus.length === 0) {
      setError('Please select at least one muscle group');
      return false;
    }
    setError('');
    return true;
  };

  useEffect(() => {
    validateForm();
  }, [data.muscleFocus]);

  const handleToggle = (muscleId: string) => {
    if (data.muscleFocus.includes(muscleId)) {
      // Remove from selection
      updateData({
        muscleFocus: data.muscleFocus.filter(id => id !== muscleId),
      });
    } else {
      // Add to selection
      updateData({
        muscleFocus: [...data.muscleFocus, muscleId],
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Muscle Group Focus</h2>
      <p className="text-gray-600 mb-4">Select the muscle groups you want to focus on</p>
      
      <div className="grid grid-cols-2 gap-3">
        {muscleGroups.map(group => (
          <div
            key={group.id}
            onClick={() => handleToggle(group.id)}
            className={`
              p-3 rounded-lg border-2 cursor-pointer transition-colors
              ${data.muscleFocus.includes(group.id)
                ? 'bg-blue-100 border-blue-500'
                : 'bg-white border-gray-200 hover:bg-gray-50'}
            `}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                id={group.id}
                checked={data.muscleFocus.includes(group.id)}
                onChange={() => {}} // Handled by parent div click
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={group.id} className="ml-2 block text-gray-700 cursor-pointer">
                {group.label}
              </label>
            </div>
          </div>
        ))}
      </div>
      
      {error && (
        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
} 
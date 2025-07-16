'use client';

import { useState, useEffect } from 'react';

interface TrainingDaysStepProps {
  data: {
    trainingDays: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
  };
  updateData: (data: Partial<{
    trainingDays: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
  }>) => void;
}

export default function TrainingDaysStep({ data, updateData }: TrainingDaysStepProps) {
  const [error, setError] = useState('');

  const validateForm = () => {
    const selectedDays = Object.values(data.trainingDays).filter(Boolean).length;
    if (selectedDays === 0) {
      setError('Please select at least one training day');
      return false;
    }
    setError('');
    return true;
  };

  useEffect(() => {
    validateForm();
  }, [data.trainingDays]);

  const handleChange = (day: keyof typeof data.trainingDays) => {
    updateData({
      trainingDays: {
        ...data.trainingDays,
        [day]: !data.trainingDays[day],
      },
    });
  };

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ] as const;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Training Days</h2>
      <p className="text-gray-600 mb-4">Select the days you plan to work out (at least one)</p>
      
      <div className="space-y-3">
        {days.map(({ key, label }) => (
          <div key={key} className="flex items-center">
            <input
              type="checkbox"
              id={key}
              checked={data.trainingDays[key]}
              onChange={() => handleChange(key)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={key} className="ml-2 block text-gray-700">
              {label}
            </label>
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
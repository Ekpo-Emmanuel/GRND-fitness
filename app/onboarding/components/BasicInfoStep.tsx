'use client';

import { useState, useEffect } from 'react';

interface BasicInfoStepProps {
  data: {
    name: string;
    age: string;
    height: string;
    weight: string;
  };
  updateData: (data: Partial<{
    name: string;
    age: string;
    height: string;
    weight: string;
  }>) => void;
}

export default function BasicInfoStep({ data, updateData }: BasicInfoStepProps) {
  const [errors, setErrors] = useState({
    name: '',
    age: '',
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      age: '',
    };
    
    if (!data.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!data.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(parseInt(data.age)) || parseInt(data.age) < 13 || parseInt(data.age) > 100) {
      newErrors.age = 'Please enter a valid age between 13 and 100';
    }
    
    setErrors(newErrors);
    return !newErrors.name && !newErrors.age;
  };

  useEffect(() => {
    validateForm();
  }, [data.name, data.age]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={data.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Your name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
        
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            Age <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={data.age}
            onChange={handleChange}
            min="13"
            max="100"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.age ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Your age"
          />
          {errors.age && <p className="mt-1 text-sm text-red-500">{errors.age}</p>}
        </div>
        
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
            Height (cm) <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="number"
            id="height"
            name="height"
            value={data.height}
            onChange={handleChange}
            min="100"
            max="250"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Height in cm"
          />
        </div>
        
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
            Weight (kg) <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={data.weight}
            onChange={handleChange}
            min="30"
            max="300"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Weight in kg"
          />
        </div>
      </div>
    </div>
  );
} 
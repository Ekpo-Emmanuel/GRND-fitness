'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ui/image-upload';
import { uploadProfileImage } from '@/lib/image-upload';
import { 
  User, 
  Calendar, 
  Target, 
  Save, 
  ArrowLeft, 
  UserCheck,
  Ruler,
  Scale,
  Clock
} from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Get user profile from Convex
  const userProfile = useQuery(api.users.getProfile, 
    user?.id ? { userId: user.id } : 'skip'
  );
  
  // Update profile mutation
  const updateProfile = useMutation(api.users.updateProfile);
  const updateProfilePicture = useMutation(api.users.updateProfilePicture);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    profilePicture: '',
    age: '',
    height: '',
    weight: '',
    trainingDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    muscleFocus: [] as string[]
  });
  
  // Initialize form data when profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        profilePicture: userProfile.profilePicture || '',
        age: userProfile.age ? String(userProfile.age) : '',
        height: userProfile.height ? String(userProfile.height) : '',
        weight: userProfile.weight ? String(userProfile.weight) : '',
        trainingDays: userProfile.trainingDays || {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false
        },
        muscleFocus: userProfile.muscleFocus || []
      });
    }
  }, [userProfile]);
  
  // Debug logging
  useEffect(() => {
    console.log('Current userProfile.profilePicture:', userProfile?.profilePicture);
  }, [userProfile?.profilePicture]);
  
  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!user?.id) return;
    
    setIsUploadingImage(true);
    try {
      console.log('Starting image upload for file:', file.name, file.size);
      const imageUrl = await uploadProfileImage(file);
      console.log('Image uploaded successfully, URL:', imageUrl.substring(0, 100) + '...');
      
      // Update the profile picture in the database
      await updateProfilePicture({
        userId: user.id,
        profilePicture: imageUrl
      });
      console.log('Profile picture saved to database');
      
      // Update local state
      setFormData(prev => ({
        ...prev,
        profilePicture: imageUrl
      }));
      
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  // Handle image removal
  const handleImageRemove = async () => {
    if (!user?.id) return;
    
    try {
      await updateProfilePicture({
        userId: user.id,
        profilePicture: ''
      });
      
      setFormData(prev => ({
        ...prev,
        profilePicture: ''
      }));
      
      toast.success('Profile picture removed');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove profile picture');
    }
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle training day toggle
  const toggleTrainingDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      trainingDays: {
        ...prev.trainingDays,
        [day]: !prev.trainingDays[day as keyof typeof prev.trainingDays]
      }
    }));
  };
  
  // Handle muscle focus toggle
  const toggleMuscleFocus = (muscle: string) => {
    setFormData(prev => {
      const currentFocus = prev.muscleFocus;
      
      if (currentFocus.includes(muscle)) {
        return {
          ...prev,
          muscleFocus: currentFocus.filter(m => m !== muscle)
        };
      } else {
        return {
          ...prev,
          muscleFocus: [...currentFocus, muscle]
        };
      }
    });
  };
  
  // Save profile
  const saveProfile = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    
    try {
      await updateProfile({
        userId: user.id,
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        trainingDays: formData.trainingDays,
        muscleFocus: formData.muscleFocus
      });
      
      toast.success('Profile updated successfully!');
      router.push('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Predefined muscle groups
  const allMuscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
    'Legs', 'Glutes', 'Abs', 'Calves'
  ];
  
  useEffect(() => {
    // Redirect if not authenticated
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

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/profile')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/profile')}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
          <p className="text-gray-600">Update your personal information and preferences</p>
        </div>
        
        {/* Personal Information */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center">
              <Label className="text-sm font-medium text-gray-700 mb-3">Profile Picture</Label>
              <ImageUpload
                currentImage={userProfile?.profilePicture}
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                size="lg"
                className="mb-4"
              />
              {isUploadingImage && (
                <p className="text-sm text-gray-500">Uploading image...</p>
              )}
            </div>
            
            <Separator />
            
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                  Age
                </Label>
                <Input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="25"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="height" className="text-sm font-medium text-gray-700">
                  Height (cm)
                </Label>
                <Input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="175"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                  Weight (kg)
                </Label>
                <Input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="70"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Schedule */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Training Schedule
            </CardTitle>
            <p className="text-sm text-gray-600">Select the days you typically work out</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {dayLabels.map((day, index) => {
                const dayKey = dayKeys[index];
                const isSelected = formData.trainingDays[dayKey as keyof typeof formData.trainingDays];
                
                return (
                  <button
                    key={dayKey}
                    type="button"
                    onClick={() => toggleTrainingDay(dayKey)}
                    className={`flex items-center justify-center h-12 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isSelected 
                        ? 'bg-green-100 text-green-800 border-2 border-green-300 shadow-sm' 
                        : 'bg-gray-50 text-gray-500 border-2 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Muscle Focus */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Target className="h-5 w-5 mr-2 text-purple-600" />
              Muscle Focus
            </CardTitle>
            <p className="text-sm text-gray-600">Select your primary training focus areas</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {allMuscleGroups.map(muscle => (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => toggleMuscleFocus(muscle)}
                  className={`p-3 text-center rounded-lg text-sm font-medium transition-all duration-200 ${
                    formData.muscleFocus.includes(muscle)
                      ? 'bg-purple-100 text-purple-800 border-2 border-purple-300 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>
            
            {formData.muscleFocus.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Selected focus areas:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.muscleFocus.map(muscle => (
                    <Badge key={muscle} variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-600" />
              Training Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Training days:</span>
                <span className="font-medium">
                  {Object.values(formData.trainingDays).filter(Boolean).length} days/week
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Focus areas:</span>
                <span className="font-medium">{formData.muscleFocus.length} muscle groups</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Save Button */}
        <div className="sticky bottom-4 bg-white rounded-lg shadow-lg p-4 border border-gray-100">
          <Button
            onClick={saveProfile}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSaving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 
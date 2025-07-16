'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import SignOutButton from '../auth/components/SignOutButton';
import BottomNav from '@/app/components/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  User, 
  Settings, 
  Activity, 
  Target, 
  Calendar, 
  Edit3, 
  Save, 
  ChevronDown, 
  ChevronUp,
  TrendingUp,
  Ruler,
  Scale
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showMeasurements, setShowMeasurements] = useState(false);
  
  // Get user profile from Convex
  const userProfile = useQuery(api.users.getProfile, 
    user?.id ? { userId: user.id } : 'skip'
  );

  // Update measurements mutation
  const updateMeasurements = useMutation(api.users.updateMeasurements);
  
  // State for measurement inputs
  const [measurements, setMeasurements] = useState({
    bodyFat: userProfile?.measurements?.bodyFat || '',
    caloricIntake: userProfile?.measurements?.caloricIntake || '',
    neck: userProfile?.measurements?.neck || '',
    shoulders: userProfile?.measurements?.shoulders || '',
    chest: userProfile?.measurements?.chest || '',
    leftBicep: userProfile?.measurements?.leftBicep || '',
    rightBicep: userProfile?.measurements?.rightBicep || '',
    leftForearm: userProfile?.measurements?.leftForearm || '',
    rightForearm: userProfile?.measurements?.rightForearm || '',
    abs: userProfile?.measurements?.abs || '',
    waist: userProfile?.measurements?.waist || '',
    hips: userProfile?.measurements?.hips || '',
    leftThigh: userProfile?.measurements?.leftThigh || '',
    rightThigh: userProfile?.measurements?.rightThigh || '',
    leftCalf: userProfile?.measurements?.leftCalf || '',
    rightCalf: userProfile?.measurements?.rightCalf || ''
  });

  // Update measurements state when profile data loads
  useEffect(() => {
    if (userProfile?.measurements) {
      setMeasurements({
        bodyFat: userProfile.measurements.bodyFat || '',
        caloricIntake: userProfile.measurements.caloricIntake || '',
        neck: userProfile.measurements.neck || '',
        shoulders: userProfile.measurements.shoulders || '',
        chest: userProfile.measurements.chest || '',
        leftBicep: userProfile.measurements.leftBicep || '',
        rightBicep: userProfile.measurements.rightBicep || '',
        leftForearm: userProfile.measurements.leftForearm || '',
        rightForearm: userProfile.measurements.rightForearm || '',
        abs: userProfile.measurements.abs || '',
        waist: userProfile.measurements.waist || '',
        hips: userProfile.measurements.hips || '',
        leftThigh: userProfile.measurements.leftThigh || '',
        rightThigh: userProfile.measurements.rightThigh || '',
        leftCalf: userProfile.measurements.leftCalf || '',
        rightCalf: userProfile.measurements.rightCalf || ''
      });
    }
  }, [userProfile?.measurements]);
  
  // Handle input change
  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMeasurements(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save measurements
  const saveMeasurements = async () => {
    if (!user?.id) return;
    
    try {
      await updateMeasurements({
        userId: user.id,
        measurements
      });
      toast.success('Measurements saved successfully!');
      setShowMeasurements(false);
    } catch (error) {
      console.error('Error saving measurements:', error);
      toast.error('Failed to save measurements. Please try again.');
    }
  };
  
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your fitness journey</p>
        </div>
        
        {/* Profile Overview Card */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              {userProfile?.profilePicture ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30">
                  <img
                    src={userProfile.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="bg-white/20 rounded-full p-3">
                  <User className="h-8 w-8" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{userProfile?.name || user.email?.split('@')[0] || 'User'}</h2>
                <p className="text-blue-100 text-sm">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/profile/edit')}
                className="text-white hover:bg-white/20"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Scale className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userProfile?.weight || '--'}</p>
              <p className="text-xs text-gray-500">kg</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Ruler className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userProfile?.height || '--'}</p>
              <p className="text-xs text-gray-500">cm</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{userProfile?.age || '--'}</p>
              <p className="text-xs text-gray-500">years</p>
            </CardContent>
          </Card>
        </div>

        {/* Training Schedule */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Training Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {dayLabels.map((day, index) => {
                const dayKey = dayKeys[index];
                const isTrainingDay = userProfile?.trainingDays?.[dayKey as keyof typeof userProfile.trainingDays];
                
                return (
                  <div 
                    key={dayKey} 
                    className={`flex items-center justify-center h-12 rounded-lg text-sm font-medium transition-colors ${
                      isTrainingDay 
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-200' 
                        : 'bg-gray-50 text-gray-400 border-2 border-gray-100'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Muscle Focus */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              Muscle Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userProfile?.muscleFocus?.length ? (
                userProfile.muscleFocus.map(muscle => (
                  <Badge key={muscle} variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    {muscle}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No muscle groups selected</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Body Measurements */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <Activity className="h-5 w-5 mr-2 text-purple-600" />
                Body Measurements
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMeasurements(!showMeasurements)}
                className="text-purple-600 hover:bg-purple-50"
              >
                {showMeasurements ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!showMeasurements ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{userProfile?.measurements?.bodyFat || '--'}</p>
                  <p className="text-xs text-gray-500">Body Fat %</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{userProfile?.measurements?.caloricIntake || '--'}</p>
                  <p className="text-xs text-gray-500">Calories</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{userProfile?.measurements?.chest || '--'}</p>
                  <p className="text-xs text-gray-500">Chest cm</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{userProfile?.measurements?.waist || '--'}</p>
                  <p className="text-xs text-gray-500">Waist cm</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Core Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="bodyFat" className="text-xs text-gray-500">Body Fat (%)</Label>
                      <Input
                        id="bodyFat"
                        type="number"
                        name="bodyFat"
                        value={measurements.bodyFat}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="15"
                      />
                    </div>
                    <div>
                      <Label htmlFor="caloricIntake" className="text-xs text-gray-500">Calories (kcal)</Label>
                      <Input
                        id="caloricIntake"
                        type="number"
                        name="caloricIntake"
                        value={measurements.caloricIntake}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="2500"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Upper Body</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="neck" className="text-xs text-gray-500">Neck (cm)</Label>
                      <Input
                        id="neck"
                        type="number"
                        name="neck"
                        value={measurements.neck}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="38"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shoulders" className="text-xs text-gray-500">Shoulders (cm)</Label>
                      <Input
                        id="shoulders"
                        type="number"
                        name="shoulders"
                        value={measurements.shoulders}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="120"
                      />
                    </div>
                    <div>
                      <Label htmlFor="chest" className="text-xs text-gray-500">Chest (cm)</Label>
                      <Input
                        id="chest"
                        type="number"
                        name="chest"
                        value={measurements.chest}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="leftBicep" className="text-xs text-gray-500">Left Bicep (cm)</Label>
                      <Input
                        id="leftBicep"
                        type="number"
                        name="leftBicep"
                        value={measurements.leftBicep}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="35"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rightBicep" className="text-xs text-gray-500">Right Bicep (cm)</Label>
                      <Input
                        id="rightBicep"
                        type="number"
                        name="rightBicep"
                        value={measurements.rightBicep}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="35"
                      />
                    </div>
                    <div>
                      <Label htmlFor="leftForearm" className="text-xs text-gray-500">Left Forearm (cm)</Label>
                      <Input
                        id="leftForearm"
                        type="number"
                        name="leftForearm"
                        value={measurements.leftForearm}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rightForearm" className="text-xs text-gray-500">Right Forearm (cm)</Label>
                      <Input
                        id="rightForearm"
                        type="number"
                        name="rightForearm"
                        value={measurements.rightForearm}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Midsection</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="abs" className="text-xs text-gray-500">Abs (cm)</Label>
                      <Input
                        id="abs"
                        type="number"
                        name="abs"
                        value={measurements.abs}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="85"
                      />
                    </div>
                    <div>
                      <Label htmlFor="waist" className="text-xs text-gray-500">Waist (cm)</Label>
                      <Input
                        id="waist"
                        type="number"
                        name="waist"
                        value={measurements.waist}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="80"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hips" className="text-xs text-gray-500">Hips (cm)</Label>
                      <Input
                        id="hips"
                        type="number"
                        name="hips"
                        value={measurements.hips}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="95"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Lower Body</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="leftThigh" className="text-xs text-gray-500">Left Thigh (cm)</Label>
                      <Input
                        id="leftThigh"
                        type="number"
                        name="leftThigh"
                        value={measurements.leftThigh}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rightThigh" className="text-xs text-gray-500">Right Thigh (cm)</Label>
                      <Input
                        id="rightThigh"
                        type="number"
                        name="rightThigh"
                        value={measurements.rightThigh}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <Label htmlFor="leftCalf" className="text-xs text-gray-500">Left Calf (cm)</Label>
                      <Input
                        id="leftCalf"
                        type="number"
                        name="leftCalf"
                        value={measurements.leftCalf}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rightCalf" className="text-xs text-gray-500">Right Calf (cm)</Label>
                      <Input
                        id="rightCalf"
                        type="number"
                        name="rightCalf"
                        value={measurements.rightCalf}
                        onChange={handleMeasurementChange}
                        className="mt-1"
                        placeholder="40"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={saveMeasurements}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Measurements
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <SignOutButton className="w-full justify-start bg-red-50 text-red-600 border-red-200 hover:bg-red-100" />
      </div>
    </div>
  );
} 
// Script to seed workout data for a specific user
require('dotenv').config();
const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");

// Initialize the Convex client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  console.error("Error: NEXT_PUBLIC_CONVEX_URL environment variable not set");
  console.error("Create a .env file with your Convex URL or pass it as an environment variable");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

// User ID to seed data for
const USER_ID = "09e16964-0707-4c20-9655-082f2079ba7e";

// Define muscle groups and their exercises
const muscleGroups = {
  Chest: [
    "Bench Press",
    "Incline Bench Press",
    "Decline Bench Press",
    "Dumbbell Fly",
    "Cable Crossover",
    "Push-Up"
  ],
  Back: [
    "Pull-Up",
    "Lat Pulldown",
    "Bent Over Row",
    "T-Bar Row",
    "Seated Cable Row",
    "Deadlift"
  ],
  Shoulders: [
    "Overhead Press",
    "Lateral Raise",
    "Front Raise",
    "Reverse Fly",
    "Upright Row",
    "Face Pull"
  ],
  Arms: [
    "Bicep Curl",
    "Tricep Extension",
    "Hammer Curl",
    "Skull Crusher",
    "Preacher Curl",
    "Cable Pushdown"
  ],
  Legs: [
    "Squat",
    "Leg Press",
    "Lunge",
    "Leg Extension",
    "Leg Curl",
    "Romanian Deadlift"
  ],
  Core: [
    "Plank",
    "Crunch",
    "Russian Twist",
    "Leg Raise",
    "Mountain Climber",
    "Ab Rollout"
  ]
};

// Generate a random date within the last 90 days
function getRandomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90) + 1;
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// Generate random integer between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random workout data
function generateWorkout() {
  const date = getRandomDate();
  const startTime = new Date(date);
  startTime.setHours(getRandomInt(6, 20), getRandomInt(0, 59), 0, 0);
  
  // Duration between 30 and 90 minutes
  const durationMinutes = getRandomInt(30, 90);
  
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);
  
  // Select 1-3 random muscle groups
  const numGroups = getRandomInt(1, 3);
  const selectedGroups = [];
  const groupKeys = Object.keys(muscleGroups);
  
  while (selectedGroups.length < numGroups) {
    const group = groupKeys[Math.floor(Math.random() * groupKeys.length)];
    if (!selectedGroups.includes(group)) {
      selectedGroups.push(group);
    }
  }
  
  // Generate exercises for each muscle group
  const exercises = [];
  let totalSets = 0;
  let totalReps = 0;
  let totalWeight = 0;
  
  selectedGroups.forEach(group => {
    const groupExercises = muscleGroups[group];
    const numExercises = getRandomInt(2, 4); // 2-4 exercises per muscle group
    
    const selectedExercises = [];
    while (selectedExercises.length < numExercises) {
      const exercise = groupExercises[Math.floor(Math.random() * groupExercises.length)];
      if (!selectedExercises.includes(exercise)) {
        selectedExercises.push(exercise);
      }
    }
    
    selectedExercises.forEach(exerciseName => {
      const numSets = getRandomInt(3, 5); // 3-5 sets per exercise
      const sets = [];
      
      for (let i = 0; i < numSets; i++) {
        const reps = getRandomInt(6, 15);
        const weight = getRandomInt(5, 100) * 5; // Weight in 5lb increments
        
        sets.push({
          setNumber: i + 1,
          reps,
          weight,
          completed: true
        });
        
        totalSets++;
        totalReps += reps;
        totalWeight += reps * weight;
      }
      
      exercises.push({
        name: exerciseName,
        muscleGroup: group,
        sets,
        notes: Math.random() > 0.7 ? `Feeling ${Math.random() > 0.5 ? 'strong' : 'tired'} today` : ""
      });
    });
  });
  
  return {
    userId: USER_ID,
    name: `${selectedGroups.join(" & ")} Workout`,
    date: date.toISOString(),
    startTime: startTime.getTime(),
    endTime: endTime.getTime(),
    duration: durationMinutes * 60 * 1000, // Duration in milliseconds
    exercises,
    totalSets,
    totalReps,
    totalWeight,
    completed: true
  };
}

// Main function to seed workouts
async function seedWorkouts() {
  try {
    console.log("Starting workout seeding process...");
    
    // Generate 30 random workouts
    const workouts = [];
    for (let i = 0; i < 30; i++) {
      workouts.push(generateWorkout());
    }
    
    // Sort workouts by date (oldest first)
    workouts.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Add workouts to database
    for (const workout of workouts) {
      console.log(`Adding workout: ${workout.name} on ${new Date(workout.date).toLocaleDateString()}`);
      await client.mutation(api.workouts.seedWorkout, { workout });
    }
    
    console.log("Workout seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding workouts:", error);
  }
}

// Run the seeding function
seedWorkouts(); 
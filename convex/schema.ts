import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    profilePicture: v.optional(v.string()),
    age: v.optional(v.number()),
    height: v.optional(v.number()),
    weight: v.optional(v.number()),
    measurements: v.optional(v.object({
      bodyFat: v.optional(v.string()),
      caloricIntake: v.optional(v.string()),
      neck: v.optional(v.string()),
      shoulders: v.optional(v.string()),
      chest: v.optional(v.string()),
      leftBicep: v.optional(v.string()),
      rightBicep: v.optional(v.string()),
      leftForearm: v.optional(v.string()),
      rightForearm: v.optional(v.string()),
      abs: v.optional(v.string()),
      waist: v.optional(v.string()),
      hips: v.optional(v.string()),
      leftThigh: v.optional(v.string()),
      rightThigh: v.optional(v.string()),
      leftCalf: v.optional(v.string()),
      rightCalf: v.optional(v.string()),
    })),
    trainingDays: v.optional(v.object({
      monday: v.boolean(),
      tuesday: v.boolean(),
      wednesday: v.boolean(),
      thursday: v.boolean(),
      friday: v.boolean(),
      saturday: v.boolean(),
      sunday: v.boolean(),
    })),
    muscleFocus: v.optional(v.array(v.string())),
    onboardingComplete: v.optional(v.boolean()),
    createdAt: v.optional(v.string()),
  }),
  
  workoutTemplates: defineTable({
    userId: v.string(),
    folderId: v.optional(v.id("folders")),
    name: v.string(),
    description: v.optional(v.string()),
    targetDay: v.optional(v.string()),
    muscleGroups: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        exercises: v.array(
          v.object({
            id: v.string(),
            name: v.string(),
            notes: v.optional(v.string()),
            sets: v.array(
              v.object({
                id: v.string(),
                reps: v.optional(v.string()),
                weight: v.optional(v.string()),
              })
            ),
          })
        ),
      })
    ),
    createdAt: v.string(),
    updatedAt: v.string(),
    pinned: v.optional(v.boolean()),
  }),
  
  workouts: defineTable({
    userId: v.string(),
    templateId: v.optional(v.id("workoutTemplates")),
    name: v.string(),
    date: v.string(),
    duration: v.optional(v.number()),
    totalVolume: v.optional(v.number()),
    muscleGroups: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        exercises: v.array(
          v.object({
            id: v.string(),
            name: v.string(),
            notes: v.optional(v.string()),
            sets: v.array(
              v.object({
                id: v.string(),
                reps: v.optional(v.string()),
                weight: v.optional(v.string()),
                completed: v.boolean(),
                type: v.optional(v.union(v.literal('normal'), v.literal('warmup'), v.literal('drop'), v.literal('failure'))),
              })
            ),
          })
        ),
      })
    ),
    completed: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }),
  
  folders: defineTable({
    userId: v.string(),
    name: v.string(),
    createdAt: v.string(),
    pinned: v.optional(v.boolean()),
  }),
  
  templateFolders: defineTable({
    userId: v.string(),
    templateId: v.id("workoutTemplates"),
    folderId: v.id("folders"),
    createdAt: v.string(),
  }),
}); 
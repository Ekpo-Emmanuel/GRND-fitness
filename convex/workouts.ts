import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const createWorkout = mutation({
  args: {
    userId: v.string(),
    muscleGroups: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        exercises: v.array(
          v.object({
            id: v.string(),
            name: v.string(),
            sets: v.array(
              v.object({
                id: v.string(),
                weight: v.string(),
                reps: v.string(),
                completed: v.boolean(),
                type: v.optional(v.union(v.literal('normal'), v.literal('warmup'), v.literal('drop'), v.literal('failure'))),
              })
            ),
            notes: v.optional(v.string()),
          })
        ),
      })
    ),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    return await ctx.db.insert('workouts', {
      userId: args.userId,
      name: args.name || `Workout ${now.split('T')[0]}`,
      date: now,
      completed: false,
      muscleGroups: args.muscleGroups,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateWorkout = mutation({
  args: {
    workoutId: v.id('workouts'),
    muscleGroups: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        exercises: v.array(
          v.object({
            id: v.string(),
            name: v.string(),
            sets: v.array(
              v.object({
                id: v.string(),
                weight: v.string(),
                reps: v.string(),
                completed: v.boolean(),
                type: v.optional(v.union(v.literal('normal'), v.literal('warmup'), v.literal('drop'), v.literal('failure'))),
              })
            ),
            notes: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.workoutId, {
      muscleGroups: args.muscleGroups,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const completeWorkout = mutation({
  args: {
    workoutId: v.id('workouts'),
    totalVolume: v.optional(v.number()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Ensure duration is provided and is a number
    const duration = typeof args.duration === 'number' ? args.duration : 0;
    
    return await ctx.db.patch(args.workoutId, {
      completed: true,
      totalVolume: args.totalVolume,
      duration: duration,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const getWorkout = query({
  args: { workoutId: v.id('workouts') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.workoutId);
  },
});

export const getRecentWorkouts = query({
  args: { 
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    return await ctx.db
      .query('workouts')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .order('desc')
      .take(limit);
  },
});

export const getLastWorkout = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('workouts')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .order('desc')
      .first();
  },
});

export const createWorkoutTemplate = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    muscleGroups: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        exercises: v.array(
          v.object({
            id: v.string(),
            name: v.string(),
            sets: v.array(
              v.object({
                id: v.string(),
                reps: v.optional(v.string()),
                weight: v.optional(v.string()),
              })
            ),
            notes: v.optional(v.string()),
          })
        ),
      })
    ),
    targetDay: v.optional(v.string()),
    folderId: v.optional(v.id('folders')),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    return await ctx.db.insert('workoutTemplates', {
      userId: args.userId,
      name: args.name,
      description: args.description,
      muscleGroups: args.muscleGroups,
      targetDay: args.targetDay,
      ...(args.folderId !== undefined ? { folderId: args.folderId } : {}),
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateWorkoutTemplate = mutation({
  args: {
    templateId: v.id('workoutTemplates'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    muscleGroups: v.optional(v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        exercises: v.array(
          v.object({
            id: v.string(),
            name: v.string(),
            sets: v.array(
              v.object({
                id: v.string(),
                reps: v.optional(v.string()),
                weight: v.optional(v.string()),
              })
            ),
            notes: v.optional(v.string()),
          })
        ),
      })
    )),
    targetDay: v.optional(v.string()),
    folderId: v.optional(v.id('folders')),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };
    
    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.muscleGroups !== undefined) updateData.muscleGroups = args.muscleGroups;
    if (args.targetDay !== undefined) updateData.targetDay = args.targetDay;
    if (args.folderId !== undefined) updateData.folderId = args.folderId;
    
    return await ctx.db.patch(args.templateId, updateData);
  },
});

export const deleteWorkoutTemplate = mutation({
  args: {
    templateId: v.id('workoutTemplates'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.templateId);
  },
});

export const getWorkoutTemplates = query({
  args: { 
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('workoutTemplates')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .order('desc')
      .collect();
  },
});

export const getWorkoutTemplate = query({
  args: { 
    templateId: v.id('workoutTemplates'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.templateId);
  },
});

export const saveWorkoutAsTemplate = mutation({
  args: {
    userId: v.string(),
    workoutId: v.id('workouts'),
    name: v.string(),
    description: v.optional(v.string()),
    targetDay: v.optional(v.string()),
    includeWeights: v.optional(v.boolean()),
    folderId: v.optional(v.id('folders')),
  },
  handler: async (ctx, args) => {
    // Get the workout to use as template
    const workout = await ctx.db.get(args.workoutId);
    
    if (!workout) {
      throw new Error('Workout not found');
    }
    
    // Check if the user owns this workout
    if (workout.userId !== args.userId) {
      throw new Error('Unauthorized');
    }
    
    const now = new Date().toISOString();
    
    // Convert the workout to a template format
    const templateMuscleGroups = workout.muscleGroups.map((group: any) => ({
      id: group.id,
      name: group.name,
      exercises: group.exercises.map((exercise: any) => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets.map((set: any) => ({
          id: set.id,
          // Only include weights if specified
          weight: args.includeWeights ? set.weight : undefined,
          // Always include reps as a guide
          reps: set.reps,
        })),
        notes: exercise.notes,
      })),
    }));
    
    // Create the template
    return await ctx.db.insert('workoutTemplates', {
      userId: args.userId,
      name: args.name,
      description: args.description,
      muscleGroups: templateMuscleGroups,
      targetDay: args.targetDay,
      ...(args.folderId !== undefined ? { folderId: args.folderId } : {}),
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createWorkoutFromTemplate = mutation({
  args: {
    userId: v.string(),
    templateId: v.id('workoutTemplates'),
  },
  handler: async (ctx, args) => {
    // Get the template
    const template = await ctx.db.get(args.templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Check if the user owns this template
    if (template.userId !== args.userId) {
      throw new Error('Unauthorized');
    }
    
    const now = new Date().toISOString();
    
    // Convert the template to a workout format
    const workoutMuscleGroups = template.muscleGroups.map((group: any) => ({
      id: group.id,
      name: group.name,
      exercises: group.exercises.map((exercise: any) => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets.map((set: any) => ({
          id: set.id,
          // Use template weights if available, otherwise empty
          weight: set.weight || '',
          // Use template reps if available, otherwise empty
          reps: set.reps || '',
          // All sets start as not completed
          completed: false,
        })),
        notes: exercise.notes || '',
      })),
    }));
    
    // Create the workout
    return await ctx.db.insert('workouts', {
      userId: args.userId,
      name: template.name || `Workout from template (${now.split('T')[0]})`,
      date: now,
      completed: false,
      muscleGroups: workoutMuscleGroups,
      createdAt: now,
      updatedAt: now,
    });
  },
}); 

export const seedWorkout = mutation({
  args: {
    workout: v.object({
      userId: v.string(),
      name: v.string(),
      date: v.string(),
      startTime: v.number(),
      endTime: v.number(),
      duration: v.number(),
      exercises: v.array(
        v.object({
          name: v.string(),
          muscleGroup: v.string(),
          sets: v.array(
            v.object({
              setNumber: v.number(),
              reps: v.number(),
              weight: v.number(),
              completed: v.boolean()
            })
          ),
          notes: v.string()
        })
      ),
      totalSets: v.number(),
      totalReps: v.number(),
      totalWeight: v.number(),
      completed: v.boolean()
    })
  },
  handler: async (ctx, args) => {
    const { workout } = args;
    const now = new Date().toISOString();
    
    // Check if user exists
    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('userId'), workout.userId))
      .first();
    
    if (!user) {
      throw new Error(`User not found: ${workout.userId}`);
    }
    
    // Convert exercises to the expected format
    const muscleGroups: Record<string, { id: string; name: string; exercises: any[] }> = {};
    workout.exercises.forEach(exercise => {
      const group = exercise.muscleGroup;
      if (!muscleGroups[group]) {
        muscleGroups[group] = {
          id: group.toLowerCase().replace(/\s/g, '-'),
          name: group,
          exercises: []
        };
      }
      
      muscleGroups[group].exercises.push({
        id: exercise.name.toLowerCase().replace(/\s/g, '-') + '-' + Date.now(),
        name: exercise.name,
        sets: exercise.sets.map(set => ({
          id: `set-${set.setNumber}-${Date.now()}`,
          weight: String(set.weight),
          reps: String(set.reps),
          completed: set.completed
        })),
        notes: exercise.notes || ''
      });
    });
    
    // Create the workout with the correct schema
    return await ctx.db.insert('workouts', {
      userId: workout.userId,
      name: workout.name,
      date: workout.date,
      completed: workout.completed,
      muscleGroups: Object.values(muscleGroups),
      duration: workout.duration,
      totalVolume: workout.totalWeight,
      createdAt: now,
      updatedAt: now
    });
  }
}); 

// Pin a workout template
export const pinWorkoutTemplate = mutation({
  args: {
    templateId: v.id('workoutTemplates'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.templateId, { pinned: true });
  },
});

// Unpin a workout template
export const unpinWorkoutTemplate = mutation({
  args: {
    templateId: v.id('workoutTemplates'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.templateId, { pinned: false });
  },
}); 
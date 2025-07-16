import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const getProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .first();
    
    return user;
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
    profilePicture: v.optional(v.string()),
    age: v.optional(v.number()),
    height: v.optional(v.number()),
    weight: v.optional(v.number()),
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
  },
  handler: async (ctx, args) => {
    const { userId, ...profileData } = args;
    
    // Check if user exists
    const existingUser = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('userId'), userId))
      .first();
    
    if (existingUser) {
      // Update existing user
      return await ctx.db.patch(existingUser._id, profileData);
    } else {
      // Create new user
      return await ctx.db.insert('users', {
        userId,
        ...profileData,
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
      });
    }
  },
});

export const updateProfilePicture = mutation({
  args: {
    userId: v.string(),
    profilePicture: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .first();
    
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    return await ctx.db.patch(existingUser._id, {
      profilePicture: args.profilePicture,
    });
  },
});

export const completeOnboarding = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .first();
    
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    return await ctx.db.patch(existingUser._id, {
      onboardingComplete: true,
    });
  },
});

export const isOnboardingComplete = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .first();
    
    return user?.onboardingComplete === true;
  },
}); 

export const updateMeasurements = mutation({
  args: {
    userId: v.string(),
    measurements: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .first();
    
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    return await ctx.db.patch(existingUser._id, {
      measurements: args.measurements,
    });
  },
}); 
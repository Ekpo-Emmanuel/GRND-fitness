import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all folders for a user
export const getFolders = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const folders = await ctx.db
      .query("folders")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
    return folders;
  },
});

// Create a new folder
export const createFolder = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const folderId = await ctx.db.insert("folders", {
      userId: args.userId,
      name: args.name,
      createdAt: new Date().toISOString(),
    });
    return folderId;
  },
});

// Delete a folder
export const deleteFolder = mutation({
  args: {
    folderId: v.id("folders"),
    deleteTemplates: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get all template-folder assignments for this folder
    const templateFolders = await ctx.db
      .query("templateFolders")
      .filter((q) => q.eq(q.field("folderId"), args.folderId))
      .collect();
    
    // If deleteTemplates is true, delete the templates
    if (args.deleteTemplates) {
      for (const tf of templateFolders) {
        // Delete the template
        await ctx.db.delete(tf.templateId);
        // Delete the template-folder assignment
        await ctx.db.delete(tf._id);
      }
    } else {
      // Just delete the template-folder assignments
      for (const tf of templateFolders) {
        await ctx.db.delete(tf._id);
      }
    }
    
    // Delete folder
    await ctx.db.delete(args.folderId);
    
    return true;
  },
});

// Assign template to folder
export const assignTemplateToFolder = mutation({
  args: {
    userId: v.string(),
    templateId: v.id('workoutTemplates'),
    folderId: v.id('folders'),
  },
  handler: async (ctx, args) => {
    // Set the folderId property directly on the template
    await ctx.db.patch(args.templateId, { folderId: args.folderId });
    return args.templateId;
  },
});

// Remove template from folder
export const removeTemplateFromFolder = mutation({
  args: {
    templateId: v.id('workoutTemplates'),
  },
  handler: async (ctx, args) => {
    // Set the folderId property to null
    await ctx.db.patch(args.templateId, { folderId: undefined });
    return true;
  },
});

// Get folder for a template
export const getTemplateFolder = query({
  args: {
    templateId: v.id('workoutTemplates'),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template || !template.folderId) return null;
    const folder = await ctx.db.get(template.folderId);
    return folder;
  },
});

// Get templates by folder
export const getTemplatesByFolder = query({
  args: {
    userId: v.string(),
    folderId: v.id('folders'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('workoutTemplates')
      .filter(q => q.and(
        q.eq(q.field('userId'), args.userId),
        q.eq(q.field('folderId'), args.folderId)
      ))
      .order('desc')
      .collect();
  },
}); 

// Add this mutation for renaming a folder
export const updateFolder = mutation({
  args: {
    folderId: v.id('folders'),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.folderId, { name: args.name });
  },
}); 

// Pin a folder
export const pinFolder = mutation({
  args: {
    folderId: v.id('folders'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.folderId, { pinned: true });
  },
});

// Unpin a folder
export const unpinFolder = mutation({
  args: {
    folderId: v.id('folders'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.folderId, { pinned: false });
  },
}); 
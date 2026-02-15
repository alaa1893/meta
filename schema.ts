import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  codeExecutions: defineTable({
    userId: v.id("users"),
    code: v.string(),
    language: v.literal("python"),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
    aiSuggestion: v.optional(v.string()),
    preferredLanguage: v.union(v.literal("ar"), v.literal("fr")),
  }).index("by_user", ["userId"]),
  
  codeSnippets: defineTable({
    userId: v.id("users"),
    title: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

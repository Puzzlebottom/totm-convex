import { defineTable } from "convex/server"
import { v } from "convex/values"

export const characters = defineTable({
  name: v.string(),
  userId: v.id("users"),
  encounter: v.union(v.null(), v.id("encounters")),
})
  .index("by_userId", ["userId"])
  .index("by_encounter", ["encounter"])

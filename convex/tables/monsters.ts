import { defineTable } from "convex/server"
import { v } from "convex/values"

export const monsters = defineTable({
  name: v.string(),
  encounter: v.union(v.null(), v.id("encounters")),
  template: v.union(v.null(), v.id("monsters")),
}).index("by_encounter", ["encounter"])

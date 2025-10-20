import { defineTable } from "convex/server"
import { v } from "convex/values"

export const encounters = defineTable({
  name: v.string(),
  dungeonMaster: v.id("users"),
  playerCharacters: v.union(v.null(), v.array(v.id("characters"))),
  monsters: v.union(v.null(), v.array(v.id("monsters"))),
  npcs: v.union(v.null(), v.array(v.id("characters"))),
  events: v.union(v.null(), v.array(v.id("events"))),
}).index("by_dungeonMaster", ["dungeonMaster"])

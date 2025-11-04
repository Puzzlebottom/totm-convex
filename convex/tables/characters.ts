import { defineTable } from "convex/server"
import { characterFields } from "../validators"

export const characters = defineTable(characterFields)
  .index("by_userId", ["userId"])
  .index("by_encounter", ["encounter"])

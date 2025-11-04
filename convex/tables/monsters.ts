import { defineTable } from "convex/server"
import { monsterFields } from "../validators"

export const monsters = defineTable(monsterFields).index("by_encounter", [
  "encounter",
])

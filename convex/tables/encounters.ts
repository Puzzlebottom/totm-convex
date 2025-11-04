import { defineTable } from "convex/server"
import { encounterFields } from "../validators"

export const encounters = defineTable(encounterFields).index(
  "by_dungeonMaster",
  ["dungeonMaster"]
)

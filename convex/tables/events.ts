import { defineTable } from "convex/server"
import { v } from "convex/values"

export enum EventType {
  ENTITY_ADDED = "entity_added",
  ENTITY_REMOVED = "entity_removed",
  ENTITY_UPDATED = "entity_updated",
  ENTITY_ACTION = "entity_action",
  ROLL_REQUESTED = "roll_requested",
  ROLL_COMPLETED = "roll_completed",
  ROLL_CANCELLED = "roll_cancelled",
  ROUND_START = "round_start",
  ROUND_END = "round_end",
  TURN_START = "turn_start",
  TURN_END = "turn_end",
  ENCOUNTER_COMPLETED = "encounter_completed",
}

export const events = defineTable({
  encounter: v.id("encounters"),
  eventType: v.array(
    v.union(
      v.literal(EventType.ENTITY_ADDED),
      v.literal(EventType.ENTITY_REMOVED),
      v.literal(EventType.ENTITY_UPDATED),
      v.literal(EventType.ENTITY_ACTION),
      v.literal(EventType.ROLL_REQUESTED),
      v.literal(EventType.ROLL_COMPLETED),
      v.literal(EventType.ROLL_CANCELLED),
      v.literal(EventType.ROUND_START),
      v.literal(EventType.ROUND_END),
      v.literal(EventType.TURN_START),
      v.literal(EventType.TURN_END),
      v.literal(EventType.ENCOUNTER_COMPLETED)
    )
  ),
  deletedAt: v.union(v.null(), v.number()),
}).index("by_encounter", ["encounter"])

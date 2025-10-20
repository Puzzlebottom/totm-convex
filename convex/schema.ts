import { authTables } from "@convex-dev/auth/server"
import { defineSchema } from "convex/server"
import { characters, encounters, events, monsters } from "./tables"

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  characters,
  encounters,
  monsters,
  events,
})

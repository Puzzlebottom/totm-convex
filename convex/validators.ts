import { v } from "convex/values"

/**
 * Field validators for each table.
 * These can be reused in both schema definitions and return validators.
 */

export const characterFields = {
  name: v.string(),
  userId: v.id("users"),
  encounter: v.union(v.null(), v.id("encounters")),
}

export const encounterFields = {
  name: v.string(),
  dungeonMaster: v.id("users"),
}

export const monsterFields = {
  name: v.string(),
  encounter: v.union(v.null(), v.id("encounters")),
  template: v.union(v.null(), v.id("monsters")),
}

/**
 * Document validators with system fields included.
 * These can be reused in return validators across functions.
 */
export const characterValidator = v.object({
  _id: v.id("characters"),
  _creationTime: v.number(),
  ...characterFields,
})

export const encounterValidator = v.object({
  _id: v.id("encounters"),
  _creationTime: v.number(),
  ...encounterFields,
})

export const monsterValidator = v.object({
  _id: v.id("monsters"),
  _creationTime: v.number(),
  ...monsterFields,
})

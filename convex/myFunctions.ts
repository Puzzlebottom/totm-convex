import { getAuthUserId } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { Id } from "./_generated/dataModel"
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server"
import {
  characterValidator,
  encounterValidator,
  monsterValidator,
} from "./validators"

export const listEncounters = query({
  args: {},
  returns: v.array(encounterValidator),
  handler: async ctx => {
    const encounters = await ctx.db.query("encounters").collect()
    return encounters
  },
})

export const listEncountersByUser = query({
  args: {},
  returns: v.array(encounterValidator),
  handler: async ctx => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("User not authenticated")
    }
    const encounters = await ctx.db
      .query("encounters")
      .withIndex("by_dungeonMaster", q => q.eq("dungeonMaster", userId))
      .collect()
    return encounters
  },
})

// You can write data to the database via a mutation:
export const addEncounter = mutation({
  args: {
    name: v.string(),
  },
  returns: v.id("encounters"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("User not authenticated")
    }
    const id = await ctx.db.insert("encounters", {
      name: args.name,
      dungeonMaster: userId,
    })

    console.log("Added new encounter with id:", id)
    return id
  },
})

export const deleteEncounter = mutation({
  args: {
    id: v.id("encounters"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("User not authenticated")
    }

    const encounter = await ctx.db.get(args.id)
    if (!encounter) {
      throw new Error("Encounter not found")
    }

    if (encounter.dungeonMaster !== userId) {
      throw new Error("You are not authorized to delete this encounter")
    }

    const monsters = await ctx.db
      .query("monsters")
      .withIndex("by_encounter", q => q.eq("encounter", args.id))
      .collect()
    const events = await ctx.db
      .query("events")
      .withIndex("by_encounter", q => q.eq("encounter", args.id))
      .collect()
    const playerCharacters = await ctx.db
      .query("characters")
      .withIndex("by_encounter", q => q.eq("encounter", args.id))
      .collect()

    //Delete the monsters
    for (const monster of monsters) {
      await ctx.db.delete(monster._id)
    }
    console.log(`Deleted ${monsters.length} monster records`)

    //Delete the events
    for (const event of events) {
      await ctx.db.delete(event._id)
    }
    console.log(`Deleted ${events.length} event records`)

    //reset active encounter for the player characters
    for (const playerCharacter of playerCharacters) {
      await ctx.db.patch(playerCharacter._id, { encounter: null })
      console.log(`Reset active encounter for ${playerCharacter.name}`)
    }

    //Delete the encounter
    await ctx.db.delete(args.id)
    console.log("Deleted encounter with id:", args.id)

    return true
  },
})

export const listMonsterTemplates = query({
  args: {},
  returns: v.array(monsterValidator),
  handler: async ctx => {
    const monsters = await ctx.db
      .query("monsters")
      .withIndex("by_encounter", q => q.eq("encounter", null))
      .collect()
    return monsters
  },
})

export const listMonstersByEncounter = query({
  args: {
    encounterId: v.id("encounters"),
  },
  returns: v.array(monsterValidator),
  handler: async (ctx, args) => {
    const encounter = await ctx.db.get(args.encounterId)
    if (!encounter) {
      // Encounter was deleted, return empty array
      return []
    }

    await checkEncounterAuthorization(ctx, args.encounterId)

    const monsters = await ctx.db
      .query("monsters")
      .withIndex("by_encounter", q => q.eq("encounter", args.encounterId))
      .collect()
    return monsters
  },
})

export const createMonsterTemplate = mutation({
  args: {
    name: v.string(),
  },
  returns: v.id("monsters"),
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("monsters", {
      name: args.name,
      encounter: null,
      template: null,
    })

    console.log(`Created monster template with id: ${id}`)
    return id
  },
})

export const addMonsterToEncounter = mutation({
  args: {
    encounterId: v.id("encounters"),
    template: v.id("monsters"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const { encounter } = await checkEncounterAuthorization(
      ctx,
      args.encounterId
    )

    const monsterTemplate = await ctx.db.get(args.template)
    if (!monsterTemplate || monsterTemplate.encounter !== null) {
      throw new Error("Monster template not found")
    }

    const duplicateMonsters = await ctx.db
      .query("monsters")
      .withIndex("by_encounter", q => q.eq("encounter", args.encounterId))
      .filter(q => q.eq(q.field("template"), monsterTemplate._id))
      .collect()
    const newMonsterDisciminator = ` ${String.fromCharCode(duplicateMonsters.length + 65)}`
    const newMonsterName = monsterTemplate.name + newMonsterDisciminator

    await ctx.db.insert("monsters", {
      name: newMonsterName,
      encounter: args.encounterId,
      template: monsterTemplate._id,
    })

    console.log(`Added ${newMonsterName} to ${encounter.name}`)
    return true
  },
})

export const deleteMonster = mutation({
  args: {
    id: v.id("monsters"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)

    console.log(`Deleted monster with id: ${args.id}`)
    return true
  },
})

export const listCharacters = query({
  args: {},
  returns: v.array(characterValidator),
  handler: async ctx => {
    const characters = await ctx.db.query("characters").collect()
    return characters
  },
})

export const listAvailableCharacters = query({
  args: {},
  returns: v.array(characterValidator),
  handler: async ctx => {
    const characters = await ctx.db
      .query("characters")
      .withIndex("by_encounter", q => q.eq("encounter", null))
      .collect()
    return characters
  },
})

export const listCharactersByUser = query({
  args: {},
  returns: v.array(characterValidator),
  handler: async ctx => {
    const userId = await getAuthUserId(ctx)

    if (!userId) {
      throw new Error("User not authenticated")
    }

    const characters = await ctx.db
      .query("characters")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect()
    return characters
  },
})

export const listCharactersByEncounter = query({
  args: {
    encounterId: v.id("encounters"),
  },
  returns: v.array(characterValidator),
  handler: async (ctx, args) => {
    const encounter = await ctx.db.get(args.encounterId)
    if (!encounter) {
      // Encounter was deleted, return empty array
      return []
    }

    const characters = await ctx.db
      .query("characters")
      .withIndex("by_encounter", q => q.eq("encounter", args.encounterId))
      .collect()
    return characters
  },
})

export const createCharacter = mutation({
  args: {
    name: v.string(),
  },
  returns: v.id("characters"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)

    if (!userId) {
      throw new Error("User not authenticated")
    }

    const characterId = await ctx.db.insert("characters", {
      userId,
      name: args.name,
      encounter: null,
    })

    console.log(`Created character with id: ${characterId}`)
    return characterId
  },
})

export const addCharacterToEncounter = mutation({
  args: {
    encounterId: v.id("encounters"),
    characterId: v.id("characters"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const encounter = await ctx.db.get(args.encounterId)

    if (!encounter) {
      throw new Error("Encounter not found")
    }

    const character = await ctx.db.get(args.characterId)

    if (!character) {
      throw new Error("Character not found")
    }

    await ctx.db.patch(args.characterId, { encounter: args.encounterId })

    console.log(`Added ${character.name} to ${encounter.name}`)
    return true
  },
})

export const removeCharacterFromEncounter = mutation({
  args: {
    encounterId: v.id("encounters"),
    characterId: v.id("characters"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const encounter = await ctx.db.get(args.encounterId)
    if (!encounter) {
      throw new Error("Encounter not found")
    }

    const character = await ctx.db.get(args.characterId)
    if (!character) {
      throw new Error("Character not found")
    }

    await ctx.db.patch(args.characterId, { encounter: null })

    console.log(`Removed ${character.name} from ${encounter.name}`)

    return true
  },
})

export const deleteCharacter = mutation({
  args: {
    id: v.id("characters"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const { character } = await checkCharacterAuthorization(ctx, args.id)

    await ctx.db.delete(args.id)

    console.log(`Deleted ${character.name}`)
    return true
  },
})

const checkEncounterAuthorization = async (
  ctx: MutationCtx | QueryCtx,
  encounterId: Id<"encounters">
) => {
  const userId = await getAuthUserId(ctx)
  if (!userId) {
    throw new Error("User not authenticated")
  }

  const encounter = await ctx.db.get(encounterId)
  if (!encounter) {
    throw new Error("Encounter not found")
  }

  if (encounter.dungeonMaster !== userId) {
    throw new Error("You are not authorized to access this encounter")
  }

  return { authorizedUserId: userId, encounter }
}

const checkCharacterAuthorization = async (
  ctx: MutationCtx | QueryCtx,
  characterId: Id<"characters">
) => {
  const userId = await getAuthUserId(ctx)
  if (!userId) {
    throw new Error("User not authenticated")
  }

  const character = await ctx.db.get(characterId)
  if (!character) {
    throw new Error("Character not found")
  }

  if (character.userId !== userId) {
    throw new Error("You are not authorized to access this character")
  }

  return { authorizedUserId: userId, character }
}

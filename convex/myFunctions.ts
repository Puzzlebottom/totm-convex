import { getAuthUserId } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { Id } from "./_generated/dataModel"
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server"

export const listEncounters = query({
  handler: async ctx => {
    const encounters = await ctx.db.query("encounters").collect()
    return encounters
  },
})

export const listEncountersByUser = query({
  args: {},
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
  // Validators for arguments.
  args: {
    name: v.string(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("User not authenticated")
    }
    const id = await ctx.db.insert("encounters", {
      name: args.name,
      dungeonMaster: userId,
      playerCharacters: null,
      monsters: null,
      npcs: null,
      events: null,
    })

    console.log("Added new encounter with id:", id)
    return id
  },
})

export const deleteEncounter = mutation({
  args: {
    id: v.id("encounters"),
  },
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
  handler: async (ctx, args) => {
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

    const newMonsterId = await ctx.db.insert("monsters", {
      name: newMonsterName,
      encounter: args.encounterId,
      template: monsterTemplate._id,
    })
    await ctx.db.patch(args.encounterId, {
      monsters: [...(encounter.monsters || []), newMonsterId],
    })

    console.log(`Added ${newMonsterName} to ${encounter.name}`)
    return true
  },
})

export const deleteMonster = mutation({
  args: {
    id: v.id("monsters"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)

    console.log(`Deleted monster with id: ${args.id}`)
    return true
  },
})

export const listCharacters = query({
  args: {},

  handler: async ctx => {
    const characters = await ctx.db.query("characters").collect()
    return characters
  },
})

export const listAvailableCharacters = query({
  handler: async ctx => {
    const characters = await ctx.db
      .query("characters")
      .filter(q => q.eq(q.field("encounter"), null))
      .collect()
    return characters
  },
})

export const listCharactersByUser = query({
  args: {},
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
  handler: async (ctx, args) => {
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
    await ctx.db.patch(args.encounterId, {
      playerCharacters: [
        ...(encounter.playerCharacters || []),
        args.characterId,
      ],
    })

    console.log(`Added ${character.name} to ${encounter.name}`)
    return true
  },
})

export const removeCharacterFromEncounter = mutation({
  args: {
    encounterId: v.id("encounters"),
    characterId: v.id("characters"),
  },
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
    await ctx.db.patch(args.encounterId, {
      playerCharacters: encounter.playerCharacters?.filter(
        c => c !== args.characterId
      ),
    })

    console.log(`Removed ${character.name} from ${encounter.name}`)

    return true
  },
})

export const deleteCharacter = mutation({
  args: {
    id: v.id("characters"),
  },
  handler: async (ctx, args) => {
    const { character } = await checkCharacterAuthorization(ctx, args.id)
    const activeEncounter = character.encounter
      ? await ctx.db.get(character.encounter)
      : null

    if (activeEncounter) {
      await ctx.db.patch(activeEncounter._id, {
        playerCharacters: activeEncounter.playerCharacters?.filter(
          c => c !== args.id
        ),
      })
      console.log(
        `Removed character ${character.name} from ${activeEncounter.name}`
      )
    }

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

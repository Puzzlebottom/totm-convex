/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as myFunctions from "../myFunctions.js";
import type * as tables_characters from "../tables/characters.js";
import type * as tables_encounters from "../tables/encounters.js";
import type * as tables_events from "../tables/events.js";
import type * as tables_index from "../tables/index.js";
import type * as tables_monsters from "../tables/monsters.js";
import type * as types from "../types.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  http: typeof http;
  myFunctions: typeof myFunctions;
  "tables/characters": typeof tables_characters;
  "tables/encounters": typeof tables_encounters;
  "tables/events": typeof tables_events;
  "tables/index": typeof tables_index;
  "tables/monsters": typeof tables_monsters;
  types: typeof types;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};

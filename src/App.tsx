"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useMutation,
  useQuery,
} from "convex/react"
import { useState } from "react"
import { api } from "../convex/_generated/api"
import { Id } from "../convex/_generated/dataModel"
import { Character, Encounter, Monster } from "../convex/types"

export default function App() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800">
        TOTM
        <SignOutButton />
      </header>
      <main className="p-8 flex flex-col gap-d16">
        <h1 className="text-4xl font-bold text-center">TOTM Combat Tracker</h1>
        <Authenticated>
          <Content />
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </main>
    </>
  )
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth()
  const { signOut } = useAuthActions()
  return (
    <>
      {isAuthenticated && (
        <button
          className="bg-slate-200 dark:bg-slate-800 text-dark dark:text-light rounded-md px-2 py-1"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      )}
    </>
  )
}

function SignInForm() {
  const { signIn } = useAuthActions()
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn")
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-8 w-96 mx-auto">
      <p>Log in to see the numbers</p>
      <form
        className="flex flex-col gap-2"
        onSubmit={e => {
          e.preventDefault()
          const formData = new FormData(e.target as HTMLFormElement)
          formData.set("flow", flow)
          void signIn("password", formData).catch(error => {
            setError(error.message)
          })
        }}
      >
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="email"
          name="email"
          placeholder="Email"
        />
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="password"
          name="password"
          placeholder="Password"
        />
        <button
          className="bg-dark dark:bg-light text-light dark:text-dark rounded-md"
          type="submit"
        >
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        <div className="flex flex-row gap-2">
          <span>
            {flow === "signIn"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>
          <span
            className="text-dark dark:text-light underline hover:no-underline cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </span>
        </div>
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-2">
            <p className="text-dark dark:text-light font-mono text-xs">
              Error signing in: {error}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

function Content() {
  const myEncounters = useQuery(api.myFunctions.listEncountersByUser, {}) ?? []
  const characters = useQuery(api.myFunctions.listAvailableCharacters) ?? []
  const monsterTemplates =
    useQuery(api.myFunctions.listMonsterTemplates, {}) ?? []

  const addEncounter = useMutation(api.myFunctions.addEncounter)
  const createCharacter = useMutation(api.myFunctions.createCharacter)
  const createMonsterTemplate = useMutation(
    api.myFunctions.createMonsterTemplate
  )

  const [name, setName] = useState<string>("")
  const [selectedEncounterId, setSelectedEncounterId] =
    useState<Id<"encounters"> | null>(null)

  const handleAddEncounter = () => {
    if (!name) {
      return
    }
    void addEncounter({ name: name.trim() })
    setName("")
  }

  const handleAddCharacter = () => {
    if (!name) {
      return
    }
    void createCharacter({ name: name.trim() })
    setName("")
  }

  const handleAddMonsterTemplate = () => {
    if (!name) {
      return
    }
    void createMonsterTemplate({ name: name.trim() })
    setName("")
  }

  const handleSelectEncounter = (encounterId: Id<"encounters">) => {
    if (selectedEncounterId === encounterId) {
      setSelectedEncounterId(null)
      return
    }
    setSelectedEncounterId(encounterId)
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg mx-auto">
      <div className="flex flex-col gap-4">
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800 w-full"
          type="text"
          autoFocus
          autoComplete="off"
          name="name"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div className="flex flex-row gap-2">
          <button
            className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2"
            disabled={!name}
            onClick={handleAddCharacter}
          >
            Add Player Character
          </button>
          <button
            className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2"
            disabled={!name}
            onClick={handleAddEncounter}
          >
            Add Encounter
          </button>
          <button
            className="bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2"
            disabled={!name}
            onClick={handleAddMonsterTemplate}
          >
            Add Monster Template
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="flex flex-col gap-4">My Encounters:</p>
        <div className="flex flex-col gap-2">
          {myEncounters?.map(e => (
            <EncounterCard
              key={e._id}
              encounter={e}
              isSelected={selectedEncounterId === e._id}
              onSelect={handleSelectEncounter}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p>Available Characters:</p>
        <div className="flex flex-col gap-2">
          {characters?.map(c => (
            <CharacterCard
              key={c._id}
              character={c}
              selectedEncounterId={selectedEncounterId}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p>Monster Templates:</p>
        <div className="flex flex-col gap-2">
          {monsterTemplates?.map(m => (
            <MonsterTemplateCard
              key={m._id}
              monsterTemplate={m}
              selectedEncounterId={selectedEncounterId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function EncounterCard({
  encounter,
  isSelected,
  onSelect,
}: {
  encounter: Encounter
  isSelected: boolean
  onSelect: (encounterId: Id<"encounters">) => void
}) {
  const deleteEncounter = useMutation(api.myFunctions.deleteEncounter)
  const removeCharacterFromEncounter = useMutation(
    api.myFunctions.removeCharacterFromEncounter
  )
  const removeMonsterFromEncounter = useMutation(api.myFunctions.deleteMonster)
  const playerCharacters =
    useQuery(api.myFunctions.listCharactersByEncounter, {
      encounterId: encounter._id,
    }) ?? []
  const monsters =
    useQuery(api.myFunctions.listMonstersByEncounter, {
      encounterId: encounter._id,
    }) ?? []

  return (
    <div
      className={`flex flex-col bg-light dark:bg-dark text-dark dark:text-light rounded-md p-4 gap-4 border-2 border-slate-200 ${isSelected ? "dark:border-slate-200" : "dark:border-slate-800"}`}
      onClick={() => onSelect(encounter._id)}
    >
      <div className="flex flex-row justify-between items-center">
        <p className="text-2xl font-bold">{encounter.name}</p>
        <button
          className="bg-red-400 text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2"
          onClick={() => void deleteEncounter({ id: encounter._id })}
        >
          Delete
        </button>
      </div>
      <>
        {playerCharacters.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold">Player Characters:</p>
            <div className="flex flex-col gap-2">
              {playerCharacters?.map(c => (
                <div
                  key={c._id}
                  className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-4 border-2 border-slate-200 dark:border-slate-800"
                >
                  <div className="flex flex-row justify-between items-center">
                    <p>{c.name}</p>
                    <button
                      className="bg-slate-400 text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2"
                      onClick={e => {
                        e.stopPropagation()
                        void removeCharacterFromEncounter({
                          encounterId: encounter._id,
                          characterId: c._id,
                        })
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {monsters.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold">Monsters:</p>
            <div className="flex flex-col gap-2">
              {monsters?.map(m => (
                <div
                  key={m._id}
                  className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-4 border-2 border-slate-200 dark:border-slate-800"
                >
                  <div className="flex flex-row justify-between items-center">
                    <p>{m.name}</p>
                    <button
                      className="bg-slate-400 text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2"
                      onClick={e => {
                        e.stopPropagation()
                        void removeMonsterFromEncounter({ id: m._id })
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    </div>
  )
}

function CharacterCard({
  character,
  selectedEncounterId,
}: {
  character: Character
  selectedEncounterId?: Id<"encounters"> | null
}) {
  const deleteCharacter = useMutation(api.myFunctions.deleteCharacter)
  const addCharacterToEncounter = useMutation(
    api.myFunctions.addCharacterToEncounter
  )

  return (
    <div className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-4 border-2 border-slate-200 dark:border-slate-800">
      <div className="flex flex-row justify-between items-center">
        <p>{character.name}</p>
        {selectedEncounterId && (
          <button
            className="bg-green-400 text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2"
            onClick={() =>
              void addCharacterToEncounter({
                characterId: character._id,
                encounterId: selectedEncounterId,
              })
            }
          >
            Add
          </button>
        )}
        <button
          className="bg-red-400 text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2"
          onClick={() => void deleteCharacter({ id: character._id })}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function MonsterTemplateCard({
  monsterTemplate,
  selectedEncounterId,
}: {
  monsterTemplate: Monster
  selectedEncounterId?: Id<"encounters"> | null
}) {
  const deleteMonsterTemplate = useMutation(api.myFunctions.deleteMonster)
  const addMonsterToEncounter = useMutation(
    api.myFunctions.addMonsterToEncounter
  )

  return (
    <div className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-4 border-2 border-slate-200 dark:border-slate-800">
      <div className="flex flex-row justify-between items-center">
        <p>{monsterTemplate.name}</p>
        {selectedEncounterId && (
          <button
            className="bg-green-400 text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2"
            onClick={() =>
              void addMonsterToEncounter({
                template: monsterTemplate._id,
                encounterId: selectedEncounterId,
              })
            }
          >
            Add
          </button>
        )}
        <button
          className="bg-red-400 text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2"
          onClick={() =>
            void deleteMonsterTemplate({ id: monsterTemplate._id })
          }
        >
          Delete
        </button>
      </div>
    </div>
  )
}

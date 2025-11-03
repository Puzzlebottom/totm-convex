"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import {
  Box,
  Button,
  Card,
  GradientText,
  Heading,
  Input,
  Text,
  UIProvider,
} from "@puzzlebottom/totm-ui-components"

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
      <UIProvider defaultTheme="dark">
        <Box p="$4" borderBottomWidth={2}>
          <Text>TOTM</Text>
          <SignOutButton />
        </Box>
        <Box p="$8" flexDirection="column" gap="$4" items="center">
          <GradientText>TOTM Combat Tracker</GradientText>
          <Authenticated>
            <Content />
          </Authenticated>
          <Unauthenticated>
            <SignInForm />
          </Unauthenticated>
        </Box>
      </UIProvider>
    </>
  )
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth()
  const { signOut } = useAuthActions()
  return (
    <>
      {isAuthenticated && (
        <Button variant="outline" size="$3" onPress={() => void signOut()}>
          <Button.Text>Sign out</Button.Text>
        </Button>
      )}
    </>
  )
}

function SignInForm() {
  const { signIn } = useAuthActions()
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn")
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = () => {
    const formData = new FormData()
    formData.set("email", email)
    formData.set("password", password)
    formData.set("flow", flow)
    void signIn("password", formData).catch(error => {
      setError(error.message)
    })
  }

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <Box flexDirection="column" gap="$8" width={384} mx="auto">
      <Text>Log in to see the numbers</Text>
      <Box flexDirection="column" gap="$2">
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          onKeyPress={handleKeyPress}
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onKeyPress={handleKeyPress}
        />
        <Button variant="primary" size="$4" onPress={handleSubmit}>
          <Button.Text>{flow === "signIn" ? "Sign in" : "Sign up"}</Button.Text>
        </Button>
        <Box flexDirection="row" gap="$2">
          <Text>
            {flow === "signIn"
              ? "Don't have an account?"
              : "Already have an account?"}
          </Text>
          <Text
            textDecorationLine="underline"
            cursor="pointer"
            onPress={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </Text>
        </Box>
        {error && (
          <Box
            bg="$red5"
            borderWidth={2}
            borderColor="$red7"
            rounded="$4"
            p="$2"
          >
            <Text fontSize="$2">Error signing in: {error}</Text>
          </Box>
        )}
      </Box>
    </Box>
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
    <Box flexDirection="column" gap="$8" maxW={512} mx="auto">
      <Box flexDirection="column" gap="$4">
        <Input
          autoFocus
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <Box flexDirection="row" gap="$2">
          <Button variant="primary" size="$6" onPress={handleAddCharacter}>
            <Button.Text>Add Player Character</Button.Text>
          </Button>
          <Button variant="secondary" size="$6" onPress={handleAddEncounter}>
            <Button.Text>Add Encounter</Button.Text>
          </Button>
          <Button
            variant="outline"
            size="$6"
            onPress={handleAddMonsterTemplate}
          >
            <Button.Text>Add Monster Template</Button.Text>
          </Button>
        </Box>
      </Box>

      <Box flexDirection="column" gap="$4">
        <Heading>My Encounters:</Heading>
        <Box flexDirection="column" gap="$2">
          {myEncounters?.map(e => (
            <EncounterCard
              key={e._id}
              encounter={e}
              isSelected={selectedEncounterId === e._id}
              onSelect={handleSelectEncounter}
            />
          ))}
        </Box>
      </Box>

      <Box flexDirection="column" gap="$4">
        <Heading>Available Characters:</Heading>
        <Box flexDirection="column" gap="$2">
          {characters?.map(c => (
            <CharacterCard
              key={c._id}
              character={c}
              selectedEncounterId={selectedEncounterId}
            />
          ))}
        </Box>
      </Box>

      <Box flexDirection="column" gap="$4">
        <Heading>Monster Templates:</Heading>
        <Box flexDirection="column" gap="$2">
          {monsterTemplates?.map(m => (
            <MonsterTemplateCard
              key={m._id}
              monsterTemplate={m}
              selectedEncounterId={selectedEncounterId}
            />
          ))}
        </Box>
      </Box>
    </Box>
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
    <Card
      p="$4"
      gap="$4"
      borderWidth={2}
      borderColor={isSelected ? "$blue9" : "$gray6"}
      onPress={() => onSelect(encounter._id)}
    >
      <Box flexDirection="row" justify="space-between" items="center">
        <Heading fontSize="$8" fontWeight="bold">
          {encounter.name}
        </Heading>
        <Button
          variant="outline"
          size="$4"
          onPress={() => void deleteEncounter({ id: encounter._id })}
        >
          <Button.Text>Delete</Button.Text>
        </Button>
      </Box>
      <>
        {playerCharacters.length > 0 && (
          <Box flexDirection="column" gap="$2">
            <Heading fontSize="$6" fontWeight="bold">
              Player Characters:
            </Heading>
            <Box flexDirection="column" gap="$2">
              {playerCharacters?.map(c => (
                <Card key={c._id} p="$4" borderWidth={2}>
                  <Box
                    flexDirection="row"
                    justify="space-between"
                    items="center"
                  >
                    <Text>{c.name}</Text>
                    <Button
                      variant="outline"
                      size="$4"
                      onPress={(e: any) => {
                        e.stopPropagation()
                        void removeCharacterFromEncounter({
                          encounterId: encounter._id,
                          characterId: c._id,
                        })
                      }}
                    >
                      <Button.Text>Remove</Button.Text>
                    </Button>
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>
        )}
        {monsters.length > 0 && (
          <Box flexDirection="column" gap="$2">
            <Heading fontSize="$6" fontWeight="bold">
              Monsters:
            </Heading>
            <Box flexDirection="column" gap="$2">
              {monsters?.map(m => (
                <Card key={m._id} p="$4" borderWidth={2}>
                  <Box
                    flexDirection="row"
                    justify="space-between"
                    items="center"
                  >
                    <Text>{m.name}</Text>
                    <Button
                      variant="outline"
                      size="$4"
                      onPress={(e: any) => {
                        e.stopPropagation()
                        void removeMonsterFromEncounter({ id: m._id })
                      }}
                    >
                      <Button.Text>Remove</Button.Text>
                    </Button>
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </>
    </Card>
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
    <Card p="$4" borderWidth={2}>
      <Box flexDirection="row" justify="space-between" items="center">
        <Text>{character.name}</Text>
        {selectedEncounterId && (
          <Button
            variant="secondary"
            size="$4"
            onPress={() =>
              void addCharacterToEncounter({
                characterId: character._id,
                encounterId: selectedEncounterId,
              })
            }
          >
            <Button.Text>Add</Button.Text>
          </Button>
        )}
        <Button
          variant="outline"
          size="$4"
          onPress={() => void deleteCharacter({ id: character._id })}
        >
          <Button.Text>Delete</Button.Text>
        </Button>
      </Box>
    </Card>
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
    <Card p="$4" borderWidth={2}>
      <Box flexDirection="row" justify="space-between" items="center">
        <Text>{monsterTemplate.name}</Text>
        {selectedEncounterId && (
          <Button
            variant="secondary"
            size="$4"
            onPress={() =>
              void addMonsterToEncounter({
                template: monsterTemplate._id,
                encounterId: selectedEncounterId,
              })
            }
          >
            <Button.Text>Add</Button.Text>
          </Button>
        )}
        <Button
          variant="outline"
          size="$4"
          onPress={() =>
            void deleteMonsterTemplate({ id: monsterTemplate._id })
          }
        >
          <Button.Text>Delete</Button.Text>
        </Button>
      </Box>
    </Card>
  )
}

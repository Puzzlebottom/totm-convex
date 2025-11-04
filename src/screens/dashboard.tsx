import { Box, Button, Heading, Input } from "@puzzlebottom/totm-ui-components"
import { useMutation, useQuery } from "convex/react"
import { useState } from "react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"
import { CharacterCard } from "../components/character-card"
import { EncounterCard } from "../components/encounter-card"
import { MonsterTemplateCard } from "../components/monster-template-card"

export const Dashboard = () => {
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
    <Box flexDirection="column" gap="$6" width={512} mx="auto">
      <Box flexDirection="column" gap="$4">
        <Input
          autoFocus
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <Box flexDirection="row" gap="$2">
          <Button variant="primary" onPress={handleAddCharacter}>
            <Button.Text>Add Player Character</Button.Text>
          </Button>
          <Button variant="secondary" onPress={handleAddEncounter}>
            <Button.Text>Add Encounter</Button.Text>
          </Button>
          <Button variant="outline" onPress={handleAddMonsterTemplate}>
            <Button.Text>Add Monster Template</Button.Text>
          </Button>
        </Box>
      </Box>

      <Box flexDirection="column" gap="$4">
        <Heading level={"h2"}>My Encounters:</Heading>
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
        <Heading level={"h2"}>Available Characters:</Heading>
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
        <Heading level={"h2"}>Monster Templates:</Heading>
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

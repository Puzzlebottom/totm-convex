import {
  Box,
  Button,
  Card,
  GradientBorderView,
  Heading,
  Text,
} from "@puzzlebottom/totm-ui-components"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"
import { Encounter } from "../../convex/types"

export const EncounterCard = ({
  encounter,
  isSelected,
  onSelect,
}: {
  encounter: Encounter
  isSelected: boolean
  onSelect: (encounterId: Id<"encounters">) => void
}) => {
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

  const handleDeleteEncounter = () => {
    if (isSelected) {
      // If the encounter is selected, deselect it
      onSelect(encounter._id)
    }
    void deleteEncounter({ id: encounter._id })
  }

  const renderContent = () => (
    <Card
      p="$4"
      gap="$4"
      borderWidth={isSelected ? "$1" : 0}
      borderColor={isSelected ? "$gray6" : "transparent"}
      onPress={() => onSelect(encounter._id)}
    >
      <Box flexDirection="row" justify="space-between" items="center">
        <Heading fontSize="$8" fontWeight="bold">
          {encounter.name}
        </Heading>
        <Button variant="outline" size="$4" onPress={handleDeleteEncounter}>
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

  return isSelected ? (
    renderContent()
  ) : (
    <GradientBorderView style={{ borderWidth: 2, borderRadius: 10 }}>
      {renderContent()}
    </GradientBorderView>
  )
}

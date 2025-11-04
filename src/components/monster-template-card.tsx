import {
  Box,
  Button,
  Card,
  GradientBorderView,
  Text,
} from "@puzzlebottom/totm-ui-components"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"
import { Monster } from "../../convex/types"

export const MonsterTemplateCard = ({
  monsterTemplate,
  selectedEncounterId,
}: {
  monsterTemplate: Monster
  selectedEncounterId?: Id<"encounters"> | null
}) => {
  const deleteMonsterTemplate = useMutation(api.myFunctions.deleteMonster)
  const addMonsterToEncounter = useMutation(
    api.myFunctions.addMonsterToEncounter
  )

  return (
    <GradientBorderView style={{ borderWidth: 2, borderRadius: 10 }}>
      <Card p="$4" borderWidth={0}>
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
    </GradientBorderView>
  )
}

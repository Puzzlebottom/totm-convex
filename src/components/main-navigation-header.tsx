import { Gradient, Text } from "@puzzlebottom/totm-ui-components"
import { SignOutButton } from "./sign-out-button"

export const MainNavigationHeader = () => (
  <Gradient
    p="$4"
    flexDirection="row"
    justify="space-between"
    items="center"
    borderBottomWidth={2}
  >
    <Text fontSize="$8" fontWeight="bold">
      TOTM
    </Text>
    <SignOutButton />
  </Gradient>
)

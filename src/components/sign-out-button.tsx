import { useAuthActions } from "@convex-dev/auth/react"
import { Button } from "@puzzlebottom/totm-ui-components"
import { useConvexAuth } from "convex/react"

export const SignOutButton = () => {
  const { isAuthenticated } = useConvexAuth()
  const { signOut } = useAuthActions()
  return (
    <>
      {isAuthenticated && (
        <Button variant="secondary" size="$3" onPress={() => void signOut()}>
          <Button.Text>Sign out</Button.Text>
        </Button>
      )}
    </>
  )
}

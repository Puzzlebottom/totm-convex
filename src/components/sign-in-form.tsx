import { useAuthActions } from "@convex-dev/auth/react"
import { Box, Button, Input, Text } from "@puzzlebottom/totm-ui-components"
import { useState } from "react"

export const SignInForm = () => {
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
    <Box flexDirection="column" gap="$4" width={384} mx="auto">
      <Text>Log in to your account</Text>
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

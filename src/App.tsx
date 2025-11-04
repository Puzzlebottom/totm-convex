"use client"

import { Box, GradientText } from "@puzzlebottom/totm-ui-components"

import { Authenticated, Unauthenticated } from "convex/react"
import { SignInForm } from "./components"
import { MainNavigationHeader } from "./components/main-navigation-header"
import { Dashboard } from "./screens"

export default function App() {
  return (
    <>
      <MainNavigationHeader />
      <Box p="$8" flexDirection="column" gap="$4" items="center">
        <GradientText fontSize="$10" fontWeight="bold">
          TOTM Combat Tracker
        </GradientText>
        <Authenticated>
          <Dashboard />
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </Box>
    </>
  )
}

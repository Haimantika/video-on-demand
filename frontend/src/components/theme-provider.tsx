"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // Only render the theme provider after the component has mounted
  // This prevents the theme from changing during hydration
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Render a placeholder during SSR and initial client render
  // This prevents hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { PropsWithChildren } from "react";

export function ThemeProvider({ children, ...props }: PropsWithChildren<any>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
} 
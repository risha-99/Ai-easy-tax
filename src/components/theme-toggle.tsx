"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isAnimating, setIsAnimating] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setTheme(theme === "light" ? "dark" : "light")
    setTimeout(() => setIsAnimating(false), 300) // Match animation duration
  }

  if (!mounted) {
    return (
      <button className="relative rounded-md p-2 h-9 w-9">
        <div className="relative h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="relative rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
      disabled={isAnimating}
    >
      <div className="relative h-5 w-5">
        {theme === "light" ? (
          <Sun className="theme-icon h-5 w-5" />
        ) : (
          <Moon className="theme-icon dark h-5 w-5" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  )
} 
"use client"

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            Tax Calculator
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex gap-6">
              <Link href="/" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">
                Home
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">
                About
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">
                Contact
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
} 
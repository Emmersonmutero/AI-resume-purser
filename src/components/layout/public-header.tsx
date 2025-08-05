"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FileText, Menu } from "lucide-react";
import { useState } from "react";

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="hidden text-lg font-bold font-headline sm:inline-block">AI Resume Parser</span>
          <span className="text-sm font-bold font-headline sm:hidden">ARP</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Register</Link>
          </Button>
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col space-y-4 mt-6">
                <Button asChild variant="ghost" size="sm" className="justify-start" onClick={() => setIsOpen(false)}>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="justify-start" onClick={() => setIsOpen(false)}>
                  <Link href="/register">Register</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

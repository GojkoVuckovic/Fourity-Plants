"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import localFont from "next/font/local";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

const fraunces = localFont({
  src: [
    {
      path: "../../public/fonts/Fraunces-VariableFont_SOFT,WONK,opsz,wght.ttf",
      weight: "variable",
      style: "normal",
    },
  ],
  variable: "--font-fraunces",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    const normalizedCurrentPath =
      pathname === "/" ? "/" : pathname.replace(/\/$/, "");
    const normalizedHref = href === "/" ? "/" : href.replace(/\/$/, "");
    return normalizedCurrentPath === normalizedHref;
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-4 p-4">
                {children || <p>Your page content goes here.</p>}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

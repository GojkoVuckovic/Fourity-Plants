"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import localFont from "next/font/local";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="en" className="{fraunces.variable}">
      <body className={`${fraunces.className} antialiased flex`}>
        <nav className="fixed top-0 left-0 flex flex-col items-start p-6 bg-greenish-grey shadow-lg rounded-tr-xl rounded-br-xl w-64 min-h-screen h-screen">
          <div className="mb-8 mt-4 text-2xl font-bold">Fourity Plants</div>
          <Link
            href="/"
            className={`
              font-medium transition-colors duration-200 px-4 py-3 rounded-lg w-full text-left mb-2
              ${isActive("/") ? "bg-coral text-gray-600" : " hover:bg-coral"}
              focus:outline-none focus:ring-2 focus:ring-coral-dark focus:ring-opacity-50
            `}
          >
            Home
          </Link>
          <Link
            href="/plants"
            className={`
              font-medium transition-colors duration-200 px-4 py-3 rounded-lg w-full text-left mb-2
              ${isActive("/plants") ? "bg-coral text-gray-600" : " hover:bg-coral"}
              focus:outline-none focus:ring-2 focus:ring-coral-dark focus:ring-opacity-50
            `}
          >
            Plants
          </Link>
          <Link
            href="/zones"
            className={`
              font-medium transition-colors duration-200 px-4 py-3 rounded-lg w-full text-left mb-2
              ${isActive("/zones") ? "bg-coral text-gray-600" : " hover:bg-coral"}
              focus:outline-none focus:ring-2 focus:ring-coral-dark focus:ring-opacity-50
            `}
          >
            Zones
          </Link>
          <Link
            href="/plant-records"
            className={`
              font-medium transition-colors duration-200 px-4 py-3 rounded-lg w-full text-left mb-2
              ${isActive("/plant-records") ? "bg-coral text-gray-600" : " hover:bg-coral"}
              focus:outline-none focus:ring-2 focus:ring-coral-dark focus:ring-opacity-50
            `}
          >
            Plant Records
          </Link>
          <Link
            href="/scoreboard"
            className={`
              font-medium transition-colors duration-200 px-4 py-3 rounded-lg w-full text-left mb-2
              ${isActive("/scoreboard") ? "bg-coral text-gray-600" : " hover:bg-coral"}
              focus:outline-none focus:ring-2 focus:ring-coral-dark focus:ring-opacity-50
            `}
          >
            Scoreboard
          </Link>
        </nav>
        <div className="flex-1 p-8 text-center text-gray-600 ml-64">
          {children || <p>Your page content goes here.</p>}
        </div>
      </body>
    </html>
  );
}

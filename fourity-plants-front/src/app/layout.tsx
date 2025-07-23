"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
        <style>
          {`
                    body {
                      font-family: 'Poppins', monospace;
                    }
                  `}
        </style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex`}
      >
        <nav className="flex flex-col items-start p-6 bg-white shadow-lg rounded-tr-xl rounded-br-xl w-64 min-h-screen">
          {/* Title */}
          <div className="mb-8 mt-4 text-2xl font-bold text-gray-800">
            Fourity Plants
          </div>

          {/* Navigation Links */}
          <Link
            href="/"
            className={`
              font-medium transition-colors duration-200 px-4 py-3 rounded-lg w-full text-left mb-2
              ${isActive("/") ? "bg-green-500 text-white" : "text-gray-700 hover:bg-green-100 hover:text-green-800"}
              focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50
            `}
          >
            Home
          </Link>
          <Link
            href="/plants"
            className={`
              font-medium transition-colors duration-200 px-4 py-3 rounded-lg w-full text-left mb-2
              ${isActive("/plants") ? "bg-green-500 text-white" : "text-gray-700 hover:bg-green-100 hover:text-green-800"}
              focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50
            `}
          >
            Plants
          </Link>
          <Link
            href="/zones"
            className={`
              font-medium transition-colors duration-200 px-4 py-3 rounded-lg w-full text-left mb-2
              ${isActive("/zones") ? "bg-green-500 text-white" : "text-gray-700 hover:bg-green-100 hover:text-green-800"}
              focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50
            `}
          >
            Zones
          </Link>
          <Link
            href="/plant-records"
            className={`
              font-medium transition-colors duration-200 px-4 py-3 rounded-lg w-full text-left mb-2
              ${isActive("/plant-records") ? "bg-green-500 text-white" : "text-gray-700 hover:bg-green-100 hover:text-green-800"}
              focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50
            `}
          >
            Plant Records
          </Link>
          <Link
            href="/leaderboard"
            className={`
              font-medium transition-colors duration-200 px-4 py-3 rounded-lg w-full text-left mb-2
              ${isActive("/leaderboard") ? "bg-green-500 text-white" : "text-gray-700 hover:bg-green-100 hover:text-green-800"}
              focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50
            `}
          >
            Leaderboard
          </Link>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 p-8 text-center text-gray-600">
          {children || <p>Your page content goes here.</p>}
        </div>
      </body>
    </html>
  );
}

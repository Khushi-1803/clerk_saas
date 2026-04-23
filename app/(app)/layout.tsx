
"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  LogOutIcon,
  LayoutDashboardIcon,
  Share2Icon,
  UploadIcon,
} from "lucide-react";

const navItems = [
  { href: "/home", icon: LayoutDashboardIcon, label: "Home" },
  { href: "/social-share", icon: Share2Icon, label: "Social Share" },
  { href: "/video-upload", icon: UploadIcon, label: "Upload" },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress;

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <header className="bg-base-200 shadow">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          
          {/* Logo */}
          <div
            className="text-xl font-bold cursor-pointer"
            onClick={() => router.push("/")}
          >
            Cloudinary Showcase
          </div>

          {/* NAV LINKS */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                  pathname === item.href
                    ? "bg-primary text-white"
                    : "hover:bg-base-300"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* USER */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <img
                  src={user.imageUrl}
                  alt={email || "User"}
                  className="w-8 h-8 rounded-full"
                />

                <span className="text-sm hidden md:block">
                  {user.username || email}
                </span>

                <button
                  onClick={() => signOut()}
                  className="btn btn-ghost btn-circle"
                >
                  <LogOutIcon />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
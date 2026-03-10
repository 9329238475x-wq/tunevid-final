"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LogIn,
  LogOut,
  Menu,
  X,
  Loader2,
  LayoutDashboard,
  User,
  ChevronDown,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { name: "Home", href: "/" },
  { name: "Tools", href: "/tools" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileDropdown(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const renderAuthAction = () => {
    if (status === "loading") {
      return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800">
          <Loader2 className="h-4 w-4 animate-spin text-zinc-500 dark:text-zinc-400" />
        </div>
      );
    }

    if (session) {
      return (
        <div className="relative" ref={dropdownRef}>
          {/* Profile Avatar Button */}
          <button
            onClick={() => setProfileDropdown(!profileDropdown)}
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white pl-1.5 pr-3 py-1.5 text-sm text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-700"
          >
            <img
              src={session.user?.image ?? "/icon.png"}
              alt={session.user?.name ?? "User"}
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="hidden sm:inline max-w-[100px] truncate font-medium text-xs">
              {session.user?.name?.split(" ")[0] ?? "User"}
            </span>
            <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform ${profileDropdown ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {profileDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-zinc-200 bg-white shadow-lg shadow-black/10 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/40 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <img
                    src={session.user?.image ?? "/icon.png"}
                    alt={session.user?.name ?? "User"}
                    className="h-10 w-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {session.user?.name ?? "User"}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1.5">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition dark:text-zinc-300 dark:hover:bg-zinc-900/50"
                >
                  <User className="h-4 w-4 text-zinc-400" />
                  My Profile
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition dark:text-zinc-300 dark:hover:bg-zinc-900/50"
                >
                  <LayoutDashboard className="h-4 w-4 text-zinc-400" />
                  Dashboard
                </Link>

              </div>

              {/* Sign Out */}
              <div className="border-t border-zinc-100 dark:border-zinc-800/50 py-1.5">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition dark:text-red-400 dark:hover:bg-red-900/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white sign-in-light"
      >
        <LogIn className="h-4 w-4" />
        Sign In
      </Link>
    );
  };

  const renderMobileAuth = () => {
    if (status === "loading") {
      return (
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking session...
        </div>
      );
    }

    if (session) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={session.user?.image ?? "/icon.png"}
              alt={session.user?.name ?? "User"}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 truncate dark:text-zinc-100">{session.user?.name}</p>
              <p className="text-[11px] text-zinc-500 truncate dark:text-zinc-400">{session.user?.email}</p>
            </div>
          </div>

          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition dark:border-zinc-800 dark:text-zinc-200"
          >
            <User className="h-4 w-4" />
            My Profile
          </Link>

          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition dark:border-zinc-800 dark:text-zinc-200"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 transition hover:border-red-200 hover:text-red-600 dark:border-zinc-800 dark:text-zinc-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      );
    }

    return (
      <Link
        href="/login"
        onClick={() => setMenuOpen(false)}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white sign-in-light"
      >
        <LogIn className="h-4 w-4" />
        Sign In
      </Link>
    );
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <header
        suppressHydrationWarning
        className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 nav-separator"
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200 hover:bg-zinc-100 transition dark:border-zinc-800 dark:hover:bg-zinc-900"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4 text-zinc-600 dark:text-zinc-300" strokeWidth={1.5} />
            </button>

            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="TuneVid logo" className="w-8 h-8 rounded-lg object-contain dark:invert" />
              <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">TuneVid</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <nav className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg transition ${pathname === link.href
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                    : "hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              {session && (
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-lg transition ${pathname === "/dashboard"
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                    : "hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {renderAuthAction()}
          </div>
        </div>
      </header>

      <div
        onClick={() => setMenuOpen(false)}
        className={`md:hidden fixed inset-0 z-40 bg-black/30 transition-opacity duration-200
        ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 max-w-[85vw]
        bg-white border-r border-zinc-200 shadow-md dark:bg-zinc-950 dark:border-zinc-800
        flex flex-col
        transition-transform duration-200 ease-in-out
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
            <img src="/logo.png" alt="TuneVid logo" className="w-8 h-8 rounded-lg object-contain dark:invert" />
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">TuneVid</span>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition dark:border-zinc-800 dark:hover:bg-zinc-900"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 text-zinc-500 dark:text-zinc-400" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 px-4 mb-2">Pages</p>

          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm transition
              ${pathname === link.href
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"
                }`}
            >
              {link.name}
            </Link>
          ))}

          {session && (
            <>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm transition
                ${pathname === "/profile"
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"
                  }`}
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm transition
                ${pathname === "/dashboard"
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"
                  }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </>
          )}
        </nav>

        <div className="px-5 py-5 border-t border-zinc-200 dark:border-zinc-800">{renderMobileAuth()}</div>
      </aside>
    </>
  );
}

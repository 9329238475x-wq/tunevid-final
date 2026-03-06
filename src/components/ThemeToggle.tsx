"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "tunevid-theme";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "dark") {
            document.documentElement.classList.add("dark");
            setIsDark(true);
            return;
        }
        if (stored === "light") {
            document.documentElement.classList.remove("dark");
            setIsDark(false);
            return;
        }
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.classList.toggle("dark", prefersDark);
        setIsDark(prefersDark);
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    };

    if (!mounted) {
        return (
            <div className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-300 dark:border-zinc-800 dark:bg-zinc-950">
                <Moon className="w-4 h-4" strokeWidth={1.5} />
            </div>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun className="w-4 h-4" strokeWidth={1.5} />
            ) : (
                <Moon className="w-4 h-4" strokeWidth={1.5} />
            )}
        </button>
    );
}

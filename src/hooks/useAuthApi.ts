"use client";

import { useSession } from "next-auth/react";
import axios, { AxiosInstance } from "axios";
import { useMemo } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Hook that returns an authenticated axios instance.
 * Automatically attaches the user's access token to all requests.
 */
export function useAuthApi(): { api: AxiosInstance; isAuthenticated: boolean } {
    const { data: session } = useSession();

    const api = useMemo(() => {
        const instance = axios.create({
            baseURL: API_BASE,
            headers: {
                ...(session?.accessToken
                    ? { Authorization: `Bearer ${session.accessToken}` }
                    : {}),
            },
        });

        // Add interceptor to always use latest token
        instance.interceptors.request.use((config) => {
            if (session?.accessToken) {
                config.headers.Authorization = `Bearer ${session.accessToken}`;
            }
            return config;
        });

        return instance;
    }, [session?.accessToken]);

    return {
        api,
        isAuthenticated: !!session?.accessToken,
    };
}

/**
 * Get auth headers for use with fetch or other HTTP clients.
 */
export function getAuthHeaders(accessToken?: string): Record<string, string> {
    if (!accessToken) return {};
    return { Authorization: `Bearer ${accessToken}` };
}


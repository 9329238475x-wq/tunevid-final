"use client";

import { useCallback, useState } from "react";

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: {
        color?: string;
        backdrop_color?: string;
    };
    handler: (response: any) => void;
    modal?: {
        ondismiss?: () => void;
    };
}

export const useRazorpay = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    const loadScript = useCallback(() => {
        return new Promise<boolean>((resolve) => {
            if (typeof window === "undefined") return resolve(false);
            if ((window as any).Razorpay) {
                setIsLoaded(true);
                return resolve(true);
            }

            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => {
                setIsLoaded(true);
                resolve(true);
            };
            script.onerror = () => {
                setIsLoaded(false);
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }, []);

    const openCheckout = useCallback(async (options: RazorpayOptions) => {
        const loaded = await loadScript();
        if (!loaded) {
            console.error("Razorpay SDK failed to load. Are you online?");
            return;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    }, [loadScript]);

    return { openCheckout, isLoaded };
};

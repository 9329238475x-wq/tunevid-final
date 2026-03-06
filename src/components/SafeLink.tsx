"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * SafeLink - Browser extensions se bachne ke liye mounted check ke saath Link component
 * Hydration errors prevent karta hai jo browser extensions attributes inject karte hain
 */
export default function SafeLink({
  href,
  children,
  className,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mount hone tak plain text dikhaao
  if (!mounted) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}

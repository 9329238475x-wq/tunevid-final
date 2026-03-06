"use client";

import { motion } from "framer-motion";
import { pageVariants } from "@/utils/animations";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageTransition - Smooth fade & slide animation wrapper for pages
 * Uses spring physics for organic, bouncy transitions
 */
export default function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

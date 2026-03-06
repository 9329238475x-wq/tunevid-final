"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { buttonVariants } from "@/utils/animations";

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "variants"> {
  children: React.ReactNode;
  className?: string;
}

/**
 * AnimatedButton - Premium bouncy button with spring physics
 * Scales up on hover, scales down on tap for tactile feedback
 */
export default function AnimatedButton({ 
  children, 
  className = "", 
  ...props 
}: AnimatedButtonProps) {
  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

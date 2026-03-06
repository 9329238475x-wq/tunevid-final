// Global Animation Constants & Variants for TuneVid
// Premium, bouncy, elastic animations inspired by iOS and high-end SaaS apps

import { Transition, Variants } from "framer-motion";

// ===========================
// 1. SPRING PHYSICS PRESETS
// ===========================

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
  mass: 1,
};

export const softSpring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
  mass: 1,
};

export const bouncySpring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 15,
  mass: 0.8,
};

export const smoothSpring: Transition = {
  type: "spring",
  stiffness: 250,
  damping: 30,
  mass: 1.2,
};

// ===========================
// 2. PAGE TRANSITION VARIANTS
// ===========================

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

// ===========================
// 3. STAGGER CONTAINER
// ===========================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// ===========================
// 4. TOOL CARD VARIANTS
// ===========================

export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 30,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: bouncySpring,
  },
  hover: {
    scale: 1.05,
    y: -5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 15,
    },
  },
};

// ===========================
// 5. BUTTON VARIANTS
// ===========================

export const buttonVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: springTransition,
  },
  tap: {
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 15,
    },
  },
};

// ===========================
// 6. FADE IN UP (Hero Section)
// ===========================

export const fadeInUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 40,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: softSpring,
  },
};

// ===========================
// 7. PULSE ANIMATION (Loading)
// ===========================

export const pulseVariants: Variants = {
  initial: {
    opacity: 0.6,
    scale: 1,
  },
  animate: {
    opacity: [0.6, 1, 0.6],
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ===========================
// 8. SLIDE UP (Status Text)
// ===========================

export const slideUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothSpring,
  },
};

// ===========================
// 9. NAVBAR VARIANTS
// ===========================

export const navbarVariants: Variants = {
  initial: {
    y: -100,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

// ===========================
// 10. HOVER GLOW EFFECT
// ===========================

export const glowVariants: Variants = {
  initial: {
    boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
  },
  hover: {
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
    transition: smoothSpring,
  },
};

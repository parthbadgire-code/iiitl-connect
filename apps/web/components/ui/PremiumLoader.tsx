"use client";

import { motion } from "framer-motion";

export function PremiumLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="relative flex items-center justify-center">
        {/* Outer rotating glowing ring */}
        <motion.div
          className="absolute h-16 w-16 rounded-full border border-pastel-lavender/30 border-t-pastel-lavender/80"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {/* Inner pulsing dot */}
        <motion.div
          className="h-4 w-4 rounded-full bg-pastel-blue shadow-[0_0_15px_rgba(186,230,253,0.8)]"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}

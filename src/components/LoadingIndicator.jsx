import React from "react";
import { motion } from "framer-motion";

const LoadingIndicator = () => {
  const pulseVariants = {
    animate: {
      scale: [1, 1.5, 1],
      opacity: [0.6, 1, 0.6],
      boxShadow: [
        "0 0 0 0 rgba(88, 28, 135, 0.4)",
        "0 0 0 10px rgba(88, 28, 135, 0)",
        "0 0 0 0 rgba(88, 28, 135, 0.4)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="flex items-center justify-center py-4">
      <motion.div
        className="h-4 w-4 rounded-full bg-purple-900"
        initial="initial"
        animate="animate"
        variants={pulseVariants}
        style={{
          boxShadow: "0 0 0 0 rgba(88, 28, 135, 0.4)",
          backgroundColor: "#4c1d95", // Deep purple color
        }}
      />
    </div>
  );
};

export default LoadingIndicator;

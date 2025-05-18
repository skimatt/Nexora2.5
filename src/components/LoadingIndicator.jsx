import React from "react";
import { motion } from "framer-motion";

const LoadingIndicator = () => {
  const textVariants = {
    animate: {
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const ringVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const dotVariants = {
    animate: {
      scale: [1, 1.4, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20">
      <div className="relative flex flex-col items-center">
        {/* Rotating ring wrapping text */}
        <motion.div
          className="relative h-32 w-32 flex items-center justify-center"
          variants={ringVariants}
          animate="animate"
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent" />
        </motion.div>

        {/* Text centered inside the ring */}
        <motion.div
          className="absolute text-3xl font-bold text-purple-600"
          style={{ top: "50%", transform: "translateY(-50%)" }}
          variants={textVariants}
          animate="animate"
          initial={{ opacity: 0.3 }}
        >
          nexora
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingIndicator;

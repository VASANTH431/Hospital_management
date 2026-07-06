import React from 'react';
import { motion } from 'framer-motion';

const HeartbeatLoader = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative w-32 h-20 flex items-center justify-center">
        {/* ECG pulse background effect */}
        <motion.div
          className="absolute inset-0 bg-rosegold-100 dark:bg-rosegold-950/20 rounded-full filter blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Heartbeat ECG Line SVG */}
        <svg
          className="w-full h-full text-rosegold-500"
          viewBox="0 0 100 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Flat line -> P peak -> Q drop -> R peak -> S drop -> T wave -> Flat */}
          <path
            className="ecg-path"
            d="M 5 20 H 30 L 35 15 L 40 28 L 45 5 L 50 25 L 55 18 L 60 20 H 95"
            strokeDasharray="200"
            strokeDashoffset="200"
          />
        </svg>
      </div>
      
      {/* Animated text */}
      <motion.p
        className="text-rosegold-600 dark:text-rosegold-400 font-medium tracking-wide text-sm"
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {text}
      </motion.p>
    </div>
  );
};

export default HeartbeatLoader;

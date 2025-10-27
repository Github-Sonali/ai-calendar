// app/components/RetroDecorations.tsx
'use client';

import { motion } from 'framer-motion';

export default function RetroDecorations() {
  return (
    <>
      {/* Top left decoration */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-32 h-32 opacity-10"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#FFB6C1" strokeWidth="2" strokeDasharray="5,5" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#B8E6D1" strokeWidth="2" strokeDasharray="5,5" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="#B6E5FF" strokeWidth="2" strokeDasharray="5,5" />
        </svg>
      </motion.div>

      {/* Bottom right decoration */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-0 right-0 w-40 h-40 opacity-10"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,10 90,90 10,90" fill="none" stroke="#E6D7FF" strokeWidth="2" />
          <polygon points="50,30 70,70 30,70" fill="none" stroke="#FFDAB9" strokeWidth="2" />
        </svg>
      </motion.div>
    </>
  );
}
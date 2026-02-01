
import React from 'react';
// Fixing framer-motion type errors by using any cast
import * as FramerMotion from 'framer-motion';
const { motion, AnimatePresence } = FramerMotion as any;
import { AlertTriangle } from 'lucide-react';
import { Status } from '../types';

interface StatusOverlayProps {
  status: Status;
}

const StatusOverlay: React.FC<StatusOverlayProps> = ({ status }) => {
  return (
    <AnimatePresence>
      {status === 'danger' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none"
        >
          {/* Pulsing red border glow */}
          <div className="absolute inset-0 border-[12px] border-rose-600/50 animate-pulse shadow-[inset_0_0_100px_rgba(225,29,72,0.4)]" />
          
          {/* Glass background */}
          <div className="absolute inset-0 bg-rose-950/20 backdrop-blur-[2px]" />

          {/* Alert Content */}
          <div className="absolute bottom-32 md:bottom-12 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pointer-events-auto">
            <motion.div 
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              className="bg-rose-600 p-6 rounded-3xl shadow-[0_0_40px_rgba(225,29,72,0.6)] flex items-center gap-4 border border-rose-400/50"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-white animate-bounce" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-white leading-none mb-1 uppercase">Danger Detected</h3>
                <p className="text-white/80 text-sm font-medium">Critical gas levels. Emergency protocols initiated.</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusOverlay;

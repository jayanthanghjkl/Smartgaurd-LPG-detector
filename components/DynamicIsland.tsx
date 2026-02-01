
import React from 'react';
// Fixing framer-motion type errors by using any cast
import * as FramerMotion from 'framer-motion';
const { motion } = FramerMotion as any;
import { ShieldCheck, AlertCircle, Zap } from 'lucide-react';
import { Status } from '../types';

interface DynamicIslandProps {
  status: Status;
}

const DynamicIsland: React.FC<DynamicIslandProps> = ({ status }) => {
  const config = {
    safe: {
      color: 'bg-emerald-500/10',
      icon: ShieldCheck,
      text: 'System Secured',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20'
    },
    warning: {
      color: 'bg-amber-500/10',
      icon: AlertCircle,
      text: 'High Carbon Levels',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/20'
    },
    danger: {
      color: 'bg-rose-500/10',
      icon: Zap,
      text: 'Evacuate Immediate',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/20'
    },
  }[status];

  return (
    <div className="flex justify-center pt-6 px-4 pointer-events-none">
      <motion.div
        layout
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`flex items-center gap-3 px-5 py-2.5 rounded-full backdrop-blur-3xl border shadow-2xl ${config.color} ${config.borderColor}`}
      >
        <motion.div
          animate={{
            scale: status === 'danger' ? [1, 1.2, 1] : 1,
          }}
          transition={{ repeat: Infinity, duration: 1 }}
          className={config.iconColor}
        >
          <config.icon size={18} />
        </motion.div>
        <span className={`text-sm font-bold tracking-tight uppercase ${config.iconColor}`}>
          {config.text}
        </span>
      </motion.div>
    </div>
  );
};

export default DynamicIsland;


import React from 'react';
// Fixing framer-motion type errors by using any cast
import * as FramerMotion from 'framer-motion';
const { motion } = FramerMotion as any;
import { ConnectionStatus } from '../types';
import { useSafety } from '../context/SafetyContext';

interface LiquidGaugeProps {
  percentage: number; // 0 to 100 representing fill level
  value: number; // The actual PPM value to display
  status: 'safe' | 'warning' | 'danger';
  connectionStatus: ConnectionStatus;
}

const LiquidGauge: React.FC<LiquidGaugeProps> = ({ percentage, value, status, connectionStatus }) => {
  const { settings } = useSafety();
  const isOnline = connectionStatus === ConnectionStatus.CONNECTED;
  const isDark = settings.theme === 'dark';

  const getStatusColor = () => {
    if (!isOnline) return '#71717a'; // zinc-500
    if (status === 'danger') return '#F43F5E'; // Neon Rose
    if (status === 'warning') return '#F59E0B'; // Neon Amber
    return '#10B981'; // Neon Emerald
  };

  const color = getStatusColor();

  /**
   * Wave Height logic:
   * SVG viewBox is 0 0 100 100.
   * y=100 is bottom, y=0 is top.
   * To fill x%, we move the wave group UP (yTranslate = 100 - percentage).
   */
  const displayPercentage = isOnline ? Math.min(100, Math.max(0, percentage)) : 0;
  const yTranslate = 100 - displayPercentage;

  // Theme-aware values
  const sphereBg = isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)';
  const baseTextColor = isDark ? '#FFFFFF' : '#09090b';
  const baseSubTextColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(9,9,11,0.5)';
  const ringBorderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  // Pulse Speed based on status
  const pulseDuration = status === 'danger' ? 0.8 : status === 'warning' ? 1.5 : 3;

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8 select-none">
      <div className="relative w-full aspect-square max-w-[320px]">

        {/* Layer 1: Exterior Ambient Glow (Wide) */}
        <motion.div
          className="absolute inset-[-20px] rounded-full blur-[100px] pointer-events-none"
          animate={{ 
            backgroundColor: color,
            opacity: isOnline ? (status === 'danger' ? [0.15, 0.4, 0.15] : status === 'warning' ? [0.1, 0.25, 0.1] : 0.08) : 0.02,
            scale: isOnline && status === 'danger' ? [1, 1.2, 1] : 1
          }}
          transition={{ repeat: Infinity, duration: pulseDuration, ease: "easeInOut" }}
        />

        {/* Layer 2: Core Glow (Tight) */}
        <motion.div
          className="absolute inset-4 rounded-full blur-[40px] pointer-events-none"
          animate={{ 
            backgroundColor: color,
            opacity: isOnline ? (status === 'danger' ? [0.3, 0.6, 0.3] : status === 'warning' ? [0.2, 0.4, 0.2] : 0.15) : 0.05,
          }}
          transition={{ repeat: Infinity, duration: pulseDuration, ease: "easeInOut" }}
        />

        {/* Sphere Container */}
        <motion.div 
          animate={{ backgroundColor: sphereBg, borderColor: ringBorderColor }}
          className="absolute inset-0 rounded-full border-[6px] backdrop-blur-md overflow-hidden flex items-center justify-center shadow-[inset_0_4px_30px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]"
        >

          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full overflow-visible"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="liquidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="100%" stopColor={color} stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Wave Group */}
            <motion.g
              animate={{ y: yTranslate }}
              transition={{ type: "spring", stiffness: 40, damping: 15 }}
            >
              {/* Back Wave (Ghost) */}
              <motion.path
                animate={isOnline ? { x: [-100, 0] } : {}}
                transition={{
                  duration: status === 'danger' ? 2 : status === 'warning' ? 4 : 7,
                  repeat: Infinity,
                  ease: "linear",
                }}
                fill={color}
                opacity="0.2"
                d="M -100 5 Q -50 15 0 5 Q 50 -5 100 5 Q 150 15 200 5 V 150 H -100 Z"
              />

              {/* Front Wave (Main) */}
              <motion.path
                animate={isOnline ? { x: [0, -100] } : {}}
                transition={{
                  duration: status === 'danger' ? 2 : status === 'warning' ? 4 : 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                fill="url(#liquidGradient)"
                d="M -100 0 Q -50 12 0 0 Q 50 -12 100 0 Q 150 12 200 0 V 150 H -100 Z"
              />
            </motion.g>
          </svg>

          {/* Value Display */}
          <div className="relative z-10 flex flex-col items-center pointer-events-none drop-shadow-2xl">
            <motion.span
              animate={{ 
                color: isOnline && displayPercentage > 55 ? (isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.9)') : baseTextColor,
                scale: isOnline && status === 'danger' ? [1, 1.05, 1] : 1
              }}
              className="text-6xl md:text-8xl font-black tracking-tighter transition-colors duration-500 tabular-nums"
            >
              {isOnline ? Math.round(value) : '--'}
            </motion.span>
            <motion.span
              animate={{ color: isOnline && displayPercentage > 55 ? 'rgba(0,0,0,0.6)' : baseSubTextColor }}
              className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 transition-colors duration-500 text-center"
            >
              {isOnline ? 'Gas PPM' : 'System Syncing'}
            </motion.span>
          </div>
        </motion.div>

        {/* Glass Reflections & Specular Highlights */}
        <div className="absolute inset-0 rounded-full pointer-events-none z-20">
          {/* Top Glare */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2/3 h-1/6 bg-white rounded-[100%] blur-[20px] opacity-[0.12]" />
          
          {/* Main Reflection */}
          <div className="absolute top-[10%] left-[20%] w-[15%] h-[7%] bg-white rounded-full blur-[3px] opacity-40 -rotate-45" />
          
          {/* Rim Highlight / High-tech Shimmer */}
          <motion.div 
            className="absolute inset-0 rounded-full border border-white/20 shadow-[inset_0_0_50px_rgba(0,0,0,0.4)]"
            animate={isOnline && status === 'danger' ? { borderColor: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.2)'] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </div>

        {/* Hazard Particles Layer */}
        {isOnline && status !== 'safe' && (
           <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-10">
             {[...Array(status === 'danger' ? 12 : 6)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ y: 320, x: Math.random() * 200 - 100, opacity: 0 }}
                 animate={{ y: -60, opacity: [0, 0.4, 0] }}
                 transition={{ 
                   duration: status === 'danger' ? (1 + Math.random()) : (2 + Math.random()), 
                   repeat: Infinity, 
                   delay: Math.random() * 2,
                   ease: "easeOut"
                 }}
                 className="absolute bottom-0 left-1/2 w-[1.5px] h-14 bg-gradient-to-t from-transparent via-white/30 to-transparent"
               />
             ))}
           </div>
        )}
      </div>
    </div>
  );
};

export default LiquidGauge;

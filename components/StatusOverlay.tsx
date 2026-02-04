
import React from 'react';
// Fixing framer-motion type errors by using any cast
import * as FramerMotion from 'framer-motion';
const { motion, AnimatePresence } = FramerMotion as any;
import { AlertTriangle, ShieldAlert, Navigation, Share2, BellOff } from 'lucide-react';
import { Status } from '../types';
import { useSafety } from '../context/SafetyContext';

interface StatusOverlayProps {
  status: Status;
}

const StatusOverlay: React.FC<StatusOverlayProps> = ({ status }) => {
  const { 
    activeAlert, 
    nodes, 
    gasPPM, 
    settings, 
    clearAlert, 
    showToast 
  } = useSafety();
  
  const homeGateway = nodes.find(n => n.role === 'GATEWAY');
  
  // Is my apartment in danger? Local PPM threshold or local gateway status determines this.
  const myDanger = gasPPM >= settings.dangerThreshold || homeGateway?.status === 'danger';
  
  // Is another apartment in danger? A non-null activeAlert indicates a mesh emergency.
  const otherDanger = !!activeAlert;
  
  const showOverlay = myDanger || otherDanger;

  const handleBroadcast = async () => {
    const locationName = myDanger ? "Primary Home Unit" : (activeAlert?.location || "Discovered Mesh Node");
    const ppmValue = myDanger ? Math.round(gasPPM) : (activeAlert?.ppm || 0);
    const alertMessage = `⚠️ SmartGuard Emergency Alert!\n\nLocation: ${locationName}\nConcentration: ${ppmValue} PPM\nStatus: CRITICAL\n\nImmediate emergency response is requested. Please check occupants and verify safety.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SmartGuard Critical Safety Alert',
          text: alertMessage,
          url: window.location.href
        });
        showToast("Emergency broadcast sent.", "success");
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(alertMessage);
        showToast("Alert details copied to clipboard.", "info");
      } catch (copyErr) {
        showToast("Broadcast failed.", "error");
      }
    }
  };

  return (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] pointer-events-none"
        >
          {/* Pulsing hazard border */}
          <div className="absolute inset-0 border-[16px] border-rose-600/50 animate-pulse shadow-[inset_0_0_120px_rgba(225,29,72,0.5)]" />
          
          <div className="absolute inset-0 bg-rose-950/40 backdrop-blur-[4px]" />

          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 pointer-events-auto">
            <motion.div 
              initial={{ y: -20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              className="bg-rose-600 p-8 rounded-[40px] shadow-[0_0_60px_rgba(225,29,72,0.8)] flex flex-col gap-6 border border-rose-400/50 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mx-auto shadow-2xl">
                <AlertTriangle size={40} className="text-white animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-white leading-none uppercase tracking-tighter">
                  {myDanger ? 'EVACUATE NOW!' : 'MESH ALERT!'}
                </h3>
                <p className="text-white/80 font-bold">
                  {myDanger 
                    ? 'CRITICAL gas leakage detected in your apartment.' 
                    : `DANGER detected in ${activeAlert?.location}. Please check neighbors and prepare to evacuate.`}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                 <button 
                  onClick={() => clearAlert()}
                  className="w-full py-5 bg-white text-rose-600 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-rose-50 active:scale-[0.98] transition-all"
                 >
                   <BellOff size={20} /> Alarm Silenced (Local)
                 </button>
                 
                 <button 
                  onClick={handleBroadcast}
                  className="w-full py-4 border border-white/30 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.98] transition-all"
                 >
                   <Share2 size={14} /> Broadcast Incident Report
                 </button>

                 <div className="flex items-center justify-center gap-2 text-white/40 text-[9px] font-black uppercase tracking-widest mt-2">
                   <Navigation size={10} /> External Responders Pinged
                 </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusOverlay;

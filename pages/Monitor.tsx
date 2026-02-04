
import React from 'react';
import * as FramerMotion from 'framer-motion';
const { motion, AnimatePresence } = FramerMotion as any;
import { 
  Thermometer, Droplets, Clock, Building2, Radio,
  ShieldAlert, ShieldCheck, AlertCircle, Signal, Cloud
} from 'lucide-react';
import LiquidGauge from '../components/LiquidGauge';
import DynamicIsland from '../components/DynamicIsland';
import { useSafety } from '../context/SafetyContext';
import { ConnectionStatus } from '../types';

const Monitor: React.FC = () => {
  const { 
    gasPPM, temperature, humidity, status,
    dataSource, activeAlert, clearAlert,
    lastUpdated, connectionStatus
  } = useSafety();
  
  const MAX_PPM = 5000;
  const ppmPercentage = Math.min(100, (gasPPM / MAX_PPM) * 100);

  const formattedTime = lastUpdated?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-10 flex flex-col min-h-full w-full max-w-7xl mx-auto"
    >
      <DynamicIsland status={status} />

      {/* Emergency Mesh Banner */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-rose-600 p-6 rounded-[32px] border border-rose-400/50 shadow-2xl shadow-rose-950/40 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                  <ShieldAlert size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase tracking-tight">Mesh Emergency Detected</h4>
                  <p className="font-bold text-rose-100 opacity-90">Leak reported in {activeAlert.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-200">Local Mesh Stream</p>
                  <p className="text-2xl font-black">{Math.round(activeAlert.ppm)} PPM</p>
                </div>
                <button 
                  onClick={clearAlert}
                  className="bg-white text-rose-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                  Silence Alert
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-3">
          <div className="px-4 py-1.5 glass border border-[var(--border-primary)] rounded-full flex items-center gap-2">
            <Building2 size={12} className="text-zinc-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)]">Unit: Main Gateway</span>
          </div>
          
          <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 transition-all ${
            dataSource === 'CLOUD' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 
            dataSource === 'LOCAL_MESH' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            {dataSource === 'CLOUD' ? <Cloud size={12} /> : dataSource === 'LOCAL_MESH' ? <Signal size={12} /> : <Radio size={12} />}
            <span className="text-[9px] font-black uppercase tracking-widest">
              {dataSource === 'CLOUD' ? 'Cloud Monitoring' : dataSource === 'LOCAL_MESH' ? 'Local Emergency Channel' : 'Simulation Engine'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-6">
        <div className="relative w-full max-w-sm flex justify-center">
          <LiquidGauge 
            percentage={ppmPercentage} 
            status={status} 
            value={gasPPM}
            connectionStatus={connectionStatus}
          />
        </div>
        
        <div className="mt-6 flex flex-col items-center">
          <div className="mt-4">
            {formattedTime ? (
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest bg-[var(--bg-secondary)] px-3 py-1 rounded-full border border-[var(--border-primary)]">
                <Clock size={10} /> Last Data Sync: {formattedTime}
              </div>
            ) : (
              <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest opacity-40">
                Awaiting Initial Packet
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full pb-10">
        <StatCard icon={Thermometer} label="Temperature" value={gasPPM > 0 ? `${temperature.toFixed(1)}°C` : '--'} color="text-orange-400" />
        <StatCard icon={Droplets} label="Humidity" value={gasPPM > 0 ? `${Math.round(humidity)}%` : '--'} color="text-blue-400" />
        <StatCard icon={ShieldCheck} label="Mesh Status" value={status.toUpperCase()} color={status === 'safe' ? 'text-emerald-400' : status === 'warning' ? 'text-amber-400' : 'text-rose-400'} />
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[32px] p-6 shadow-xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-[0.05] text-[var(--text-primary)]">
       <Icon size={48} />
    </div>
    <div className="flex items-start justify-between mb-2">
      <div className={`p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] ${color}`}>
        <Icon size={18} />
      </div>
    </div>
    <div className="space-y-0.5">
      <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-[var(--text-primary)]">{value}</h3>
    </div>
  </div>
);

export default Monitor;

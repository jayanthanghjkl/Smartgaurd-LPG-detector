
import React from 'react';
// Fixing framer-motion type errors by using any cast
import * as FramerMotion from 'framer-motion';
const { motion, AnimatePresence } = FramerMotion as any;
import { 
  Thermometer, Droplets, Wind, Activity, Bluetooth, 
  Wifi, Radio, Cloud, ShieldCheck, Clock, AlertCircle, 
  Database, Cpu, Layers 
} from 'lucide-react';
import LiquidGauge from '../components/LiquidGauge';
import DynamicIsland from '../components/DynamicIsland';
import { useSafety } from '../context/SafetyContext';
import { ConnectionType, ConnectionStatus } from '../types';

const Monitor: React.FC = () => {
  const { 
    gasPPM: gatewayPPM, 
    temperature: gatewayTemp, 
    humidity: gatewayHum, 
    status: gatewayStatus, 
    connectionType: gatewayType, 
    connectionStatus: gatewayConnStatus,
    settings,
    lastUpdated: gatewayLastUpdated,
    nodes,
    selectedNodeId,
    setSelectedNodeId
  } = useSafety();

  // Determine current active data
  const isGatewaySelected = selectedNodeId === 'gateway';
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const activePPM = isGatewaySelected ? gatewayPPM : (selectedNode?.ppm ?? 0);
  const activeTemp = isGatewaySelected ? gatewayTemp : (selectedNode?.temp ?? 0);
  const activeHum = isGatewaySelected ? gatewayHum : (selectedNode?.humidity ?? 0);
  const activeStatus = isGatewaySelected ? gatewayStatus : (selectedNode?.status ?? 'safe');
  const activeConnStatus = isGatewaySelected ? gatewayConnStatus : (selectedNode?.connectionStatus ?? ConnectionStatus.DISCONNECTED);
  const activeType = isGatewaySelected ? gatewayType : (selectedNode?.connectionType ?? ConnectionType.WIFI);
  
  const isDemo = gatewayType === ConnectionType.DEMO && isGatewaySelected;
  
  /**
   * NORMALIZED PPM TO PERCENTAGE
   * 0 PPM = 0%
   * 5000 PPM = 100%
   */
  const MAX_PPM = 5000;
  const ppmPercentage = Math.min(100, (activePPM / MAX_PPM) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 md:p-10 flex flex-col min-h-full bg-transparent"
    >
      <DynamicIsland status={activeStatus} />

      {/* Device Selector */}
      <div className="mt-8 flex justify-center w-full">
        <div className="glass p-1 rounded-2xl flex items-center gap-1 overflow-x-auto max-w-full custom-scrollbar scroll-smooth whitespace-nowrap px-1">
          <button
            onClick={() => setSelectedNodeId('gateway')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isGatewaySelected 
                ? 'bg-emerald-500 text-black shadow-lg scale-105' 
                : 'text-zinc-500 hover:text-[var(--text-primary)] hover:bg-white/5'
            }`}
          >
            {gatewayType === ConnectionType.DEMO ? <Activity size={14} /> : <Cloud size={14} />}
            Primary Gateway
          </button>
          
          {nodes.map(node => (
            <button
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedNodeId === node.id 
                  ? 'bg-emerald-500 text-black shadow-lg scale-105' 
                  : 'text-zinc-500 hover:text-[var(--text-primary)] hover:bg-white/5'
              }`}
            >
              <Cpu size={14} />
              {node.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-10">
        <div className="relative w-full max-w-sm flex justify-center">
          <LiquidGauge 
            percentage={ppmPercentage} 
            status={activeStatus} 
            value={activePPM}
            connectionStatus={activeConnStatus}
          />
          
          {activeConnStatus === ConnectionStatus.CONNECTED && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              className={`absolute top-8 right-6 p-3 rounded-2xl shadow-2xl z-40 border transition-colors ${
                isDemo ? 'bg-blue-500 text-white border-blue-400' : 'bg-emerald-500 text-black border-emerald-400'
              }`}
            >
              {isDemo ? <Activity size={22} strokeWidth={3} /> : <ShieldCheck size={22} strokeWidth={3} />}
            </motion.div>
          )}
        </div>
        
        <div className="mt-6 flex flex-col items-center">
          <motion.div 
            layout
            className={`flex items-center gap-3 px-6 py-2.5 rounded-full border transition-all duration-700 ${
              activeConnStatus === ConnectionStatus.CONNECTED ? 
                (isDemo ? 'bg-blue-500/10 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]') : 
              activeConnStatus === ConnectionStatus.CONNECTING ? 'bg-blue-500/10 border-blue-500/20 animate-pulse' : 
              'bg-rose-500/10 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
            }`}
          >
            {isGatewaySelected ? (
              isDemo ? <Activity size={16} className="text-blue-400" /> : (gatewayType === ConnectionType.WIFI ? <Cloud size={16} className="text-emerald-400" /> : <Radio size={16} className="text-amber-400" />)
            ) : (
              <Layers size={16} className="text-emerald-400" />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">
              {isGatewaySelected 
                ? (settings.thingSpeakChannelId && settings.thingSpeakChannelId !== '0' ? `ThingSpeak ID: ${settings.thingSpeakChannelId}` : 'No Cloud Link')
                : `Node: ${selectedNode?.name}`
              } • {activeConnStatus}
            </span>
          </motion.div>
          
          <div className="mt-4 flex flex-col items-center gap-2">
            {isGatewaySelected && gatewayLastUpdated && (
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest bg-[var(--bg-secondary)] px-3 py-1 rounded-full border border-[var(--border-primary)] backdrop-blur-md shadow-sm">
                <Clock size={10} />
                {isDemo ? 'Last Sim Update: ' : 'ThingSpeak Sync: '} {gatewayLastUpdated.toLocaleTimeString()}
              </div>
            )}
            {!isGatewaySelected && (
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest bg-[var(--bg-secondary)] px-3 py-1 rounded-full border border-[var(--border-primary)] backdrop-blur-md shadow-sm">
                <Database size={10} />
                Viewing Hardware Cache: {selectedNode?.location}
              </div>
            )}
            {settings.demoMode && isGatewaySelected && (
              <div className="text-blue-500/80 text-[10px] font-black uppercase tracking-widest bg-blue-500/5 px-6 py-2 rounded-xl border border-blue-500/20 shadow-sm">
                Developer Simulation Mode Active
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-auto max-w-5xl mx-auto w-full pb-10">
        <StatCard 
          icon={Thermometer} 
          label="Atmosphere" 
          value={activeConnStatus === ConnectionStatus.CONNECTED ? `${activeTemp.toFixed(1)}°C` : '--'} 
          color="text-orange-400"
          trend={isDemo ? "Simulated Thermal Data" : "Sensor Equilibrium"}
        />
        <StatCard 
          icon={Droplets} 
          label="Humidity" 
          value={activeConnStatus === ConnectionStatus.CONNECTED ? `${Math.round(activeHum)}%` : '--'} 
          color="text-blue-400"
          trend={isDemo ? "Simulated Vapor Data" : "Hygrometric State"}
        />
        <StatCard 
          icon={isDemo ? Activity : Wind} 
          label="Safety Audit" 
          value={activeConnStatus === ConnectionStatus.CONNECTED ? (activeStatus === 'safe' ? 'Verified' : activeStatus === 'warning' ? 'Warning' : 'Danger') : 'Link Offline'} 
          color={activeConnStatus === ConnectionStatus.CONNECTED ? (activeStatus === 'safe' ? 'text-emerald-400' : 'text-rose-400') : 'text-zinc-500'}
          trend={isDemo ? "Virtual Environment" : "Cloud Synchronized"}
        />
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
  <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[32px] p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
       <Icon size={64} />
    </div>
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] ${color} shadow-sm`}>
        <Icon size={22} />
      </div>
      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--bg-primary)] px-2 py-1 rounded-lg border border-[var(--border-primary)]">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Verified
      </div>
    </div>
    <div className="space-y-0.5 relative z-10">
      <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">{label}</p>
      <h3 className="text-3xl font-black tracking-tighter text-[var(--text-primary)] transition-colors">{value}</h3>
    </div>
    <div className="mt-4 pt-4 border-t border-[var(--border-primary)] relative z-10">
      <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest group-hover:text-[var(--text-primary)] transition-colors">{trend}</p>
    </div>
  </div>
);

export default Monitor;

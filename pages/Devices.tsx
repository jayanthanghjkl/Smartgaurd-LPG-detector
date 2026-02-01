
import React, { useState } from 'react';
// Fixing framer-motion type errors by using any cast
import * as FramerMotion from 'framer-motion';
const { motion, AnimatePresence } = FramerMotion as any;
import { Battery, Wifi, Signal, RefreshCw, X, Cpu, Trash2, Zap, WifiOff, Plus, MapPin, Cloud } from 'lucide-react';
import { DeviceNode, ConnectionStatus, ConnectionType } from '../types';
import { useSafety } from '../context/SafetyContext';

const Devices: React.FC = () => {
  const { 
    nodes, 
    removeNode, 
    addNode, 
    connectionType, 
    connectionStatus, 
    gasPPM, 
    temperature, 
    humidity, 
    settings,
    showToast
  } = useSafety();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [nodeToRemove, setNodeToRemove] = useState<DeviceNode | null>(null);

  const isDemo = connectionType === ConnectionType.DEMO;

  // In Real mode, we primarily showcase the active gateway node
  const activeGatewayNode: Partial<DeviceNode> = {
    id: 'gateway',
    name: 'Primary Cloud Gateway',
    location: `ThingSpeak CH: ${settings.thingSpeakChannelId}`,
    ppm: gasPPM,
    temp: temperature,
    humidity: humidity,
    battery: 100,
    rssi: -45,
    status: gasPPM > settings.dangerThreshold ? 'danger' : gasPPM > settings.warningThreshold ? 'warning' : 'safe',
    connectionType: ConnectionType.WIFI,
    connectionStatus: connectionStatus
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight mb-1">Hardware Nodes</h2>
            {isDemo && (
              <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-tighter">VIRTUAL MESH</span>
            )}
          </div>
          <p className="text-[var(--text-secondary)] font-medium">
            {isDemo ? 'Viewing simulated network architecture.' : 'Monitoring authenticated hardware gateways.'}
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="bg-emerald-500 text-black px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} strokeWidth={3} />
          Provision Node
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Gateway Node (The one linked to ThingSpeak/Simulation) */}
        <NodeCard 
          node={activeGatewayNode} 
          isGateway 
          onDelete={() => showToast("Gateway node cannot be removed directly from this view.", "info")}
          isDemo={isDemo}
        />

        {/* Other Registered Nodes */}
        {nodes.filter(n => n.id !== 'gateway').map((node) => (
          <NodeCard 
            key={node.id} 
            node={node} 
            onDelete={() => setNodeToRemove(node)} 
            isDemo={isDemo}
          />
        ))}
      </div>

      <ProvisionNodeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={(data) => {
          addNode(data);
          setIsAddModalOpen(false);
        }} 
      />

      <ConfirmDeleteModal 
        node={nodeToRemove} 
        onClose={() => setNodeToRemove(null)} 
        onConfirm={() => {
          if (nodeToRemove) removeNode(nodeToRemove.id);
          setNodeToRemove(null);
        }} 
      />
    </motion.div>
  );
};

const NodeCard = ({ node, onDelete, isGateway, isDemo }: any) => {
  const isOnline = node.connectionStatus === ConnectionStatus.CONNECTED;
  
  const statusConfig = {
    danger: { bg: 'bg-rose-500', text: 'text-rose-500' },
    warning: { bg: 'bg-amber-500', text: 'text-amber-500' },
    safe: { bg: 'bg-emerald-500', text: 'text-emerald-500' }
  };

  const config = statusConfig[node.status as 'danger' | 'warning' | 'safe'] || statusConfig.safe;

  return (
    <div className={`glass rounded-[32px] p-8 shadow-2xl relative overflow-hidden group border transition-all ${isGateway ? 'border-emerald-500/30 ring-1 ring-emerald-500/10' : 'border-white/5'}`}>
      <div className={`absolute top-0 left-0 w-1.5 h-full ${isOnline ? config.bg : 'bg-zinc-800'}`} />
      
      {isGateway && (
        <div className="absolute top-0 right-0 px-4 py-2 bg-emerald-500/10 rounded-bl-2xl border-l border-b border-emerald-500/20">
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
            <Cloud size={10} /> Live Primary Node
          </span>
        </div>
      )}

      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
            {isGateway ? (
              <Cloud size={24} className={isOnline ? 'text-emerald-400' : 'text-zinc-700'} />
            ) : isOnline ? (
              <Wifi size={24} className="text-emerald-400" />
            ) : (
              <WifiOff size={24} className="text-zinc-700" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{node.name}</h3>
            <p className="text-sm text-zinc-500">{node.location}</p>
          </div>
        </div>
        {!isGateway && (
          <button onClick={onDelete} className="p-3 text-zinc-500 hover:text-rose-500 transition-colors bg-white/5 rounded-xl">
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricItem icon={Zap} label="Concentration" value={`${Math.round(node.ppm)}`} unit="PPM" textColor={config.text} />
        <MetricItem icon={Battery} label="Power" value={`${Math.round(node.battery)}%`} unit="" />
        <MetricItem icon={Signal} label="Signal" value={`${node.rssi}`} unit="dBm" />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-800'}`} />
           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{isOnline ? 'Synchronized' : 'Offline'}</span>
        </div>
        {isGateway && isDemo && (
          <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest italic">Simulated Data</span>
        )}
      </div>
    </div>
  );
};

const MetricItem = ({ icon: Icon, label, value, unit, textColor = 'text-white' }: { icon: any, label: string, value: string, unit: string, textColor?: string }) => (
  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center">
    <div className="flex items-center gap-1.5 mb-1.5 text-zinc-500">
      <Icon size={12} />
      <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">{label}</span>
    </div>
    <div className="flex items-baseline gap-0.5">
      <span className={`text-lg font-black ${textColor}`}>{value}</span>
      <span className="text-[9px] font-bold text-zinc-600 uppercase">{unit}</span>
    </div>
  </div>
);

const ProvisionNodeModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (data: Partial<DeviceNode>) => void }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;
    onAdd({ name, location });
    setName('');
    setLocation('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative glass max-w-md w-full p-8 rounded-[40px] shadow-2xl space-y-8"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-3xl mx-auto flex items-center justify-center text-emerald-500 mb-4">
                <Cpu size={32} />
              </div>
              <h3 className="text-2xl font-black">Provision New Node</h3>
              <p className="text-zinc-500 text-sm">Register a new sensor unit to the SmartGuard mesh.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Node Identity</label>
                <div className="relative">
                  <Cpu size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Server Room A" 
                    className="w-full glass rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-emerald-500 transition-all text-white bg-transparent border-white/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Deployment Area</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Sector 7, Floor 2" 
                    className="w-full glass rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-emerald-500 transition-all text-white bg-transparent border-white/5"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={onClose} 
                  className="flex-1 glass py-4 rounded-2xl font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!name || !location}
                  className="flex-1 bg-emerald-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 disabled:opacity-30 transition-all"
                >
                  Register
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ConfirmDeleteModal = ({ node, onClose, onConfirm }: any) => (
  <AnimatePresence>
    {node && (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative glass max-w-sm w-full p-8 rounded-[40px] text-center space-y-6">
          <div className="w-20 h-20 bg-rose-500/20 rounded-full mx-auto flex items-center justify-center text-rose-500">
            <Trash2 size={40} />
          </div>
          <h3 className="text-2xl font-black text-white">Remove Node?</h3>
          <p className="text-zinc-500">This will disconnect <span className="text-white font-bold">{node.name}</span> from the safety mesh.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 glass py-4 rounded-2xl font-bold text-zinc-400">Cancel</button>
            <button onClick={onConfirm} className="flex-1 bg-rose-500 text-white py-4 rounded-2xl font-black shadow-xl shadow-rose-500/20">Remove</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default Devices;

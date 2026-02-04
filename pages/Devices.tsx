
import React, { useState, useMemo } from 'react';
import * as FramerMotion from 'framer-motion';
const { motion, AnimatePresence } = FramerMotion as any;
import { 
  Battery, Signal, RefreshCw, Trash2, Zap, Cpu,
  BluetoothConnected, Search, Edit2, X, Home, Building2,
  Navigation
} from 'lucide-react';
import { DeviceNode, ConnectionStatus } from '../types';
import { useSafety } from '../context/SafetyContext';

const Devices: React.FC = () => {
  const { 
    nodes, 
    removeNode, 
    scanAndConnect,
    disconnectDevice,
    settings,
    updateSettings,
    updateNode,
    connectionStatus
  } = useSafety();
  
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNode, setEditingNode] = useState<DeviceNode | null>(null);

  const filteredNodes = useMemo(() => {
    return nodes.filter(node => 
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      node.deviceId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [nodes, searchQuery]);

  const handleLink = async () => {
    setIsScanning(true);
    try {
      if (settings.demoMode) updateSettings({ demoMode: false });
      await scanAndConnect();
    } catch (e: any) {
      console.error(e);
    } finally { setIsScanning(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Safety Mesh Registry</h2>
          <p className="text-[var(--text-secondary)] font-medium max-w-lg">Manage distributed nodes connected via the primary hardware gateway.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {connectionStatus === ConnectionStatus.CONNECTED && (
            <button onClick={disconnectDevice} className="bg-rose-500/10 text-rose-500 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">
              Unlink Hardware
            </button>
          )}
          <button onClick={handleLink} disabled={isScanning} className="bg-emerald-500 text-black px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
            {isScanning ? <RefreshCw className="animate-spin" size={18} /> : <BluetoothConnected size={18} />}
            {isScanning ? 'Syncing...' : 'Link Primary Gateway'}
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] p-4 rounded-[32px] border border-[var(--border-primary)] shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] opacity-50" size={18} />
          <input 
            type="text" 
            placeholder="Search discovered nodes by ID or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent pl-14 pr-4 py-3 outline-none text-sm font-medium text-[var(--text-primary)] placeholder:opacity-30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredNodes.length === 0 ? (
          <div className="lg:col-span-2 py-24 text-center glass rounded-[40px] border-dashed border-2 border-[var(--border-primary)] space-y-4">
             <Cpu size={48} className="mx-auto text-zinc-600 animate-pulse" />
             <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Waiting for Mesh Discovery...</p>
          </div>
        ) : (
          filteredNodes.map((node) => (
            <NodeCard 
              key={node.id} 
              node={node} 
              onDelete={() => removeNode(node.id)} 
              onEdit={() => setEditingNode(node)}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {editingNode && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingNode(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--bg-primary)] border-l border-[var(--border-primary)] z-[110] p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-black tracking-tight">Edit Node</h3>
                <button onClick={() => setEditingNode(null)} className="p-3 bg-[var(--bg-secondary)] rounded-2xl"><X size={20} /></button>
              </div>
              <div className="space-y-8">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Alias Name</label>
                   <input 
                     defaultValue={editingNode.name}
                     className="w-full glass rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 transition-all text-[var(--text-primary)]"
                     onBlur={(e) => updateNode(editingNode.id, { name: e.target.value })}
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Location / Flat</label>
                   <input 
                     defaultValue={editingNode.location}
                     className="w-full glass rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 transition-all text-[var(--text-primary)]"
                     onBlur={(e) => updateNode(editingNode.id, { location: e.target.value })}
                   />
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const NodeCard = ({ node, onDelete, onEdit }: any) => {
  return (
    <motion.div layout className={`glass rounded-[40px] p-8 shadow-2xl relative overflow-hidden border transition-all ${node.status === 'danger' ? 'border-rose-500/50 bg-rose-500/5' : 'border-[var(--border-primary)]'}`}>
      <div className={`absolute top-0 left-0 w-2 h-full ${node.status === 'danger' ? 'bg-rose-500' : node.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      
      <div className="flex justify-between items-start mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center shrink-0">
            {node.role === 'GATEWAY' ? <Home size={28} className="text-emerald-500" /> : <Building2 size={28} className="text-blue-500" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl font-black text-[var(--text-primary)] truncate">{node.name}</h3>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-60 uppercase tracking-wider">{node.location}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-3 text-[var(--text-secondary)] hover:text-blue-500 transition-colors bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)]"><Edit2 size={16} /></button>
          <button onClick={onDelete} className="p-3 text-[var(--text-secondary)] hover:text-rose-500 transition-colors bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)]"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        <MetricItem icon={Zap} label="GAS" value={`${Math.round(node.ppm)}`} unit="PPM" />
        <MetricItem icon={Battery} label="BATT" value={`${Math.round(node.battery)}%`} unit="" />
        <MetricItem icon={Signal} label="RSSI" value={`${node.rssi}`} unit="dBm" />
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-[var(--border-primary)]">
        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
           <Navigation size={12} /> Discovered via Mesh Relay
        </div>
        <div className="text-[9px] font-black text-[var(--text-secondary)] opacity-40 uppercase">
           ID: {node.deviceId.slice(0, 8)}
        </div>
      </div>
    </motion.div>
  );
};

const MetricItem = ({ icon: Icon, label, value, unit }: any) => (
  <div className="bg-[var(--bg-secondary)] p-4 rounded-3xl border border-[var(--border-primary)] flex flex-col items-center text-center">
    <div className="flex items-center gap-1.5 mb-2 text-[var(--text-secondary)] opacity-50">
      <Icon size={12} />
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-baseline gap-0.5">
      <span className="text-lg font-black text-[var(--text-primary)]">{value}</span>
      <span className="text-[9px] font-bold text-[var(--text-secondary)] opacity-40">{unit}</span>
    </div>
  </div>
);

export default Devices;

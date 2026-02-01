
import React, { useState, useEffect, useMemo } from 'react';
// Fixing framer-motion type errors by using any cast
import * as FramerMotion from 'framer-motion';
const { motion } = FramerMotion as any;
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { Loader2, ChartArea } from 'lucide-react';
import { useSafety } from '../context/SafetyContext';
import { ConnectionType } from '../types';

const generateSimulatedHistory = (range: string) => {
  const points = range === '1H' ? 12 : range === '24H' ? 24 : 7;
  return Array.from({ length: points }).map((_, i) => ({
    time: range === '1H' ? `${(i + 1) * 5}m` : range === '24H' ? `${i}:00` : `Day ${i + 1}`,
    ppm: 350 + Math.random() * 400 + (Math.random() > 0.8 ? 1000 : 0),
    temp: 22 + Math.random() * 2,
  }));
};

const HistoryPage: React.FC = () => {
  const { settings, showToast, connectionType } = useSafety();
  const [range, setRange] = useState('24H');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isDemo = connectionType === ConnectionType.DEMO;

  useEffect(() => {
    const loadHistory = async () => {
      if (isDemo) {
        setData(generateSimulatedHistory(range));
        return;
      }

      // Real Mode: Fetch from ThingSpeak
      if (!settings.thingSpeakChannelId || settings.thingSpeakChannelId === '0') {
        setData([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = range === '1H' ? 12 : range === '24H' ? 48 : 100;
        const keyParam = settings.thingSpeakReadKey ? `&api_key=${settings.thingSpeakReadKey}` : '';
        const url = `https://api.thingspeak.com/channels/${settings.thingSpeakChannelId}/feeds.json?${keyParam}&results=${results}`;
        
        const response = await fetch(url);
        const json = await response.json();
        
        if (json.feeds && json.feeds.length > 0) {
          const formatted = json.feeds.map((f: any) => ({
            time: f.created_at ? new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            ppm: parseFloat(f.field1 || '0'),
            temp: parseFloat(f.field2 || '0'),
          }));
          setData(formatted);
        } else {
          setData([]);
        }
      } catch (e) {
        console.error("History Fetch Error:", e);
        showToast("Failed to sync cloud history", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [range, isDemo, settings.thingSpeakChannelId, settings.thingSpeakReadKey]);

  const peak = useMemo(() => data.length ? Math.max(...data.map(d => d.ppm)) : 0, [data]);
  const avg = useMemo(() => data.length ? Math.round(data.reduce((acc, d) => acc + d.ppm, 0) / data.length) : 0, [data]);

  const handleExport = () => {
    if (!data.length) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,Gas_PPM,Temp_C\n"
      + data.map(d => `${d.time},${Math.round(d.ppm)},${d.temp}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smartguard_${isDemo ? 'sim' : 'cloud'}_${range}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Safety log exported successfully.");
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-black tracking-tight">Exposure Analytics</h2>
            {isDemo && (
              <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-tighter">SIMULATED</span>
            )}
          </div>
          <p className="text-[var(--text-secondary)] font-medium">
            {isDemo ? 'Viewing generated simulation trends.' : `Live telemetry from Channel ${settings.thingSpeakChannelId}.`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            disabled={!data.length}
            className="flex items-center gap-2 glass px-5 py-2.5 rounded-2xl text-xs font-bold hover:bg-white/10 transition-all border-white/5 disabled:opacity-30"
          >
            Export CSV
          </button>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-[var(--border-primary)] self-start md:self-auto">
            {['1H', '24H', '7D'].map(r => (
              <button key={r} onClick={() => setRange(r)} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${range === r ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-[40px] p-6 md:p-10 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-zinc-500">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest">Synchronizing Cloud Data...</span>
          </div>
        ) : data.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-2 text-zinc-500">
                 <span className="text-[10px] font-black uppercase tracking-widest">Time-Series Concentration (PPM)</span>
               </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPpm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(5,5,5,0.9)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="ppm" stroke="#10B981" strokeWidth={4} fill="url(#colorPpm)" animationDuration={1000} />
                  <ReferenceLine y={settings.warningThreshold} stroke="#F59E0B" strokeDasharray="5 5" label={{ position: 'right', value: 'Warn', fill: '#F59E0B', fontSize: 10, fontWeight: 'bold' }} />
                  <ReferenceLine y={settings.dangerThreshold} stroke="#F43F5E" strokeDasharray="5 5" label={{ position: 'right', value: 'Danger', fill: '#F43F5E', fontSize: 10, fontWeight: 'bold' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-zinc-700">
               <ChartArea size={32} />
             </div>
             <div>
               <h3 className="text-xl font-bold">No Data Available</h3>
               <p className="text-zinc-500 max-w-xs mx-auto text-sm">Channel {settings.thingSpeakChannelId} returned no telemetry entries for the selected range.</p>
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricBox label="Critical Peak" value={data.length ? `${peak.toLocaleString()}` : '--'} sub="Max detected exposure" />
        <MetricBox label="Shift Mean" value={data.length ? `${avg.toLocaleString()}` : '--'} sub="Calculated average" />
        <MetricBox label="Audit Count" value={data.length ? data.length.toString() : '0'} sub="Verified data points" />
      </div>
    </motion.div>
  );
};

const MetricBox = ({ label, value, sub }: any) => (
  <div className="glass p-6 rounded-3xl space-y-2 border-white/5">
    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
    <h3 className="text-3xl font-black">{value}</h3>
    <p className="text-xs text-emerald-500/80 font-medium">{sub}</p>
  </div>
);

export default HistoryPage;


import React, { useState } from 'react';
// Fixing framer-motion type errors by using any cast
import * as FramerMotion from 'framer-motion';
const { motion } = FramerMotion as any;
import { Bell, Shield, Phone, Cpu, Save, Bluetooth, Zap, Cloud, Key, Activity, Info, Database } from 'lucide-react';
import { useSafety } from '../context/SafetyContext';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, showToast } = useSafety();
  
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    updateSettings(localSettings);
    setTimeout(() => {
      setIsSaving(false);
      showToast('System configuration saved.');
    }, 800);
  };

  const toggleSetting = (key: keyof typeof localSettings) => {
    setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 pb-32"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight mb-1">System Console</h2>
          <p className="text-zinc-500 font-medium">Configure production-grade safety & IoT persistence.</p>
        </div>
        <motion.button 
          onClick={handleSave}
          disabled={isSaving}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-emerald-500 text-black px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 transition-all"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </motion.button>
      </div>

      <section className="space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-600 mb-4 flex items-center gap-2">
          <Database size={16} /> Supabase Integration (Real-time Cloud)
        </h3>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Project URL</label>
              <div className="relative">
                <Cloud size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  value={localSettings.supabaseUrl}
                  onChange={e => setLocalSettings(prev => ({ ...prev, supabaseUrl: e.target.value }))}
                  placeholder="https://xyz.supabase.co"
                  className="w-full glass rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-emerald-500 transition-all text-[var(--text-primary)] bg-transparent"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Anon API Key</label>
              <div className="relative">
                <Key size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="password"
                  value={localSettings.supabaseKey}
                  onChange={e => setLocalSettings(prev => ({ ...prev, supabaseKey: e.target.value }))}
                  placeholder="••••••••••••••••"
                  className="w-full glass rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-emerald-500 transition-all text-[var(--text-primary)] bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-600 mb-4 flex items-center gap-2">
          <Cloud size={16} /> Legacy Support (ThingSpeak)
        </h3>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Channel ID</label>
              <div className="relative">
                <Activity size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  value={localSettings.thingSpeakChannelId}
                  onChange={e => setLocalSettings(prev => ({ ...prev, thingSpeakChannelId: e.target.value }))}
                  placeholder="e.g. 2347141"
                  className="w-full glass rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-emerald-500 transition-all text-[var(--text-primary)] bg-transparent"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Read Key</label>
              <div className="relative">
                <Key size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="password"
                  value={localSettings.thingSpeakReadKey}
                  onChange={e => setLocalSettings(prev => ({ ...prev, thingSpeakReadKey: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full glass rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-emerald-500 transition-all text-[var(--text-primary)] bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-600 mb-4 flex items-center gap-2">
          <Shield size={16} /> Safety Thresholds
        </h3>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-8 space-y-10">
          <ThresholdSlider 
            label="Warning Level" 
            desc="Alert app at this PPM" 
            value={localSettings.warningThreshold} 
            max={2000} 
            color="amber"
            onChange={v => setLocalSettings(prev => ({ ...prev, warningThreshold: v }))} 
          />
          <ThresholdSlider 
            label="Danger Level" 
            desc="Trigger evacuation protocol" 
            value={localSettings.dangerThreshold} 
            max={5000} 
            color="rose"
            onChange={v => setLocalSettings(prev => ({ ...prev, dangerThreshold: v }))} 
          />
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-600 mb-4">Protocols & Alerts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ToggleCard icon={Bell} title="Push Notifications" desc="Critical alerts to mobile" active={localSettings.notificationsEnabled} onClick={() => toggleSetting('notificationsEnabled')} />
          <ToggleCard icon={Zap} title="Auto-Purge" desc="Activate ventilation systems" active={localSettings.autoPurge} onClick={() => toggleSetting('autoPurge')} />
          <ToggleCard icon={Bluetooth} title="Auto-Connect" desc="Sync with last paired node" active={localSettings.autoConnect} onClick={() => toggleSetting('autoConnect')} />
          <ToggleCard icon={Cpu} title="Demo Mode" desc="Simulate hardware sensors" active={localSettings.demoMode} onClick={() => toggleSetting('demoMode')} />
        </div>
      </section>
    </motion.div>
  );
};

const ThresholdSlider = ({ label, desc, value, max, color, onChange }: { label: string, desc: string, value: number, max: number, color: 'amber' | 'rose', onChange: (v: number) => void }) => {
  const themes = {
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', accent: 'accent-amber-500' },
    rose: { bg: 'bg-rose-500/20', text: 'text-rose-400', accent: 'accent-rose-500' }
  };
  const theme = themes[color];
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${theme.bg} flex items-center justify-center ${theme.text}`}>
            <Shield size={16} />
          </div>
          <div>
            <h4 className="font-bold text-[var(--text-primary)]">{label}</h4>
            <p className="text-xs text-zinc-500">{desc}</p>
          </div>
        </div>
        <span className={`text-xl font-black ${theme.text}`}>{value} PPM</span>
      </div>
      <input 
        type="range" min="300" max={max} step="50" value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${theme.accent} h-2 bg-[var(--border-primary)] rounded-lg appearance-none cursor-pointer`}
      />
    </div>
  );
};

const ToggleCard = ({ icon: Icon, title, desc, active, onClick }: any) => (
  <div onClick={onClick} className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[32px] p-6 flex items-center justify-between cursor-pointer hover:bg-[var(--border-primary)] transition-colors">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[var(--border-primary)] text-zinc-600'}`}>
        <Icon size={20} />
      </div>
      <div><h4 className="font-bold text-sm text-[var(--text-primary)]">{title}</h4><p className="text-xs text-zinc-500">{desc}</p></div>
    </div>
    <div className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
      <motion.div animate={{ x: active ? 24 : 4 }} className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg" />
    </div>
  </div>
);

export default SettingsPage;


import React, { useState } from 'react';
// Fixing react-router-dom type errors by using any cast
import * as ReactRouterDOM from 'react-router-dom';
const { HashRouter, Routes, Route, Link, useLocation, Navigate } = ReactRouterDOM as any;
const Router = HashRouter;

// Fixing framer-motion type errors by using any cast
import * as FramerMotion from 'framer-motion';
const { motion, AnimatePresence } = FramerMotion as any;

import { LayoutDashboard, History, Cpu, Settings, AlertTriangle, LogOut, Sun, Moon } from 'lucide-react';
import Monitor from './pages/Monitor';
import HistoryPage from './pages/HistoryPage';
import Devices from './pages/Devices';
import SettingsPage from './pages/SettingsPage';
import StatusOverlay from './components/StatusOverlay';
import { SafetyProvider, useSafety } from './context/SafetyContext';

const NAVIGATION = [
  { name: 'Monitor', path: '/', icon: LayoutDashboard },
  { name: 'History', path: '/history', icon: History },
  { name: 'Devices', path: '/devices', icon: Cpu },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = () => {
  const { status, connectionType, toggleTheme, settings, setAuthenticated } = useSafety();
  return (
    <nav className="hidden md:flex flex-col w-64 glass border-r border-[var(--border-primary)] p-6 space-y-8 z-20">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <AlertTriangle size={24} className="text-black" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">SmartGuard</h1>
      </div>

      <div className="flex-1 space-y-2">
        {NAVIGATION.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}
      </div>

      <div className="space-y-4">
        <button onClick={toggleTheme} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-zinc-500 hover:text-[var(--text-primary)] hover:bg-white/5 transition-all">
          {settings.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span className="font-medium">{settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Network Status</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'safe' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="text-sm font-medium capitalize text-[var(--text-primary)]">{connectionType.toLowerCase()}</span>
          </div>
        </div>

        <button onClick={() => setAuthenticated(false)} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
};

const MobileTopNav = () => {
  const { status, toggleTheme, settings } = useSafety();
  return (
    <div className="md:hidden flex items-center justify-between px-6 py-4 glass border-b border-[var(--border-primary)] sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg">
          <AlertTriangle size={18} className="text-black" />
        </div>
        <span className="font-black text-lg tracking-tight text-[var(--text-primary)]">SmartGuard</span>
      </div>
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'safe' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <button onClick={toggleTheme} className="p-2 text-zinc-500 active:scale-90 transition-transform">
          {settings.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
};

const MobileBottomNav = () => {
  const location = useLocation();
  return (
    <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50">
      <div className="glass border border-white/10 rounded-[32px] p-1.5 flex items-center justify-between shadow-2xl backdrop-blur-3xl">
        {NAVIGATION.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="flex-1 relative">
              <div className={`py-3 px-1 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1 ${isActive ? 'text-emerald-500' : 'text-zinc-500'}`}>
                <item.icon size={20} className={isActive ? 'scale-110' : 'scale-100'} />
                {isActive && (
                  <motion.div 
                    layoutId="activePill"
                    className="absolute inset-x-1 inset-y-1 bg-emerald-500/10 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`text-[8px] font-black uppercase tracking-widest text-center transition-all ${isActive ? 'opacity-100 max-h-4' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const AuthPage = () => {
  const { setAuthenticated } = useSafety();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setAuthenticated(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-primary)]">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass max-w-md w-full p-10 rounded-[40px] shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-4">
             <AlertTriangle size={32} className="text-black" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">SmartGuard</h2>
          <p className="text-[var(--text-secondary)] font-medium">Production Safety Dashboard</p>
        </div>
        
        <div className="space-y-4">
          <input type="email" placeholder="Email Address" className="w-full glass rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 transition-all text-[var(--text-primary)] bg-transparent" />
          <input type="password" placeholder="System Key" className="w-full glass rounded-2xl px-6 py-4 outline-none focus:border-emerald-500 transition-all text-[var(--text-primary)] bg-transparent" />
        </div>

        <button onClick={handleLogin} disabled={loading} className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20">
          {loading ? 'Decrypting...' : 'Enter Console'}
        </button>
      </motion.div>
    </div>
  );
};

const DashboardLayout = () => {
  const { status, isAuthenticated } = useSafety();

  if (!isAuthenticated) return <AuthPage />;

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <MobileTopNav />
        <main className="flex-1 relative overflow-y-auto overflow-x-hidden pb-32 md:pb-0">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Monitor />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>
        <MobileBottomNav />
      </div>
      <StatusOverlay status={status} />
    </div>
  );
};

const NavLink: React.FC<{ item: (typeof NAVIGATION)[number] }> = ({ item }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  return (
    <Link to={item.path} className="block">
      <motion.div 
        className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-emerald-500 text-black shadow-xl' : 'text-zinc-500 hover:text-[var(--text-primary)] hover:bg-white/5'}`} 
        whileHover={{ x: 4 }}
      >
        <item.icon size={20} />
        <span className="font-medium">{item.name}</span>
      </motion.div>
    </Link>
  );
};

const App = () => (
  <SafetyProvider>
    <Router>
      <DashboardLayout />
    </Router>
  </SafetyProvider>
);

export default App;

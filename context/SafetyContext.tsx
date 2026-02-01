
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useHybridConnection } from '../hooks/useHybridConnection';
import { 
  SafetyState, 
  DeviceNode, 
  ConnectionType, 
  ConnectionStatus, 
  UserSettings,
  ToastMessage
} from '../types';

const SafetyContext = createContext<SafetyState | undefined>(undefined);

const STORAGE_KEY_NODES = 'smartguard_nodes';
const STORAGE_KEY_SETTINGS = 'smartguard_settings';
const STORAGE_KEY_AUTH = 'smartguard_auth';

const DEFAULT_NODES: DeviceNode[] = [
  { id: '1', name: 'Factory Floor A', location: 'Main Bay', ppm: 420, temp: 24.5, humidity: 45, battery: 85, rssi: -65, status: 'safe', connectionType: ConnectionType.WIFI, connectionStatus: ConnectionStatus.CONNECTED },
  { id: '2', name: 'Storage Unit 4', location: 'External Yard', ppm: 380, temp: 21.0, humidity: 50, battery: 92, rssi: -40, status: 'safe', connectionType: ConnectionType.WIFI, connectionStatus: ConnectionStatus.CONNECTED }
];

const DEFAULT_SETTINGS: UserSettings = {
  warningThreshold: 1000,
  dangerThreshold: 2500,
  notificationsEnabled: true,
  autoPurge: false,
  demoMode: false,
  autoConnect: false,
  emergencyContact: '',
  theme: 'dark',
  thingSpeakChannelId: '0', // Default to 0 to indicate setup required
  thingSpeakReadKey: ''
};

export const SafetyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(STORAGE_KEY_AUTH) === 'true');
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string>('gateway');

  const connection = useHybridConnection(
    settings.demoMode,
    settings.thingSpeakChannelId,
    settings.thingSpeakReadKey,
    settings.warningThreshold,
    settings.dangerThreshold
  );
  
  const [nodes, setNodes] = useState<DeviceNode[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_NODES);
    return saved ? JSON.parse(saved) : DEFAULT_NODES;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NODES, JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTH, String(isAuthenticated));
  }, [isAuthenticated]);

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const addNode = (nodeData: Partial<DeviceNode>) => {
    const newNode: DeviceNode = {
      id: Math.random().toString(36).substr(2, 9),
      name: nodeData.name || 'New Node',
      location: nodeData.location || 'Unknown',
      ppm: 0, temp: 0, humidity: 0, battery: 100, rssi: -50,
      status: 'safe', connectionType: ConnectionType.WIFI, connectionStatus: ConnectionStatus.CONNECTED,
      ...nodeData
    };
    setNodes(prev => [...prev, newNode]);
    showToast(`Device "${newNode.name}" added.`);
  };

  const removeNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId('gateway');
    showToast("Device removed from network.", "info");
  };

  const updateNode = (id: string, updates: Partial<DeviceNode>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const value: SafetyState = {
    ...connection,
    nodes,
    settings,
    toasts,
    isAuthenticated,
    selectedNodeId,
    setSelectedNodeId,
    setAuthenticated: setIsAuthenticated,
    toggleTheme,
    addNode,
    removeNode,
    updateNode,
    updateSettings,
    showToast,
  };

  return (
    <SafetyContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} />
    </SafetyContext.Provider>
  );
};

const ToastContainer = ({ toasts }: { toasts: ToastMessage[] }) => (
  <div className="fixed top-24 right-6 z-[200] space-y-3 pointer-events-none">
    {toasts.map(toast => (
      <div key={toast.id} className="glass px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-300 pointer-events-auto">
        <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'}`} />
        <span className="text-sm font-bold text-[var(--text-primary)]">{toast.message}</span>
      </div>
    ))}
  </div>
);

export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (!context) throw new Error('useSafety must be used within a SafetyProvider');
  return context;
};

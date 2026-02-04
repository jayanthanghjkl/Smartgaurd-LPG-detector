
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react';
import { useHybridConnection } from '../hooks/useHybridConnection';
import { getSupabaseClient } from '../lib/supabase';
import { 
  SafetyState, 
  DeviceNode, 
  ConnectionType, 
  ConnectionStatus, 
  UserSettings,
  ToastMessage,
  Status,
  MeshAlert,
  DataSource
} from '../types';

const SafetyContext = createContext<SafetyState | undefined>(undefined);

const STORAGE_KEY_SETTINGS = 'smartguard_hybrid_settings';
const STORAGE_KEY_AUTH = 'smartguard_hybrid_auth';

const DEFAULT_SETTINGS: UserSettings = {
  warningThreshold: 800,
  dangerThreshold: 2000,
  notificationsEnabled: true,
  autoPurge: false,
  demoMode: true,
  autoConnect: false,
  emergencyContact: '',
  theme: 'dark',
  thingSpeakChannelId: '0',
  thingSpeakReadKey: '',
  supabaseUrl: '',
  supabaseKey: ''
};

export const SafetyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(STORAGE_KEY_AUTH) === 'true');
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [nodes, setNodes] = useState<DeviceNode[]>([]);
  const [activeAlert, setActiveAlert] = useState<MeshAlert | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dataSource, setDataSource] = useState<DataSource>(settings.demoMode ? 'DEMO' : 'CLOUD');
  
  // Real-time Gateway State
  const [gasPPM, setGasPPM] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const supabase = useRef(getSupabaseClient(settings.supabaseUrl, settings.supabaseKey));

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // --- Hybrid Data Handlers ---

  // 1. Bluetooth Packet Handler (Emergency & Discovery)
  const handleBluetoothPacket = useCallback((packet: string) => {
    // ALERT:deviceId:ppm:location
    // DATA:deviceId:ppm:temp:hum
    const parts = packet.split(':');
    const header = parts[0];

    if (header === 'ALERT') {
      const alert: MeshAlert = {
        deviceId: parts[1],
        ppm: parseFloat(parts[2]),
        location: parts[3],
        timestamp: new Date()
      };
      setActiveAlert(alert);
      setDataSource('LOCAL_MESH');
      
      // Update nodes list if it's a new node
      updateNodeListFromPacket(parts[1], alert.ppm, alert.location, 'danger');
      
      if (settings.notificationsEnabled && navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
    } else if (header === 'DATA') {
      // Discovery / Beacon data
      updateNodeListFromPacket(parts[1], parseFloat(parts[2]), "Building Mesh", 'safe');
    }
  }, [settings.notificationsEnabled]);

  // 2. Cloud Data Handler (Normal Mode)
  const handleCloudData = useCallback((data: any) => {
    if (activeAlert) return; // Bluetooth Emergency overrides Cloud display
    
    setGasPPM(data.ppm);
    setTemperature(data.temp);
    setHumidity(data.hum);
    setLastUpdated(data.timestamp);
    setDataSource('CLOUD');
  }, [activeAlert]);

  const updateNodeListFromPacket = (deviceId: string, ppm: number, location: string, status: Status) => {
    setNodes(prev => {
      const idx = prev.findIndex(n => n.deviceId === deviceId);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ppm, status, lastSeen: new Date().toISOString() };
        return updated;
      } else {
        const newNode: DeviceNode = {
          id: Math.random().toString(36).substr(2, 9),
          deviceId,
          name: `Unit ${deviceId.slice(-4)}`,
          location,
          role: 'NODE',
          ppm,
          temp: 24,
          humidity: 45,
          battery: 90,
          rssi: -70,
          status,
          lastSeen: new Date().toISOString()
        };
        return [...prev, newNode];
      }
    });
  };

  const connection = useHybridConnection(settings, handleBluetoothPacket, handleCloudData);

  // --- Demo Simulation Engine ---
  useEffect(() => {
    if (!settings.demoMode) return;

    const interval = setInterval(() => {
      const simPPM = 400 + Math.random() * 200;
      setGasPPM(simPPM);
      setTemperature(22.5 + Math.random());
      setHumidity(45 + Math.random() * 5);
      setLastUpdated(new Date());
      setDataSource('DEMO');

      // Random Demo Emergency Simulation
      if (Math.random() > 0.95 && !activeAlert) {
        setActiveAlert({
          deviceId: 'DEMO-X9',
          location: 'Apartment 402',
          ppm: 3500,
          timestamp: new Date()
        });
        setDataSource('LOCAL_MESH');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [settings.demoMode, activeAlert]);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTH, String(isAuthenticated));
  }, [isAuthenticated]);

  const status: Status = activeAlert ? 'danger' : (gasPPM >= settings.dangerThreshold ? 'danger' : gasPPM >= settings.warningThreshold ? 'warning' : 'safe');

  const value: SafetyState = {
    ...connection,
    gasPPM,
    temperature,
    humidity,
    status,
    dataSource,
    nodes,
    activeAlert,
    settings,
    toasts,
    isAuthenticated,
    lastUpdated,
    setAuthenticated: setIsAuthenticated,
    toggleTheme: () => setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' })),
    scanAndConnect: async () => {
      try {
        await connection.scanAndConnect();
        showToast("Gateway Linked via Bluetooth", "success");
      } catch (err: any) {
        showToast(err.message, "error");
      }
    },
    disconnectDevice: () => {
      connection.disconnectDevice();
      showToast("Gateway Unlinked", "info");
    },
    updateNode: (id, data) => setNodes(prev => prev.map(n => n.id === id ? { ...n, ...data } : n)),
    removeNode: (id) => setNodes(prev => prev.filter(n => n.id !== id)),
    updateSettings: (newSettings) => setSettings(prev => ({ ...prev, ...newSettings })),
    showToast,
    clearAlert: () => {
      setActiveAlert(null);
      setDataSource(settings.demoMode ? 'DEMO' : 'CLOUD');
    }
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

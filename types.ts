
export type Status = 'safe' | 'warning' | 'danger';
export type Theme = 'light' | 'dark';

export enum ConnectionType {
  BLUETOOTH = 'BLUETOOTH',
  WIFI = 'WIFI',
  DEMO = 'DEMO',
  OFFLINE = 'OFFLINE'
}

export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}

export interface DeviceNode {
  id: string;
  name: string;
  location: string;
  ip?: string;
  ppm: number;
  temp: number;
  humidity: number;
  battery: number;
  rssi: number;
  status: Status;
  connectionType: ConnectionType;
  connectionStatus: ConnectionStatus;
}

export interface UserSettings {
  warningThreshold: number;
  dangerThreshold: number;
  notificationsEnabled: boolean;
  autoPurge: boolean;
  demoMode: boolean;
  autoConnect: boolean;
  emergencyContact: string;
  theme: Theme;
  thingSpeakChannelId: string;
  thingSpeakReadKey: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface SafetyState {
  gasPPM: number;
  temperature: number;
  humidity: number;
  connectionType: ConnectionType;
  connectionStatus: ConnectionStatus;
  status: Status;
  nodes: DeviceNode[];
  settings: UserSettings;
  toasts: ToastMessage[];
  isAuthenticated: boolean;
  lastUpdated: Date | null;
  selectedNodeId: string;
  setSelectedNodeId: (id: string) => void;
  setAuthenticated: (val: boolean) => void;
  toggleTheme: () => void;
  connectBluetooth: () => Promise<void>;
  disconnectBluetooth: () => void;
  addNode: (node: Partial<DeviceNode>) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<DeviceNode>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}


export type Status = 'safe' | 'warning' | 'danger';
export type Theme = 'light' | 'dark';
export type MeshRole = 'GATEWAY' | 'NODE';
export type DataSource = 'CLOUD' | 'LOCAL_MESH' | 'DEMO';

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
  deviceId: string;
  name: string;
  location: string;
  role: MeshRole;
  ppm: number;
  temp: number;
  humidity: number;
  battery: number;
  rssi: number;
  status: Status;
  lastSeen: string;
}

export interface MeshAlert {
  deviceId: string;
  location: string;
  ppm: number;
  timestamp: Date;
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
  supabaseUrl: string;
  supabaseKey: string;
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
  dataSource: DataSource;
  nodes: DeviceNode[];
  activeAlert: MeshAlert | null;
  settings: UserSettings;
  toasts: ToastMessage[];
  isAuthenticated: boolean;
  lastUpdated: Date | null;
  setAuthenticated: (val: boolean) => void;
  toggleTheme: () => void;
  scanAndConnect: () => Promise<void>;
  disconnectDevice: () => void;
  updateNode: (id: string, data: Partial<DeviceNode>) => void;
  removeNode: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearAlert: () => void;
}

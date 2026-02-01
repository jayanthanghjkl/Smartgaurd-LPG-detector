
import { useState, useEffect, useCallback, useRef } from 'react';
import { ConnectionType, ConnectionStatus, Status } from '../types';

const THINGSPEAK_POLL_INTERVAL = 15000; // ThingSpeak free tier rate limit
const DEMO_POLL_INTERVAL = 1500; // Fast feedback for demo mode

export const useHybridConnection = (
  forceDemo: boolean, 
  channelId: string, 
  readKey: string,
  warningThreshold: number,
  dangerThreshold: number
) => {
  // Initialize with 0 to ensure display starts empty before source verification
  const [gasPPM, setGasPPM] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(0);
  const [humidity, setHumidity] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connectionType, setConnectionType] = useState<ConnectionType>(forceDemo ? ConnectionType.DEMO : ConnectionType.WIFI);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);

  // Derived status calculation using dynamic thresholds
  const getStatus = useCallback((ppm: number): Status => {
    if (ppm >= dangerThreshold) return 'danger';
    if (ppm >= warningThreshold) return 'warning';
    return 'safe';
  }, [warningThreshold, dangerThreshold]);

  // Sync state when mode changes externally
  useEffect(() => {
    const newType = forceDemo ? ConnectionType.DEMO : ConnectionType.WIFI;
    setConnectionType(newType);
    
    // Purge simulated data when switching to real cloud link
    if (newType === ConnectionType.WIFI) {
      setGasPPM(0);
      setTemperature(0);
      setHumidity(0);
      setLastUpdated(null);
      setConnectionStatus(ConnectionStatus.CONNECTING);
    }
  }, [forceDemo]);

  useEffect(() => {
    if (connectionType === ConnectionType.OFFLINE) {
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      return;
    }

    const fetchData = async () => {
      // --- MODE: VIRTUAL SIMULATOR ---
      if (connectionType === ConnectionType.DEMO) {
        // Randomly simulate PPM that occasionally crosses thresholds for testing
        const basePPM = 400 + Math.random() * 200;
        const spikeChance = Math.random();
        const finalPPM = spikeChance > 0.9 ? dangerThreshold + 200 : spikeChance > 0.7 ? warningThreshold + 100 : basePPM;
        
        setGasPPM(Math.round(finalPPM));
        setTemperature(22.5 + (Math.random() - 0.5) * 5);
        setHumidity(48 + (Math.random() - 0.5) * 12);
        setLastUpdated(new Date());
        setConnectionStatus(ConnectionStatus.CONNECTED);
        return;
      }

      // --- MODE: REAL THINGSPEAK CLOUD ---
      if (!channelId || channelId === '0' || channelId.trim() === '') {
        setConnectionStatus(ConnectionStatus.DISCONNECTED);
        return;
      }

      const keyParam = readKey ? `&api_key=${readKey}` : '';
      const url = `https://api.thingspeak.com/channels/${channelId}/feeds/last.json?${keyParam}`;

      try {
        setConnectionStatus(prev => prev === ConnectionStatus.CONNECTED ? prev : ConnectionStatus.CONNECTING);
        const res = await fetch(url);
        
        if (!res.ok) throw new Error(`Link Error: ${res.status}`);

        const data = await res.json();

        // field1 is typically mapped to PPM in SmartGuard firmware
        if (data && data.created_at) {
          const ppmValue = Math.round(parseFloat(data.field1 || '0'));
          const tempValue = parseFloat(parseFloat(data.field2 || '0').toFixed(1));
          const humValue = Math.round(parseFloat(data.field3 || '0'));

          setGasPPM(isNaN(ppmValue) ? 0 : ppmValue);
          setTemperature(isNaN(tempValue) ? 0 : tempValue);
          setHumidity(isNaN(humValue) ? 0 : humValue);
          setLastUpdated(new Date(data.created_at));
          setConnectionStatus(ConnectionStatus.CONNECTED);
        } else {
          // Channel exists but has no data entries
          setConnectionStatus(ConnectionStatus.DISCONNECTED);
        }
      } catch (e: any) {
        console.error('Safety Link Failed:', e.message);
        setConnectionStatus(ConnectionStatus.ERROR);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, connectionType === ConnectionType.DEMO ? DEMO_POLL_INTERVAL : THINGSPEAK_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [connectionType, channelId, readKey, warningThreshold, dangerThreshold]);

  return {
    gasPPM,
    temperature,
    humidity,
    lastUpdated,
    connectionType,
    connectionStatus,
    status: getStatus(gasPPM),
    connectBluetooth: async () => { console.debug("BLE Pairing - Feature Not Active"); }, 
    disconnectBluetooth: () => { setConnectionStatus(ConnectionStatus.DISCONNECTED); },
  };
};


import { useState, useEffect, useCallback, useRef } from 'react';
import { ConnectionType, ConnectionStatus, DataSource } from '../types';

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

export const useHybridConnection = (
  settings: any,
  onBluetoothPacket: (packet: string) => void,
  onCloudData: (data: any) => void
) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [connectionType, setConnectionType] = useState<ConnectionType>(settings.demoMode ? ConnectionType.DEMO : ConnectionType.OFFLINE);
  
  const deviceRef = useRef<any>(null);
  const characteristicRef = useRef<any>(null);
  const cloudPollingInterval = useRef<any>(null);

  // --- Bluetooth Logic ---
  const handleCharacteristicValueChange = (event: any) => {
    const value = new TextDecoder().decode(event.target.value);
    onBluetoothPacket(value);
  };

  const scanAndConnect = async () => {
    if (!(navigator as any).bluetooth) {
      throw new Error("Web Bluetooth is not supported in this environment.");
    }

    try {
      setConnectionStatus(ConnectionStatus.CONNECTING);
      
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }],
        optionalServices: ['battery_service']
      });

      deviceRef.current = device;
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService(SERVICE_UUID);
      const characteristic = await service?.getCharacteristic(CHARACTERISTIC_UUID);

      if (characteristic) {
        characteristicRef.current = characteristic;
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChange);
        
        setConnectionStatus(ConnectionStatus.CONNECTED);
        setConnectionType(ConnectionType.BLUETOOTH);
        
        device.addEventListener('gattserverdisconnected', () => {
          setConnectionStatus(ConnectionStatus.DISCONNECTED);
          setConnectionType(ConnectionType.OFFLINE);
          characteristicRef.current = null;
          deviceRef.current = null;
        });
      }
    } catch (error: any) {
      // Handle "User cancelled requestDevice()" or other common errors
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      if (error.name === 'NotFoundError') {
        throw new Error("Selection cancelled. No device linked.");
      } else if (error.name === 'SecurityError') {
        throw new Error("Bluetooth permission denied.");
      }
      throw error;
    }
  };

  const disconnectDevice = () => {
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
  };

  // --- Cloud Polling Logic (ThingSpeak) ---
  useEffect(() => {
    if (settings.demoMode) {
      if (cloudPollingInterval.current) clearInterval(cloudPollingInterval.current);
      return;
    }

    const pollThingSpeak = async () => {
      if (!settings.thingSpeakChannelId || settings.thingSpeakChannelId === '0') return;
      
      try {
        const url = `https://api.thingspeak.com/channels/${settings.thingSpeakChannelId}/feeds/last.json?api_key=${settings.thingSpeakReadKey}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.created_at) {
          onCloudData({
            ppm: parseFloat(data.field1 || '0'),
            temp: parseFloat(data.field2 || '24'),
            hum: parseFloat(data.field3 || '50'),
            timestamp: new Date(data.created_at)
          });
        }
      } catch (e) {
        console.error("Cloud Polling Error:", e);
      }
    };

    // Initial poll
    pollThingSpeak();
    
    // Set interval for every 15s (ThingSpeak rate limit)
    cloudPollingInterval.current = setInterval(pollThingSpeak, 15000);

    return () => {
      if (cloudPollingInterval.current) clearInterval(cloudPollingInterval.current);
    };
  }, [settings.demoMode, settings.thingSpeakChannelId, settings.thingSpeakReadKey, onCloudData]);

  // Handle Demo Mode switch
  useEffect(() => {
    if (settings.demoMode) {
      setConnectionType(ConnectionType.DEMO);
      setConnectionStatus(ConnectionStatus.CONNECTED);
    } else {
      if (connectionType === ConnectionType.DEMO) {
        setConnectionType(ConnectionType.OFFLINE);
        setConnectionStatus(ConnectionStatus.DISCONNECTED);
      }
    }
  }, [settings.demoMode]);

  return {
    connectionType,
    connectionStatus,
    scanAndConnect,
    disconnectDevice
  };
};

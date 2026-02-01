
import React, { useState } from 'react';
// Fixing framer-motion type errors by using any cast
import * as FramerMotion from 'framer-motion';
const { motion, AnimatePresence } = FramerMotion as any;
import { 
  Cpu, Cloud, Code, Terminal, HardDrive, Database, 
  Server, Copy, Check, ShieldCheck, Globe, Rocket, 
  AlertCircle, Smartphone, Monitor as MonitorIcon, Info
} from 'lucide-react';

const FIRMWARE_CODE = `// SmartGuard ESP32 Firmware v1.0.4
// Hardware: ESP32 WROOM-32 + MQ2 + Buzzer
#include <WiFi.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <HTTPClient.h>

#define MQ2_PIN 34
#define BUZZER_PIN 26
#define LED_PIN 2

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASS";
const char* apiKey = "THINGSPEAK_API_KEY";

BLECharacteristic *pCharacteristic;
bool deviceConnected = false;

// BLE UUIDs
#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Initialize BLE
  BLEDevice::init("SmartGuard-Node-01");
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ |
                      BLECharacteristic::PROPERTY_NOTIFY
                    );
  pCharacteristic->addDescriptor(new BLE2902());
  pService->start();
  pServer->getAdvertising()->start();

  // WiFi Attempt
  WiFi.begin(ssid, password);
}

void loop() {
  int rawValue = analogRead(MQ2_PIN);
  float ppm = map(rawValue, 0, 4095, 300, 10000);
  
  // BLE Update
  String data = "GAS:" + String(ppm) + ",TEMP:24.2,HUM:48";
  pCharacteristic->setValue(data.c_str());
  pCharacteristic->notify();

  // Emergency Logic
  if (ppm > 2500) {
    digitalWrite(BUZZER_PIN, HIGH);
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(LED_PIN, LOW);
  }

  // ThingSpeak WiFi Update (Every 15s)
  static unsigned long lastUpdate = 0;
  if (millis() - lastUpdate > 15000 && WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = "http://api.thingspeak.com/update?api_key=" + String(apiKey) + "&field1=" + String(ppm);
    http.begin(url);
    http.GET();
    http.end();
    lastUpdate = millis();
  }
  
  delay(1000);
}`;

const Technical: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hardware' | 'deployment'>('hardware');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(FIRMWARE_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-10 space-y-10 max-w-6xl mx-auto pb-32"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Engineering Verified</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <Terminal className="text-emerald-400" /> Technical Hub
          </h2>
          <p className="text-zinc-500 font-medium max-w-xl">
            Integrated repository for firmware assets, cloud configurations, and production deployment protocols.
          </p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('hardware')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'hardware' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            Firmware & HW
          </button>
          <button 
            onClick={() => setActiveTab('deployment')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'deployment' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            Deployment
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'hardware' ? (
          <motion.div 
            key="hw"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TechCard icon={Cpu} title="GPIO Mapping" details={[
                { label: 'Sensor MQ2', val: 'GPIO34' },
                { label: 'Buzzer', val: 'GPIO26' },
                { label: 'LED', val: 'GPIO2' }
              ]} />
              <TechCard icon={Cloud} title="ThingSpeak" details={[
                { label: 'Format', val: 'JSON' },
                { label: 'Interval', val: '15s' },
                { label: 'Protocol', val: 'REST/HTTP' }
              ]} />
              <TechCard icon={Database} title="BLE GATT" details={[
                { label: 'MTU', val: '23 Bytes' },
                { label: 'Encoding', val: 'UTF-8' },
                { label: 'Type', val: 'Notify' }
              ]} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Code size={16} /> Production Firmware
                </h3>
                <button onClick={handleCopy} className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <pre className="p-8 text-xs md:text-sm font-mono text-zinc-400 overflow-x-auto leading-relaxed custom-scrollbar">
                  <code>{FIRMWARE_CODE}</code>
                </pre>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="deploy"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Checklist */}
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Rocket className="text-blue-400" /> Deployment Checklist
                </h3>
                <div className="space-y-4">
                  <ChecklistItem label="HTTPS Enforcement" status="Critical" />
                  <ChecklistItem label="GATT Permission Handler" status="Required" />
                  <ChecklistItem label="Vibration Policy Compliance" status="Warning" />
                  <ChecklistItem label="ThingSpeak API Keys Sec" status="Required" />
                  <ChecklistItem label="PWA Manifest Verification" status="Verified" />
                </div>
              </div>

              {/* Compatibility */}
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Globe className="text-purple-400" /> Compatibility Matrix
                </h3>
                <div className="space-y-4">
                  <CompatibilityRow browser="Chrome (Desktop)" status="Full Support" icon={MonitorIcon} />
                  <CompatibilityRow browser="Chrome (Android)" status="Full Support" icon={Smartphone} />
                  <CompatibilityRow browser="Bluefy (iOS)" status="BLE Only" icon={Smartphone} />
                  <CompatibilityRow browser="Safari (iOS)" status="No Bluetooth" icon={Smartphone} isDanger />
                </div>
              </div>
            </div>

            {/* Security Notes */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[40px] p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 text-emerald-500/20">
                 <ShieldCheck size={120} />
               </div>
               <div className="relative z-10 space-y-4">
                 <h4 className="text-2xl font-black flex items-center gap-3"><AlertCircle className="text-emerald-500" /> Security Hardening</h4>
                 <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-zinc-400">
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span><b>BLE User Gesture:</b> Web Bluetooth requests must originate from a user interaction to prevent unauthorized device scanning.</span>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span><b>CSP Headers:</b> Restrict <code>connect-src</code> to ThingSpeak and Localhost (during dev) to mitigate XSS telemetry injection.</span>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span><b>HTTPS Only:</b> Navigator.bluetooth and Navigator.vibrate are strictly blocked on non-secure origins.</span>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span><b>Rate Limiting:</b> ESP32 nodes should enforce a minimum 15s window between WiFi uploads to prevent API throttling.</span>
                    </li>
                 </ul>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ChecklistItem = ({ label, status }: { label: string, status: string }) => (
  <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
    <span className="text-sm font-medium text-zinc-300">{label}</span>
    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
      status === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
      status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400' :
      'bg-blue-500/20 text-blue-400'
    }`}>{status}</span>
  </div>
);

const CompatibilityRow = ({ browser, status, icon: Icon, isDanger }: any) => (
  <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-zinc-500" />
      <span className="text-sm font-bold">{browser}</span>
    </div>
    <span className={`text-xs font-bold ${isDanger ? 'text-rose-400' : 'text-zinc-400'}`}>{status}</span>
  </div>
);

const TechCard = ({ icon: Icon, title, details }: any) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-3 bg-black rounded-2xl border border-white/5 text-zinc-400">
        <Icon size={20} />
      </div>
      <h4 className="font-bold text-white">{title}</h4>
    </div>
    <div className="space-y-3">
      {details.map((d: any, i: number) => (
        <div key={i} className="flex justify-between items-center text-xs">
          <span className="text-zinc-500 font-bold uppercase tracking-wider">{d.label}</span>
          <span className="text-zinc-300 font-mono bg-black/50 px-2 py-1 rounded border border-white/5">{d.val}</span>
        </div>
      ))}
    </div>
  </div>
);

export default Technical;

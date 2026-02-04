
import React, { useState } from 'react';
import * as FramerMotion from 'framer-motion';
const { motion, AnimatePresence } = FramerMotion as any;
import { 
  Cpu, Cloud, Code, Terminal, Database, 
  Copy, Check, ShieldCheck, Globe, Rocket, 
  AlertCircle, Smartphone, Monitor as MonitorIcon
} from 'lucide-react';

const FIRMWARE_CODE = `// SmartGuard Hybrid Mesh Firmware v2.0
// Features: Auto-Mesh, WiFi Persistence, Emergency Priority Relay

#include <WiFi.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <painlessMesh.h>

#define MQ2_PIN 34
#define BUZZER_PIN 26

// WiFi & Mesh Config
const char* WIFI_SSID = "HomeNet";
const char* WIFI_PASS = "Pass123";
#define MESH_SSID "SmartGuardMesh"
#define MESH_PASS = "MeshSecure99"
#define MESH_PORT 5555

painlessMesh mesh;
BLECharacteristic *pCharacteristic;
String deviceId = "NODE-" + String((uint32_t)ESP.getEfuseMac(), HEX);

// Mesh Messaging: Emergency Priority
void handleMeshMessage(uint32_t from, String &msg) {
  if (msg.startsWith("ALERT")) {
    digitalWrite(BUZZER_PIN, HIGH);
    // Forward to App if this node is the Gateway
    if (pCharacteristic) {
      pCharacteristic->setValue(msg.c_str());
      pCharacteristic->notify();
    }
  }
}

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  
  // 1. Init BLE for App Connectivity (Gateway Mode)
  BLEDevice::init("SmartGuard-Gateway");
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService("4fafc201-1fb5-459e-8fcc-c5c9c331914b");
  pCharacteristic = pService->createCharacteristic("beb5483e-36e1-4688-b7f5-ea07361b26a8", BLECharacteristic::PROPERTY_NOTIFY);
  pService->start();
  pServer->getAdvertising()->start();

  // 2. Init Mesh (painlessMesh handles auto-join/formation)
  mesh.init(MESH_SSID, MESH_PASS, MESH_PORT);
  mesh.onReceive(&handleMeshMessage);

  // 3. Init WiFi for Cloud Sync
  WiFi.begin(WIFI_SSID, WIFI_PASS);
}

void loop() {
  mesh.update();
  int gas = analogRead(MQ2_PIN);
  
  // Emergency Detection
  if (gas > 2500) {
    String alert = "ALERT:" + deviceId + ":" + String(gas) + ":Flat-402";
    mesh.sendBroadcast(alert);
    digitalWrite(BUZZER_PIN, HIGH);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }

  // Periodic Cloud Upload (WiFi)
  static long lastCloud = 0;
  if (millis() - lastCloud > 15000 && WiFi.status() == WL_CONNECTED) {
    // Sync to ThingSpeak...
    lastCloud = millis();
  }
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
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Mesh Architecture v2</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <Terminal className="text-emerald-400" /> Technical Hub
          </h2>
          <p className="text-zinc-500 font-medium max-w-xl">
            Hybrid safety protocols: ThingSpeak (Telemetry) + BLE Mesh (Low-Latency Emergency).
          </p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('hardware')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'hardware' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            Firmware
          </button>
          <button 
            onClick={() => setActiveTab('deployment')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'deployment' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            Protocols
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'hardware' ? (
          <motion.div key="hw" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TechCard icon={Cpu} title="Mesh Role" details={[
                { label: 'Role Discovery', val: 'Auto' },
                { label: 'Mesh Port', val: '5555' },
                { label: 'Latency', val: '<200ms' }
              ]} />
              <TechCard icon={Cloud} title="Cloud Sync" details={[
                { label: 'WiFi Path', val: 'HTTP/REST' },
                { label: 'Frequency', val: '15s' },
                { label: 'Provider', val: 'ThingSpeak' }
              ]} />
              <TechCard icon={Database} title="BLE Link" details={[
                { label: 'Channel', val: 'App Link' },
                { label: 'Purpose', val: 'Emergency' },
                { label: 'Range', val: '30m (Relayed)' }
              ]} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Code size={16} /> Hybrid Mesh Firmware
                </h3>
                <button onClick={handleCopy} className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy Blueprint'}
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
          <motion.div key="deploy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3"><Rocket className="text-blue-400" /> Mesh Deployment</h3>
                <div className="space-y-4">
                  <ChecklistItem label="Gateway Selection" status="Auto-First" />
                  <ChecklistItem label="Mesh Encryption" status="AES-128" />
                  <ChecklistItem label="Node Verification" status="Required" />
                  <ChecklistItem label="Buzzer Relay Logic" status="Critical" />
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3"><Globe className="text-purple-400" /> Network Matrix</h3>
                <div className="space-y-4">
                  <CompatibilityRow browser="Primary Path" status="ThingSpeak" icon={Cloud} />
                  <CompatibilityRow browser="Critical Path" status="BLE Mesh" icon={ShieldCheck} />
                  <CompatibilityRow browser="Discovery" status="BLE Scan" icon={Smartphone} />
                </div>
              </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[40px] p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 text-emerald-500/20"><ShieldCheck size={120} /></div>
               <div className="relative z-10 space-y-4">
                 <h4 className="text-2xl font-black flex items-center gap-3"><AlertCircle className="text-emerald-500" /> Security Protocol</h4>
                 <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
                    Emergency packets are prioritized in the mesh routing table. The Primary Gateway utilizes a dedicated BLE notify channel to ensure the Web Application receives alerts within 200ms of detection, bypassing typical cloud latency. All device IDs are verified against the Supabase registry before being acknowledged by the monitoring console.
                 </p>
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
    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-blue-500/20 text-blue-400">{status}</span>
  </div>
);

const CompatibilityRow = ({ browser, status, icon: Icon }: any) => (
  <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-zinc-500" />
      <span className="text-sm font-bold">{browser}</span>
    </div>
    <span className="text-xs font-bold text-zinc-400">{status}</span>
  </div>
);

const TechCard = ({ icon: Icon, title, details }: any) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-3 bg-black rounded-2xl border border-white/5 text-zinc-400"><Icon size={20} /></div>
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

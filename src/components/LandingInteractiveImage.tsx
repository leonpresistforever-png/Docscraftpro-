import React, { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { MousePointer2, Settings, Layers, Code, Zap, ArrowRight, ArrowLeft, Sliders, Activity, Cpu, Sparkles, Orbit } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { RobotCompanion } from './ui/RobotCompanion';

interface SceneProps {
  scale: number;
  color: string;
  speed: number;
}

function DataFlowScene({ scale, color, speed }: SceneProps) {
  const group = useRef<any>(null);
  const centerSphere = useRef<any>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.15 * speed;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 * speed;
    }
    if (centerSphere.current) {
      const pulse = scale + Math.sin(state.clock.elapsedTime * 3 * speed) * 0.05;
      centerSphere.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[2.5, 0]} />
        <meshStandardMaterial color={color} wireframe transparent opacity={0.3} />
      </mesh>
      
      {Array.from({ length: 12 }).map((_, i) => (
        <Float key={i} speed={2 * speed} rotationIntensity={1} floatIntensity={2}>
          <mesh position={[
            Math.sin((i / 12) * Math.PI * 2) * 4.5,
            (Math.random() - 0.5) * 3,
            Math.cos((i / 12) * Math.PI * 2) * 4.5
          ]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshPhysicalMaterial 
              color={i % 2 === 0 ? color : "#ffffff"} 
              roughness={0.1} 
              metalness={0.9} 
              clearcoat={1}
            />
          </mesh>
        </Float>
      ))}
      <mesh ref={centerSphere} position={[0, 0, 0]}>
        <sphereGeometry args={[1.0, 64, 64]} />
        <meshPhysicalMaterial 
          color={color}
          roughness={0.1} 
          metalness={0.8} 
          clearcoat={1}
          clearcoatRoughness={0.1}
          iridescence={1}
        />
      </mesh>
    </group>
  );
}

function InteractiveBackgroundGeometry() {
  const pointsRef = useRef<any>(null);
  const count = 3000;
  
  const { positions, randoms } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 10 + Math.random() * 5;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      randoms[i] = Math.random();
    }
    return { positions, randoms };
  }, []);
  
  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    if (pointsRef.current.userData.accumulator === undefined) {
      pointsRef.current.userData.accumulator = 0;
    }
    pointsRef.current.userData.accumulator += delta;

    if (pointsRef.current.userData.accumulator >= 1 / 60) {
      const time = state.clock.elapsedTime;
      pointsRef.current.rotation.y = time * 0.05;
      pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
      pointsRef.current.userData.accumulator -= 1 / 60;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color="#3b82f6" 
        transparent 
        opacity={0.6} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function LandingInteractiveImage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "200px" });
  const [showGreeting, setShowGreeting] = useState(true);

  // Hologram Control States
  const [synapseScale, setSynapseScale] = useState<number>(1.2);
  const [synapseColor, setSynapseColor] = useState<string>('#3b82f6');
  const [synapseSpeed, setSynapseSpeed] = useState<number>(1.0);
  const [activeTab, setActiveTab] = useState<'hologram' | 'console'>('hologram');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'System initialization successful.',
    'Ready for spatial alignment inputs.'
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [...prev.slice(-4), `[${timestamp}] ${msg}`]);
  };

  const handlePulseCore = () => {
    addLog('Dispatched high-intensity resonance pulse to core.');
    setSynapseScale(1.8);
    setTimeout(() => setSynapseScale(1.2), 300);
  };

  return (
    <div ref={containerRef} className="relative w-full min-h-[100vh] flex flex-col items-center justify-center overflow-x-hidden bg-white py-24 border-t border-gray-100">
       
       <div className="text-center max-w-3xl mb-16 relative z-30 px-4">
          <h2 className="text-4xl md:text-5xl font-black font-serif text-gray-900 mb-4 tracking-tight">Spatial Synthesis Hub</h2>
          <p className="text-xl text-gray-500 bg-white/50 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
            Control physical style vector fields and quantum nodes in real-time.
          </p>
       </div>

       {/* Real Background Image with Particle Fields */}
       <div className="absolute inset-0 z-0 overflow-hidden bg-gray-50 flex items-center justify-center">
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm pointer-events-none"></div>
          
          <div className="absolute inset-0 opacity-40 z-0">
             {isInView && (
               <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 15], fov: 45 }}>
                 <React.Suspense fallback={null}>
                   <ambientLight intensity={0.5} />
                   <directionalLight position={[10, 10, 5]} intensity={1} color="#3b82f6" />
                   <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#60a5fa" />
                   <InteractiveBackgroundGeometry />
                 </React.Suspense>
               </Canvas>
             )}
          </div>
       </div>

       {/* Interactive Holographic Console (Better Than iMac Computer!) */}
       <div className="relative z-20 w-[95%] max-w-5xl flex flex-col items-center mt-6">
          
          {/* Hovering Robot Greeting */}
          <div className="absolute -top-32 md:-top-40 right-0 md:-right-8 z-[100] transform scale-[0.6] md:scale-75 origin-bottom-right pointer-events-auto cursor-pointer" onClick={() => setShowGreeting(!showGreeting)}>
             <RobotCompanion />
             <AnimatePresence>
               {showGreeting && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.8, y: 10 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.8, y: 10 }}
                   className="absolute -top-8 right-[70%] bg-white text-gray-900 px-6 py-4 rounded-3xl rounded-br-sm shadow-2xl font-medium min-w-[240px] border border-gray-100 z-[110]"
                   onClick={(e) => e.stopPropagation()}
                 >
                   <div className="mb-1 text-base font-bold">
                     Behold the Hub!
                   </div>
                   <div className="text-sm text-gray-500 font-normal">
                     Use the physical sliders below to warp the core dimensions.
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="w-full bg-[#0F111A] border border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            {/* Glossy top lights */}
            <div className="absolute top-0 left-1/4 w-96 h-20 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute top-0 right-1/4 w-96 h-20 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Interactive 3D Canvas Box (7 Cols) */}
              <div className="lg:col-span-7 bg-[#08090F] border border-slate-900 rounded-3xl relative h-[380px] md:h-[460px] flex items-center justify-center overflow-hidden group">
                
                {/* Visual Status Indicator Overlay */}
                <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-[#0F111A]/90 border border-slate-800 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-md">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest font-black">Spatial Core Active</span>
                </div>

                <div className="absolute top-4 right-4 z-30 flex gap-2">
                  <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-bold">
                    Scale: {synapseScale.toFixed(1)}x
                  </span>
                  <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-bold">
                    Speed: {synapseSpeed.toFixed(1)}x
                  </span>
                </div>

                {/* The 3D Render Element */}
                <div className="absolute inset-0 z-0">
                  {isInView && (
                    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 45 }}>
                      <React.Suspense fallback={null}>
                        <ambientLight intensity={1.2} />
                        <directionalLight position={[5, 5, 5]} intensity={2.5} color={synapseColor} />
                        <directionalLight position={[-5, -5, -5]} intensity={1.5} color="#ffffff" />
                        <DataFlowScene scale={synapseScale} color={synapseColor} speed={synapseSpeed} />
                      </React.Suspense>
                    </Canvas>
                  )}
                </div>

                {/* Mini Calibration Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none border border-slate-900/40 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40"></div>
              </div>

              {/* Right Column: Dynamic Hologram Interface Terminal (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                
                {/* Header info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Orbit className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Cognitive Engine Core</span>
                  </div>
                  <h3 className="text-2xl font-bold font-mono text-white uppercase tracking-tight">Quantum Synapse Console</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Tune the core kinetics. Instantly alter molecular structures, orbital speed limits, and color resonance wavelengths below.
                  </p>
                </div>

                {/* Tabs to switch console display */}
                <div className="flex bg-[#08090F] p-1 border border-slate-900 rounded-xl">
                  <button 
                    onClick={() => setActiveTab('hologram')}
                    className={`flex-1 py-1.5 text-xs font-mono rounded-lg font-bold transition-all ${activeTab === 'hologram' ? 'bg-[#1D2132] text-white border border-slate-800' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Hologram Sliders
                  </button>
                  <button 
                    onClick={() => setActiveTab('console')}
                    className={`flex-1 py-1.5 text-xs font-mono rounded-lg font-bold transition-all ${activeTab === 'console' ? 'bg-[#1D2132] text-white border border-slate-800' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    System Logs
                  </button>
                </div>

                {activeTab === 'hologram' ? (
                  /* Hologram Interface Control Sliders */
                  <div className="space-y-5 bg-[#08090F] p-5 border border-slate-900 rounded-2xl flex-1 flex flex-col justify-center">
                    
                    {/* Slider 1: Core Scale */}
                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                        <span className="uppercase">Quantum Energy Scale</span>
                        <span className="text-blue-400 font-bold">{synapseScale.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2.2" 
                        step="0.1"
                        value={synapseScale}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setSynapseScale(val);
                          addLog(`Quantum Scale configured to ${val.toFixed(1)}x`);
                        }}
                        className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    {/* Slider 2: Orbital speed */}
                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                        <span className="uppercase">Kinetic Rotation Speed</span>
                        <span className="text-blue-400 font-bold">{synapseSpeed.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.2" 
                        max="3.0" 
                        step="0.1"
                        value={synapseSpeed}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setSynapseSpeed(val);
                          addLog(`Rotation speed multiplier mapped to ${val.toFixed(1)}x`);
                        }}
                        className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    {/* Color selection */}
                    <div>
                      <span className="text-xs font-mono text-slate-300 uppercase block mb-2">Core Resonance Hue</span>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { name: 'Azure', value: '#3b82f6' },
                          { name: 'Crimson', value: '#ef4444' },
                          { name: 'Amber', value: '#f59e0b' },
                          { name: 'Emerald', value: '#10b981' }
                        ].map((item) => (
                          <button
                            key={item.value}
                            onClick={() => {
                              setSynapseColor(item.value);
                              addLog(`Core wavelength shifted to ${item.name.toUpperCase()}`);
                            }}
                            className={`py-1 px-1.5 text-[10px] font-mono rounded border text-center font-bold uppercase transition-all ${
                              synapseColor === item.value 
                                ? 'bg-white text-slate-950 border-white' 
                                : 'bg-[#151722] text-slate-400 border-slate-800 hover:border-slate-500'
                            }`}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Live Logs View */
                  <div className="bg-[#08090F] border border-slate-900 p-5 rounded-2xl flex-1 flex flex-col justify-between font-mono text-[10px] text-slate-400">
                    <div className="space-y-1.5 overflow-y-auto max-h-[170px]">
                      {consoleLogs.map((log, idx) => (
                        <div key={idx} className="leading-normal">{log}</div>
                      ))}
                    </div>
                    <div className="text-[9px] text-slate-600 border-t border-slate-900 pt-3 mt-3 flex items-center justify-between">
                      <span>Gateway: AIS_PREVIEW_SECURE</span>
                      <span>Operational Status: LIVE</span>
                    </div>
                  </div>
                )}

                {/* Primary Action Trigger Button */}
                <button 
                  onClick={handlePulseCore}
                  className="w-full py-3.5 bg-white text-slate-950 hover:bg-slate-200 transition-all rounded-xl font-bold font-mono text-xs uppercase flex items-center justify-center gap-2 tracking-wider shadow-lg active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  Emit Resonance Pulse
                </button>

              </div>

            </div>
          </motion.div>
       </div>

    </div>
  );
}

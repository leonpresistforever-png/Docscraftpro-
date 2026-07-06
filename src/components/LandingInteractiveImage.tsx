import React, { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { MousePointer2, Settings, Layers, Code, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { RobotCompanion } from './ui/RobotCompanion';

function DataFlowScene() {
  const group = useRef<any>(null);
  const centerSphere = useRef<any>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.15;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (materialRef.current) {
      // Subtle RGB cycling for the glossy core
      const t = state.clock.elapsedTime * 0.5;
      materialRef.current.color.setHSL(t % 1, 0.8, 0.5);
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[2.5, 0]} />
        <meshStandardMaterial color="#3b82f6" wireframe transparent opacity={0.3} />
      </mesh>
      
      {Array.from({ length: 12 }).map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={1} floatIntensity={2}>
          <mesh position={[
            Math.sin((i / 12) * Math.PI * 2) * 5,
            (Math.random() - 0.5) * 4,
            Math.cos((i / 12) * Math.PI * 2) * 5
          ]}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshPhysicalMaterial 
              color={i % 2 === 0 ? "#10b981" : "#f59e0b"} 
              roughness={0.1} 
              metalness={0.9} 
              clearcoat={1}
              iridescence={0.8}
            />
          </mesh>
        </Float>
      ))}
      <mesh ref={centerSphere} position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshPhysicalMaterial 
          ref={materialRef}
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

function AnimatedPresentation() {
  const [started, setStarted] = useState(false);

  return (
    <div className="absolute inset-0 z-20 overflow-hidden bg-slate-900">
      {/* Light subtle grid/gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>
      
      {!started ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center z-10"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="px-4 py-1 rounded-full bg-blue-500/20 text-blue-300 font-mono text-sm font-bold mb-8 border border-blue-500/30"
            >
              System Analysis
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Data Architecture
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl font-light leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Visualize your complex workflows and data pipelines in a real-time 3D environment.
            </motion.p>
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              onClick={() => setStarted(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-900/50"
            >
              Initialize Engine <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
      ) : (
        <div className="absolute inset-0 z-10">
          <Canvas camera={{ position: [0, 2, 12], fov: 45 }}>
             <React.Suspense fallback={null}>
               <ambientLight intensity={1} />
               <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
               <directionalLight position={[-10, -10, 5]} intensity={1.5} color="#3b82f6" />
               <DataFlowScene />
             </React.Suspense>
          </Canvas>
          
          <div className="absolute bottom-8 left-0 right-0 flex justify-center z-30">
             <button onClick={() => setStarted(false)} className="px-6 py-3 rounded-full bg-slate-800/80 backdrop-blur-md border border-slate-700 text-white font-bold hover:bg-slate-700 transition-colors shadow-lg flex items-center gap-2">
               <ArrowLeft className="w-4 h-4" /> Terminate Session
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InteractiveBackgroundGeometry() {
  const pointsRef = useRef<any>(null);
  
  // Use a particle flow setup
  const count = 3000;
  const { positions, randoms } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Create a large sphere distribution
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
        color="#4facfe" 
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

  useEffect(() => {
    // Auto-hide the greeting after 6 seconds to be less intrusive
    const timer = setTimeout(() => setShowGreeting(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full min-h-[100vh] flex flex-col items-center justify-center overflow-x-hidden bg-white py-24 border-t border-gray-100">
       
       <div className="text-center max-w-3xl mb-16 relative z-30 px-4">
          <h2 className="text-4xl md:text-5xl font-black font-serif text-gray-900 mb-4 tracking-tight">Docscraft Pro</h2>
          <p className="text-xl text-gray-500 bg-white/50 inline-block px-4 py-1 rounded-full backdrop-blur-sm">Collaborate with your team instantly. The screen updates live for everyone.</p>
       </div>

       {/* Real Background Image with Two Persons Sitting */}
       <div className="absolute inset-0 z-0 overflow-hidden bg-gray-50 flex items-center justify-center">
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm pointer-events-none"></div>
          
          <div className="absolute inset-0 opacity-40 z-0">
             {isInView && (
               <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 15], fov: 45 }}>
                 <React.Suspense fallback={null}>
                   <ambientLight intensity={0.5} />
                   <directionalLight position={[10, 10, 5]} intensity={1} color="#4facfe" />
                   <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#00f2fe" />
                   <InteractiveBackgroundGeometry />
                 </React.Suspense>
               </Canvas>
             )}
          </div>
          {/* Removed Collaborative Space text per user request to remove floating text on top and replace with better 3D design */}

       </div>

       {/* The "iMac" Screen Container */}
       <div className="relative z-20 w-[95%] max-w-4xl flex flex-col items-center mt-10 md:mt-24">
          
          {/* Hovering Robot Greeting - Adjusted position and z-index to avoid clipping */}
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
                     Welcome to Docscraft!
                   </div>
                   <div className="text-sm text-gray-500 font-normal">
                     I'm your AI companion. Click around to explore.
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 50, rotateX: 5 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            viewport={{ once: true }}
            className="relative w-full aspect-[16/10] md:aspect-video rounded-t-3xl border-[16px] md:border-[24px] border-[#1a1a1a] shadow-[0_30px_60px_rgba(0,0,0,0.4)] bg-[#2a2b4b] flex flex-col group/imac z-20"
          >
            {/* Webcam dot */}
            <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-black border border-gray-800 z-50"></div>

            {/* Inner Content Wrapper to keep overflow hidden inside the screen */}
            <div className="relative w-full h-full flex flex-col overflow-hidden rounded-sm">
              
              {/* Screen UI - Video Only */}
              <div className="w-full h-full relative bg-black overflow-hidden flex items-center justify-center">
                 <iframe 
                   src="https://drive.google.com/file/d/1ZukrOqNACYHCrq8euKUTayf1u5jvyXvw/preview"
                   className="w-full h-full absolute inset-0 border-0"
                   allow="autoplay; fullscreen"
                 ></iframe>
              </div>
            </div>
          </motion.div>
          {/* iMac Stand */}
          <div className="w-32 h-20 bg-gradient-to-b from-[#b3b3b3] to-[#e6e6e6] shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] z-10 relative perspective-[500px]">
             <div className="absolute bottom-0 w-[200px] h-4 bg-gradient-to-r from-gray-300 via-white to-gray-300 left-1/2 -translate-x-1/2 shadow-xl rounded-t-sm"></div>
          </div>
       </div>

    </div>
  );
}

import React, { useRef, useMemo, useState } from 'react';
import { motion, useInView, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, OrthographicCamera, ContactShadows, MeshDistortMaterial, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { X } from 'lucide-react';

function MathWave() {
  const meshRef = useRef<any>(null);
  
  // Use a math function to generate a flowing ribbon geometry
  const geometry = useMemo(() => new THREE.PlaneGeometry(20, 8, 64, 32), []);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const positions = meshRef.current.geometry.attributes.position;
    
    // Mathematical wave function computation
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // Calculate sign, shape, and frequency
      const wave1 = Math.sin(x * 0.5 + time * 1.5) * 1.5;
      const wave2 = Math.cos(y * 0.5 + time * 1.2) * 1.0;
      const wave3 = Math.sin((x + y) * 0.3 - time) * 0.8;
      
      const z = wave1 + wave2 + wave3;
      positions.setZ(i, z);
    }
    
    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <group position={[0, -2, -5]} rotation={[-Math.PI / 2.2, 0, Math.PI / 6]}>
      {/* Aura / Energy Frequency Layer */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial 
          color="#ffffff" 
          metalness={0.1}
          roughness={0.1}
          transmission={0.95}
          thickness={3}
          ior={1.4}
          clearcoat={1}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Glow Wireframe Layer representing the frequency grid */}
      <mesh geometry={geometry}>
        <meshBasicMaterial 
          color="#4facfe" 
          wireframe 
          transparent 
          opacity={0.15}
        />
      </mesh>
    </group>
  );
}

function RGBCube() {
  const materialRef = useRef<any>(null);
  
  useFrame((state) => {
    if (materialRef.current) {
      const time = state.clock.getElapsedTime();
      // Silky, pastel RGB transition
      const r = Math.sin(time * 0.5) * 0.3 + 0.7;
      const g = Math.sin(time * 0.3 + 2) * 0.3 + 0.7;
      const b = Math.sin(time * 0.4 + 4) * 0.3 + 0.7;
      materialRef.current.color.setRGB(r, g, b);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={[1, 1, 1]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <MeshTransmissionMaterial 
          ref={materialRef}
          backside
          samples={4}
          thickness={0.5}
          chromaticAberration={0.5}
          anisotropy={0.3}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.1}
          transmission={1}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </Float>
  );
}

function FloatingGeometry() {
  const group = useRef<any>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.1;
      group.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <group ref={group}>
      <MathWave />
      
      <RGBCube />

      <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
        <mesh position={[-2, 0.5, -1]}>
          <octahedronGeometry args={[1]} />
          <meshPhysicalMaterial 
            color="#fff" 
            metalness={0.1} 
            roughness={0.2} 
            transmission={0.9} 
            thickness={1} 
            ior={1.5}
          />
        </mesh>
      </Float>

      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={1.2}>
        <mesh position={[1.5, -1.5, 0.5]}>
          <icosahedronGeometry args={[0.8]} />
          <meshPhysicalMaterial 
            color="#00f2fe" 
            metalness={0.2} 
            roughness={0.1} 
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </Float>

      {/* Small floating spheres */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Float key={i} speed={2 + Math.random()} rotationIntensity={2} floatIntensity={2}>
          <mesh 
            position={[
              (Math.random() - 0.5) * 8, 
              (Math.random() - 0.5) * 6, 
              (Math.random() - 0.5) * 4
            ]}
          >
            <sphereGeometry args={[0.15 + Math.random() * 0.15]} />
            <meshStandardMaterial 
              color={Math.random() > 0.5 ? "#4facfe" : "#ffffff"} 
              emissive={Math.random() > 0.8 ? "#4facfe" : "#000000"}
              emissiveIntensity={2}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

const NEXUS_CARDS = [
  {
    id: "ai-autonomy",
    title: "AI Autonomy",
    desc: "Agents that think, plan, and execute tasks independently within the sandbox.",
    delay: 0.1,
    icon: (
      <div className="w-16 h-16 bg-blue-500/10 rounded-2xl mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 backdrop-blur-sm border border-blue-500/20">
         <div className="w-8 h-8 rounded bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
      </div>
    )
  },
  {
    id: "3d-visualization",
    title: "3D Visualization",
    desc: "Immersive spatial interfaces that break the boundaries of flat design.",
    delay: 0.2,
    icon: (
      <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 backdrop-blur-sm border border-cyan-500/20">
         <div className="w-8 h-8 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
      </div>
    )
  },
  {
    id: "seamless-integration",
    title: "Seamless Integration",
    desc: "Connect your entire workflow natively with zero friction.",
    delay: 0.3,
    icon: (
      <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 backdrop-blur-sm border border-indigo-500/20">
         <div className="w-8 h-8 rotate-45 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
      </div>
    )
  }
];

function TiltCardNexus({ card, onClick }: any) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      layoutId={`card-nexus-${card.id}`}
      initial={{ opacity: 0, y: 50, rotateX: -15, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ delay: card.delay, duration: 0.8, type: "spring", bounce: 0.4 }}
      whileHover={{ 
        scale: 1.05, 
        boxShadow: "0px 30px 60px rgba(212, 175, 55, 0.25)"
      }}
      onClick={() => onClick(card.id)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-white/30 backdrop-blur-[16px] p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/60 animate-border-pulse transition-all duration-500 group cursor-pointer relative overflow-hidden"
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
    >
      <div className="absolute top-0 -inset-full h-full block w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-60 animate-sheen pointer-events-none z-10" />
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 via-transparent to-cyan-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
        style={{ transform: "translateZ(-10px)" }}
      />
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-gradient-to-br from-white/60 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100"></div>
      
      <motion.div 
        initial={{ clipPath: 'inset(100% 0 0 0)' }}
        whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
        transition={{ duration: 0.8, delay: card.delay + 0.2, ease: "circOut" }}
      >
        <div style={{ pointerEvents: 'none' }}>
          {card.icon}
        </div>
      </motion.div>
      
      <motion.h3 
        layoutId={`title-nexus-${card.id}`}
        className="text-xl font-bold text-gray-900 mb-2 relative z-10"
        style={{ transform: "translateZ(20px)" }}
      >
        {card.title}
      </motion.h3>
      
      <motion.p 
        layoutId={`desc-nexus-${card.id}`}
        className="text-gray-600 relative z-10 leading-relaxed"
        style={{ transform: "translateZ(30px)" }}
      >
        {card.desc}
      </motion.p>
    </motion.div>
  );
}

export function LandingNexus() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "200px" });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const selectedData = NEXUS_CARDS.find(c => c.id === selectedCardId);

  return (
    <motion.div 
      ref={containerRef} 
      animate={{
        backgroundColor: [
          "#fafafa",
          "#fef7f7",
          "#f7fef7",
          "#f7f7fe",
          "#fafafa"
        ]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="w-full relative overflow-hidden min-h-screen py-24 z-20"
    >
      
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl z-10"></div>
        <motion.div 
          animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.3, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-red-400/40 via-red-300/30 to-transparent blur-[100px]" 
        />
        <motion.div 
          animate={{ opacity: [0.5, 0.8, 0.5], scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-gradient-to-bl from-green-400/40 via-green-300/30 to-transparent blur-[100px]" 
        />
        <motion.div 
          animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-gradient-to-t from-blue-400/40 via-blue-300/30 to-transparent blur-[100px]" 
        />
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute bottom-[-10%] left-[20%] w-[50%] h-[30%] rounded-full bg-cyan-200/30 blur-[120px]" 
        />
        
        {/* Wireframe lines (subtle) */}
        <svg className="absolute w-full h-full opacity-[0.03]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,20 L100,50 M0,80 L100,40 M30,0 L60,100 M70,0 L40,100" stroke="currentColor" strokeWidth="0.1" fill="none" />
        </svg>
      </div>

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-6 relative z-10 h-full flex flex-col">
        
        {/* Header / Nav (Simulated for the section) */}
        <div className="w-full flex items-center justify-between mb-20 md:mb-32">
           <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-xl">A</div>
              <span className="font-black tracking-tight text-xl text-gray-900">AGENT STUDIO</span>
           </div>
           <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
              <a href="#" className="hover:text-blue-500 transition-colors">Services</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Work</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Process</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Insights</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Contact</a>
           </div>
           <div className="flex items-center space-x-4">
             <button className="hidden sm:block p-2 text-gray-600 hover:text-black">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             </button>
             <button className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-105 transition-all">
                GET STARTED
             </button>
           </div>
        </div>

        {/* Hero Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24 relative">
          
          {/* Left Text */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="z-20 pt-10"
          >
            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-sans font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Creating Digital Futures Through Innovative Design
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
              Elevate your brand with stunning 3D experiences, intuitive interfaces, and seamless digital solutions.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="/repositories" className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-8 py-3.5 rounded-full text-lg font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all inline-block">
                Enter Agent Studio
              </a>
              <a href="/services" className="bg-white/50 backdrop-blur-md text-gray-800 border border-gray-200/50 px-8 py-3.5 rounded-full text-lg font-bold shadow-sm hover:shadow-md hover:bg-white/80 transition-all inline-block">
                Our Services
              </a>
              <a href="/work" className="bg-white/50 backdrop-blur-md text-gray-800 border border-gray-200/50 px-8 py-3.5 rounded-full text-lg font-bold shadow-sm hover:shadow-md hover:bg-white/80 transition-all inline-block">
                How It Works
              </a>
              <a href="/agent-studio-contact" className="bg-white/50 backdrop-blur-md text-gray-800 border border-gray-200/50 px-8 py-3.5 rounded-full text-lg font-bold shadow-sm hover:shadow-md hover:bg-white/80 transition-all inline-block">
                Agent Support
              </a>
            </div>
          </motion.div>

          {/* Right 3D Canvas */}
          <div className="absolute right-[-10%] top-[-20%] lg:top-[-40%] w-[120%] lg:w-[140%] h-[600px] lg:h-[900px] pointer-events-none z-10 opacity-80 md:opacity-100">
            {isInView && (
              <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 10], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} />
                <directionalLight position={[-10, -10, -5]} intensity={1} color="#00f2fe" />
                <FloatingGeometry />
                <Environment preset="city" />
                <ContactShadows position={[0, -3.5, 0]} opacity={0.5} scale={20} blur={2} far={10} />
              </Canvas>
            )}
          </div>
        </div>

        {/* Bottom Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-auto z-20">
          {NEXUS_CARDS.map((card) => (
            <TiltCardNexus key={card.id} card={card} onClick={setSelectedCardId} />
          ))}
        </div>

      </div>

      <AnimatePresence>
        {selectedCardId && selectedData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCardId(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm cursor-pointer"
          >
            <motion.div
              layoutId={`card-nexus-${selectedData.id}`}
              className="bg-white/70 backdrop-blur-[24px] w-full max-w-2xl rounded-[3rem] p-12 md:p-16 flex flex-col items-center text-center shadow-[0_50px_100px_rgba(0,0,0,0.2)] border border-white relative cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-8 right-8 w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                onClick={() => setSelectedCardId(null)}
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
              
              <motion.div layoutId={`icon-container-nexus-${selectedData.id}`} className="mb-6 pointer-events-none">
                {selectedData.icon}
              </motion.div>
              
              <motion.h4 layoutId={`title-nexus-${selectedData.id}`} className="text-4xl md:text-5xl font-black text-gray-900 mb-6">{selectedData.title}</motion.h4>
              <motion.p layoutId={`desc-nexus-${selectedData.id}`} className="text-xl text-gray-600 font-medium mb-10 leading-relaxed max-w-lg">
                {selectedData.desc} Discover the limitless possibilities this architecture unlocks for your platform.
              </motion.p>
              
              <div className="flex gap-4">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-colors">Learn More</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

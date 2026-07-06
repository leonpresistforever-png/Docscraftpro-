import React, { useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, OrthographicCamera, ContactShadows, MeshDistortMaterial, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function MathWave() {
  const meshRef = useRef<THREE.Mesh>(null);
  
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
      
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[1, 1, 1]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <MeshTransmissionMaterial 
            backside
            samples={4}
            thickness={0.5}
            chromaticAberration={1}
            anisotropy={0.3}
            distortion={0.1}
            distortionScale={0.5}
            temporalDistortion={0.2}
            color="#4facfe"
          />
        </mesh>
      </Float>

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

export function LandingNexus() {
  return (
    <div className="w-full relative bg-[#F8F9FB] overflow-hidden min-h-screen py-24 z-20">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-cyan-100/40 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[30%] rounded-full bg-indigo-100/30 blur-[120px]"></div>
        
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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-xl">N</div>
              <span className="font-black tracking-tight text-xl text-gray-900">NEXUS</span>
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
              <button className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-8 py-3.5 rounded-full text-lg font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all">
                Explore Services
              </button>
              <button className="bg-white text-gray-800 border border-gray-200 px-8 py-3.5 rounded-full text-lg font-bold shadow-sm hover:shadow-md hover:bg-gray-50 transition-all">
                View Portfolio
              </button>
            </div>
          </motion.div>

          {/* Right 3D Canvas */}
          <div className="absolute right-[-10%] top-[-20%] lg:top-[-40%] w-[120%] lg:w-[140%] h-[600px] lg:h-[900px] pointer-events-none z-10 opacity-80 md:opacity-100">
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 45 }}>
              <ambientLight intensity={1.5} />
              <directionalLight position={[10, 10, 5]} intensity={2} />
              <directionalLight position={[-10, -10, -5]} intensity={1} color="#00f2fe" />
              <FloatingGeometry />
              <Environment preset="city" />
              <ContactShadows position={[0, -3.5, 0]} opacity={0.5} scale={20} blur={2} far={10} />
            </Canvas>
          </div>
        </div>

        {/* Bottom Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-auto z-20">
          {[
            {
              title: "UI/UX Design",
              desc: "Crafting intuitive and engaging user experiences.",
              delay: 0.1,
              icon: (
                <div className="w-16 h-16 bg-blue-100 rounded-2xl mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                   <div className="w-8 h-8 rounded bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                </div>
              )
            },
            {
              title: "3D Visualization",
              desc: "Bringing concepts to life with immersive 3D rendering.",
              delay: 0.2,
              icon: (
                <div className="w-16 h-16 bg-cyan-100 rounded-2xl mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                   <div className="w-8 h-8 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50"></div>
                </div>
              )
            },
            {
              title: "Brand Strategy",
              desc: "Building strong, memorable digital identities.",
              delay: 0.3,
              icon: (
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                   <div className="w-8 h-8 rotate-45 bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
                </div>
              )
            }
          ].map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: card.delay, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-20px_rgba(0,100,255,0.1)] transition-all group cursor-pointer"
            >
              {card.icon}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-gray-500">{card.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}

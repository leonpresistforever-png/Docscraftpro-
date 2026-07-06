import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Home, Building2, PaintBucket, Layers, Compass, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, OrthographicCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function ArchitecturalStructure({ scrollProgress }: { scrollProgress: any }) {
  const group = useRef<any>(null);
  
  const materialConfig = {
    color: '#F4F2EE', // Creamy off-white
    roughness: 0.2,
    metalness: 0.05,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
  };

  const wallMaterial = <meshPhysicalMaterial {...materialConfig} />;
  const stairsMaterial = <meshPhysicalMaterial {...materialConfig} color="#FFFFFF" />;
  const sphereMaterial = <meshPhysicalMaterial color="#FFFFFF" roughness={0.1} metalness={0.1} clearcoat={1} />;
  const glassMaterial = <meshPhysicalMaterial color="#E0F0FF" transmission={0.9} opacity={1} ior={1.5} thickness={0.5} roughness={0} />;

  // Animate based on scroll
  useFrame(() => {
    if (group.current && scrollProgress) {
      const scrollValue = scrollProgress.get();
      // Translate the architecture down as we scroll down to give parallax effect
      group.current.position.y = -2 + (scrollValue * 15);
      // Slightly rotate
      group.current.rotation.y = -Math.PI / 4 + (scrollValue * 0.2);
    }
  });

  return (
    <group ref={group} rotation={[Math.PI / 8, -Math.PI / 4, 0]} position={[0, -2, 0]}>
      {/* Base Platform */}
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 1, 30]} />
        {wallMaterial}
      </mesh>

      {/* Main Vertical Wall */}
      <mesh position={[-4, 8, -8]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 18, 16]} />
        {wallMaterial}
      </mesh>

      {/* Overhanging L-shape platform */}
      <mesh position={[4, 8, 0]} castShadow receiveShadow>
        <boxGeometry args={[16, 1, 8]} />
        {wallMaterial}
      </mesh>
      
      {/* Upper wall on overhang */}
      <mesh position={[10, 12, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 8, 8]} />
        {wallMaterial}
      </mesh>

      {/* Glass Panel */}
      <mesh position={[-3, 10, 3]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 10, 8]} />
        {glassMaterial}
      </mesh>

      {/* Staircase (procedural generation) */}
      <group position={[4, 1, -2]}>
        {Array.from({ length: 16 }).map((_, i) => (
          <mesh key={i} position={[-i * 0.5 + 4, i * 0.35, i * 0.5]} castShadow receiveShadow>
            <boxGeometry args={[5, 0.7, 1.5]} />
            {stairsMaterial}
          </mesh>
        ))}
      </group>

      {/* Curving wall / semi-circle */}
      <mesh position={[7, 8.5, 6]} castShadow receiveShadow rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[4, 4, 1, 64, 1, false, 0, Math.PI]} />
        {wallMaterial}
      </mesh>

      {/* Abstract Spheres floating */}
      <Float speed={2} rotationIntensity={0} floatIntensity={1} position={[10, 2, 8]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1.5, 64, 64]} />
          {sphereMaterial}
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.5} position={[-8, 12, 4]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1, 64, 64]} />
          {sphereMaterial}
        </mesh>
      </Float>

      <Float speed={3} rotationIntensity={0.5} floatIntensity={1.5} position={[0, -2, 10]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[2, 64, 64]} />
          {sphereMaterial}
        </mesh>
      </Float>

      {/* Little accent cubes */}
      <mesh position={[8, 0.5, -8]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        {wallMaterial}
      </mesh>

      <mesh position={[-8, 0.5, 6]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 2]} />
        {wallMaterial}
      </mesh>

    </group>
  );
}

export function LandingModernSpaces() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const cardsY = useTransform(scrollYProgress, [0.3, 0.8], [150, -50]);
  const cardsRotateX = useTransform(scrollYProgress, [0.3, 0.8], [20, 0]);
  const cardsOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);

  return (
    <div ref={containerRef} className="w-full relative z-20 py-20 lg:py-32 bg-[#FDFCF9] overflow-hidden min-h-screen">
      
      {/* 3D Canvas Full Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 2]}>
          <OrthographicCamera makeDefault position={[30, 30, 30]} zoom={22} />
          
          <ambientLight intensity={0.6} />
          <directionalLight 
            castShadow 
            position={[10, 20, 10]} 
            intensity={1.5} 
            color="#FFF5E6" 
            shadow-mapSize={[2048, 2048]} 
            shadow-camera-left={-30} 
            shadow-camera-right={30} 
            shadow-camera-top={30} 
            shadow-camera-bottom={-30} 
          />
          <directionalLight position={[-10, 5, -10]} intensity={0.8} color="#E0F0FF" />
          <directionalLight position={[0, -10, 0]} intensity={0.2} color="#FFFFFF" />
          
          <Environment preset="apartment" />
          
          <ArchitecturalStructure scrollProgress={scrollYProgress} />
          
          <ContactShadows position={[0, -3.5, 0]} opacity={0.5} scale={60} blur={2.5} far={15} color="#8A857D" />
        </Canvas>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
         <div className="flex flex-col mb-40 relative">
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -50, rotateY: -20 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="z-20 relative perspective-[1000px] max-w-2xl bg-white/30 backdrop-blur-3xl p-10 lg:p-14 rounded-[3rem] border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.05)]"
          >
            <h2 className="text-5xl md:text-7xl lg:text-[5.5rem] font-sans font-light tracking-tight leading-[1.05] text-[#1A1A1A] uppercase mb-2">
              MODERN SPACES.
            </h2>
            <h2 className="text-5xl md:text-7xl lg:text-[5.5rem] font-sans font-black tracking-tight leading-[1.05] text-[#1A1A1A] uppercase mb-8 text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-500">
              ENDLESS <br/> POSSIBILITIES.
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 font-medium mb-12 leading-relaxed">
              Crafting immersive architectural visualizations that tell compelling stories.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, rotateX: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/portfolio')}
              className="bg-[#F4F2EE] text-gray-800 px-12 py-5 rounded-full text-lg font-bold shadow-[inset_0_2px_5px_rgba(255,255,255,0.8),0_5px_15px_rgba(0,0,0,0.08)] border border-white/60 hover:bg-white hover:shadow-[0_15px_35px_rgba(0,0,0,0.12)] transition-all transform-style-3d"
            >
              EXPLORE PORTFOLIO
            </motion.button>
          </motion.div>
        </div>

        {/* Feature Cards Bottom - Grid Layout */}
        <motion.div 
          style={{ y: cardsY, rotateX: cardsRotateX, opacity: cardsOpacity }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-30 perspective-[1500px]"
        >
           {[
             { title: "Residential Design", desc: "Elevating living spaces with clarity.", icon: Home, delay: 0.1 },
             { title: "Commercial Space", desc: "Dynamic visualizations for modern businesses.", icon: Building2, delay: 0.2 },
             { title: "Interior Architecture", desc: "Detailing light, texture, and atmosphere.", icon: Layers, delay: 0.3 }
           ].map((card, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 50, rotateX: 20 }}
               whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 0.7, delay: card.delay, type: "spring", stiffness: 100 }}
               whileHover={{ 
                 y: -15, 
                 scale: 1.02,
                 boxShadow: "15px 25px 50px rgba(0,0,0,0.08), -10px -10px 30px rgba(255,255,255,1)" 
               }}
               className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col gap-6 shadow-[10px_10px_30px_rgba(0,0,0,0.04),-5px_-5px_20px_rgba(255,255,255,1)] border border-white/60 group cursor-pointer overflow-hidden relative"
             >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="w-20 h-20 shrink-0 rounded-2xl bg-[#F6F4F0] flex items-center justify-center shadow-inner border border-white group-hover:bg-white group-hover:shadow-[5px_5px_20px_rgba(0,0,0,0.05)] transition-all duration-500 relative z-10">
                   <card.icon className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors duration-500" strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <h4 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-900 transition-colors duration-300">{card.title}</h4>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{card.desc}</p>
                </div>
             </motion.div>
           ))}
        </motion.div>

      </div>
    </div>
  );
}


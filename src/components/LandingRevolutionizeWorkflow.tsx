import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { BarChart3, Share2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShapes({ scrollProgress }: { scrollProgress: any }) {
  const group = useRef<any>(null);
  
  useFrame((state) => {
    if (group.current) {
      const scrollValue = scrollProgress ? scrollProgress.get() : 0;
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2 + (scrollValue * 2);
      group.current.position.y = (scrollValue * -15);
    }
  });

  const materialConfig = {
    color: '#ffffff',
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  };

  return (
    <group ref={group}>
      {/* Main Center Cube with cutout illusion (using torus and cubes) */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1} position={[8, 4, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5, 5, 5]} />
          <meshPhysicalMaterial {...materialConfig} transmission={0.2} ior={1.5} thickness={0.5} />
        </mesh>
        
        {/* Ring orbiting */}
        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[6, 0.2, 16, 100]} />
          <meshStandardMaterial color="#4080ff" emissive="#4080ff" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </Float>

      {/* Top right floating shapes */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2} position={[16, 10, -2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 3, 3]} />
          <meshPhysicalMaterial {...materialConfig} />
        </mesh>
      </Float>
      
      {/* Bottom left sphere */}
      <Float speed={2.5} rotationIntensity={0.2} floatIntensity={1.5} position={[-10, -5, 2]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[4, 64, 64]} />
          <meshPhysicalMaterial {...materialConfig} />
        </mesh>
      </Float>

      {/* Top left cylinder */}
      <Float speed={1.8} rotationIntensity={1.5} floatIntensity={1.2} position={[-8, 12, -4]}>
        <mesh castShadow receiveShadow rotation={[0.5, 0.5, 0]}>
          <cylinderGeometry args={[2, 2, 5, 32]} />
          <meshPhysicalMaterial {...materialConfig} />
        </mesh>
      </Float>
      
      {/* Small floating spheres */}
      <Float speed={3} rotationIntensity={0} floatIntensity={2} position={[10, -8, 4]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[2, 32, 32]} />
          <meshPhysicalMaterial {...materialConfig} />
        </mesh>
      </Float>
      
      <Float speed={2.2} rotationIntensity={1} floatIntensity={1.8} position={[-16, 2, -6]}>
        <mesh castShadow receiveShadow>
          <octahedronGeometry args={[3]} />
          <meshPhysicalMaterial {...materialConfig} />
        </mesh>
      </Float>
    </group>
  );
}

export function LandingRevolutionizeWorkflow() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <div ref={containerRef} className="w-full relative z-20 py-32 lg:py-64 bg-[#FDFBF7] overflow-hidden min-h-screen">
      
      {/* Abstract 3D Canvas Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 2]}>
          <OrthographicCamera makeDefault position={[0, 0, 40]} zoom={15} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" castShadow />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#e6f0ff" />
          <Environment preset="city" />
          <FloatingShapes scrollProgress={scrollYProgress} />
          <ContactShadows position={[0, -20, 0]} opacity={0.4} scale={80} blur={2.5} far={30} color="#8c9bb0" />
        </Canvas>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 gap-16 items-center relative z-10">
        {/* Left Side: Text and Buttons */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col gap-6 max-w-2xl bg-white/40 backdrop-blur-3xl p-10 lg:p-14 rounded-[3rem] border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.05)]"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 text-blue-700 font-semibold text-sm w-fit border border-blue-200/50">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Next-Gen Workspace
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-[5rem] font-sans font-black tracking-tight leading-[1.05] text-[#1A1A1A] uppercase">
            Revolutionize<br />your workflow
          </h2>
          <p className="text-xl text-gray-600 font-medium max-w-xl leading-relaxed">
            Elevate productivity with our intuitive, intelligent platform designed for modern teams.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <button
              onClick={() => navigate('/auth')}
              className="bg-[#2563EB] hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/features')}
              className="bg-white/80 border border-gray-200 shadow-sm text-gray-800 px-8 py-4 rounded-full font-bold hover:border-gray-300 hover:bg-white transition-all backdrop-blur-md"
            >
              Explore Features
            </button>
          </div>
        </motion.div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-32 relative z-30">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h3 className="text-3xl md:text-4xl font-sans font-black text-gray-900 mb-4 uppercase">Features that perform</h3>
          <p className="text-xl text-gray-500 font-medium opacity-0 hidden">Everything you need to work faster, smarter, and together.</p>
        </motion.div>

        <motion.div 
          style={{ 
            y: useTransform(scrollYProgress, [0.4, 0.9], [100, -20]), 
            opacity: useTransform(scrollYProgress, [0.3, 0.5], [0, 1]) 
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative z-30"
        >
          {/* Analytics Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -10 }}
            className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-10 flex flex-col items-center text-center shadow-[0_20px_40px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] border border-white/60 group transition-all duration-300"
          >
            <div className="w-28 h-28 mb-8 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <BarChart3 className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors" strokeWidth={1.5} />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Analytics</h4>
            <p className="text-base text-gray-500 font-medium mb-8 leading-relaxed">
              Elevate productivity with our intuitive, intelligent platform designed for modern teams.
            </p>
            <button className="text-blue-600 font-bold group-hover:text-blue-800 transition-colors mt-auto text-lg">
              Learn More
            </button>
          </motion.div>

          {/* Collaboration Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -10 }}
            className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-10 flex flex-col items-center text-center shadow-[0_20px_40px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] border border-white/60 group transition-all duration-300"
          >
            <div className="w-28 h-28 mb-8 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-inner flex items-center justify-center relative group-hover:scale-110 transition-transform duration-500">
               <Share2 className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors relative z-10" strokeWidth={1.5} />
               <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 w-full h-full rounded-[1.5rem] overflow-hidden">
                 <div className="absolute top-4 right-4 w-3 h-3 bg-blue-400 rounded-full blur-[1px]"></div>
                 <div className="absolute bottom-4 left-4 w-2 h-2 bg-indigo-400 rounded-full blur-[1px]"></div>
               </motion.div>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Collaboration</h4>
            <p className="text-base text-gray-500 font-medium mb-8 leading-relaxed">
              Elevate productivity with our intuitive, intelligent platform designed for modern teams.
            </p>
            <button className="text-blue-600 font-bold group-hover:text-blue-800 transition-colors mt-auto text-lg">
              Learn More
            </button>
          </motion.div>

          {/* Automation Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -10 }}
            className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-10 flex flex-col items-center text-center shadow-[0_20px_40px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] border border-white/60 group transition-all duration-300"
          >
            <div className="w-28 h-28 mb-8 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-inner flex items-center justify-center relative group-hover:scale-110 transition-transform duration-500">
              <Settings className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors relative z-10" strokeWidth={1.5} />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute inset-0 m-auto w-20 h-20 border-2 border-blue-200/60 rounded-full border-dashed"></motion.div>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Automation</h4>
            <p className="text-base text-gray-500 font-medium mb-8 leading-relaxed">
              Elevate productivity with our intuitive, intelligent platform designed for modern teams.
            </p>
            <button className="text-blue-600 font-bold group-hover:text-blue-800 transition-colors mt-auto text-lg">
              Learn More
            </button>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}

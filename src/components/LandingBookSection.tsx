import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Sparkles, Check } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows, PresentationControls, Html } from '@react-three/drei';
import type * as THREE from 'three';

function DiaryModel({ scrollYProgress }: { scrollYProgress: any }) {
  const group = useRef<any>(null);
  
  useFrame((state) => {
    if (group.current) {
      // Keep it straight and subtle float
      group.current.position.y = Math.sin(state.clock.elapsedTime * 1) * 0.05;
    }
  });

  return (
    <group ref={group} rotation={[1.2, 0, 0]}>
      {/* Diary Base */}
      <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.4, 3]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
      
      {/* Pages Layer */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.45, 2.8]} />
        <meshStandardMaterial color="#FFF8DC" roughness={1} />
      </mesh>
      
      {/* Bookmark */}
      <mesh position={[2.0, 0.25, 0]} rotation={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[0.2, 0.02, 3.2]} />
        <meshStandardMaterial color="#B22222" roughness={0.5} />
      </mesh>

      {/* HTML Text Overlay that gets revealed */}
      <Html position={[-1.8, 0.23, -1.2]} rotation={[-Math.PI / 2, 0, 0]} transform scale={0.012}>
        <div className="w-[320px] h-[240px] overflow-hidden">
          <motion.div 
            style={{ 
              clipPath: useTransform(scrollYProgress, [0.2, 0.6], ["polygon(0 0, 0% 0, 0% 100%, 0 100%)", "polygon(0 0, 100% 0, 100% 100%, 0 100%)"]) 
            }} 
            className="w-full h-full"
          >
            <p className="font-serif text-[1rem] text-gray-800 opacity-80 leading-relaxed" style={{ fontFamily: 'Playfair Display, serif' }}>
              Welcome to Docscraft, the creative document writing journey. Write naturally, and watch as your ideas seamlessly organize themselves on the page. Enjoy the freedom of infinite drafting.
Every keystroke feels intentional, every paragraph perfectly aligned. We believe that a pristine workspace leads to brilliant ideas.
Say goodbye to formatting struggles and hello to pure, unadulterated creativity. Your words deserve a beautiful home.
            </p>
          </motion.div>
        </div>
      </Html>
      
      {/* Move PenModel inside DiaryModel so it inherits the book's rotation and coordinates */}
      <PenModel scrollYProgress={scrollYProgress} />
    </group>
  );
}

function PenModel({ scrollYProgress }: { scrollYProgress: any }) {
  const penRef = useRef<any>(null);
  
  useFrame((state) => {
    if (penRef.current) {
      // Simulate writing motion
      const currentScroll = scrollYProgress.get();
      if (currentScroll > 0.2 && currentScroll < 0.6) {
        // Writing active
        const progress = (currentScroll - 0.2) / 0.4; // 0 to 1
        const xPos = -1.5 + (progress * 3); // Move across page
        // Paper is at Z=-1.0, width 280px * 0.012 = 3.3 units. It spans from Z=-1.0 to Z=-1.0 + height?
        // HTML is rotated -90 on X, so Z corresponds to Y in 2D.
        const zPos = -0.5 + Math.sin(progress * 40) * 0.1; // Scribble up and down
        // Pen center Y should be high enough so tip (at -1.2 relative) is at Y=0.25
        penRef.current.position.set(xPos, 1.45, zPos);
        
        penRef.current.rotation.x = -0.5 + Math.sin(state.clock.elapsedTime * 15) * 0.1;
        penRef.current.rotation.z = -0.3 + Math.sin(state.clock.elapsedTime * 20) * 0.1;
      } else if (currentScroll <= 0.2) {
        // Idle before writing
        penRef.current.position.set(-1.8, 2, 1);
        penRef.current.rotation.set(-0.5, 0.5, -0.5);
        penRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.1;
      } else {
        // Idle after writing
        penRef.current.position.set(1.5, 1.5, 0);
        penRef.current.rotation.set(-1, 0, 0);
      }
    }
  });

  return (
    <group ref={penRef} position={[-1, 1, 1]} rotation={[-0.5, 0.5, -0.5]}>
      {/* Main Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.08, 2, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Gold Ring */}
      <mesh position={[0, -0.6, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.085, 0.1, 32]} />
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
      </mesh>
      
      {/* Gold Tip */}
      <mesh position={[0, -1.2, 0]} castShadow>
        <coneGeometry args={[0.08, 0.4, 32]} />
        <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.1} />
      </mesh>
    </group>
  );
}

export function LandingBookSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end start"]
  });

  return (
    <div ref={containerRef} className="py-20 md:py-32 w-full max-w-7xl mx-auto relative flex flex-col items-center selection:bg-amber-600 selection:text-white">
      
      {/* Background Gradient card cover */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7] via-white to-[#F9F7F1] rounded-[4rem] opacity-90 z-0 border border-[#EBE7DD]/40"></div>

      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 gap-16 md:gap-20">
        
        {/* Left Side: Editorial Typography with tracing text hooks */}
        <div className="lg:w-2/5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/50 rounded-full text-xs font-bold uppercase tracking-widest text-amber-800 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} /> Cohesive Workspace
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif text-gray-900 leading-tight">
            A blank canvas <br /> <span className="italic font-light text-amber-600">for your thoughts.</span>
          </h2>
          
          <p className="text-lg text-gray-600 leading-relaxed font-serif">
            Welcome to Docscraft, the creative document writing journey. Write naturally, and watch as your ideas seamlessly organize themselves on the page. Enjoy the freedom of infinite drafting.
Every keystroke feels intentional, every paragraph perfectly aligned. We believe that a pristine workspace leads to brilliant ideas.
Say goodbye to formatting struggles and hello to pure, unadulterated creativity. Your words deserve a beautiful home.
          </p>
        </div>

        {/* Right Side: High Fidelity 3D React-Three-Fiber Setup */}
        <div className="lg:w-3/5 w-full flex flex-col justify-center relative">
           
           <div className="w-full h-[400px] md:h-[500px] relative">
             <Canvas camera={{ position: [0, 5, 5], fov: 45 }} shadows dpr={[1, 2]}>
              <ambientLight intensity={0.6} />
              <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1} castShadow />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              
              <PresentationControls 
                global 
                rotation={[-Math.PI / 6, 0, 0]} 
                polar={[-Math.PI / 4, Math.PI / 4]} 
                azimuth={[-Math.PI / 8, Math.PI / 8]}
                snap
              >
                <DiaryModel scrollYProgress={scrollYProgress} />
              </PresentationControls>

              <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
              <Environment preset="city" />
           </Canvas>
           </div>
        </div>
      </div>
    </div>
  );
}
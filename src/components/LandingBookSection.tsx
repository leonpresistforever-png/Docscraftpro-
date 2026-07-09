import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Sparkles, Check } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows, PresentationControls, Html } from '@react-three/drei';
import type * as THREE from 'three';

function DiaryModel({ scrollYProgress }: { scrollYProgress: any }) {
  const group = useRef<any>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  const fullTitle = "you're most welcome to docscraftpro,";
  const fullText = "explore our service's ⬇️";

  useFrame((state) => {
    if (group.current) {
      // Keep it straight and subtle float
      group.current.position.y = Math.sin(state.clock.elapsedTime * 1) * 0.05;
    }

    const currentScroll = scrollYProgress ? scrollYProgress.get() : 0;
    // Hybrid: timeProgress goes 0 to 1 over 6.0 seconds. 
    // progressVal combines both scroll and time so that the document is NEVER blank.
    const timeProgress = Math.min(1, state.clock.elapsedTime / 6.0);
    const progressVal = Math.max(currentScroll, timeProgress);
    
    // Animate title first (from 0.05 to 0.25)
    if (titleRef.current) {
      if (progressVal < 0.05) {
        titleRef.current.innerText = "";
      } else {
        const progress = Math.min(1, (progressVal - 0.05) / 0.20);
        const charCount = Math.floor(progress * fullTitle.length);
        titleRef.current.innerText = fullTitle.slice(0, charCount);
      }
    }

    // Animate body text (from 0.25 to 0.9)
    if (textRef.current) {
      if (progressVal < 0.25) {
        textRef.current.innerText = "";
      } else {
        const progress = Math.min(1, (progressVal - 0.25) / 0.65);
        const charCount = Math.floor(progress * fullText.length);
        textRef.current.innerText = fullText.slice(0, charCount);
      }
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
      <Html center style={{ pointerEvents: 'none', zIndex: 10 }}>
        <div className="w-[280px] text-center select-none bg-transparent font-serif">
          <h4 ref={titleRef} className="text-2xl font-extrabold text-amber-950 mb-1.5 drop-shadow-sm leading-snug"></h4>
          <p ref={textRef} className="text-[1.05rem] leading-relaxed text-stone-900 font-bold min-h-[70px] drop-shadow-sm whitespace-pre-wrap italic"></p>
          <div className="w-12 h-[1.5px] bg-amber-800/40 mx-auto mt-2"></div>
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
      const currentScroll = scrollYProgress ? scrollYProgress.get() : 0;
      const timeProgress = Math.min(1, state.clock.elapsedTime / 6.0);
      const progressVal = Math.max(currentScroll, timeProgress);

      // Simulate writing motion
      if (progressVal > 0.05 && progressVal < 0.95) {
        // Writing active
        const writePercent = (progressVal - 0.05) / 0.90; // 0 to 1
        const xPos = -1.5 + (writePercent * 3.0); // Move across page
        const zPos = -0.5 + Math.sin(writePercent * 40) * 0.1; // Scribble up and down
        penRef.current.position.set(xPos, 1.45, zPos);
        
        penRef.current.rotation.x = -0.5 + Math.sin(state.clock.elapsedTime * 15) * 0.1;
        penRef.current.rotation.z = -0.3 + Math.sin(state.clock.elapsedTime * 20) * 0.1;
      } else if (progressVal <= 0.05) {
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

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif text-gray-900 leading-tight">
            you're most welcome to <br /> <span className="italic font-light text-amber-600">docscraftpro,</span>
          </h2>
          
          <p className="text-lg text-gray-600 leading-relaxed font-serif">
            explore our service's ⬇️
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
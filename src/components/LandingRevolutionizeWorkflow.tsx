import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { BarChart3, Share2, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShapes({ scrollProgress }: { scrollProgress: any }) {
  const group = useRef<any>(null);
  const cubeMaterialRef = useRef<any>(null);
  
  useFrame((state) => {
    if (group.current) {
      const scrollValue = scrollProgress ? scrollProgress.get() : 0;
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2 + (scrollValue * 2);
      group.current.position.y = (scrollValue * -15);
    }
    
    // Silky smooth RGB shifting for the glass cube
    if (cubeMaterialRef.current) {
      const t = state.clock.elapsedTime * 0.5;
      cubeMaterialRef.current.color.setHSL((t % 1), 0.6, 0.7);
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
          <meshStandardMaterial 
            ref={cubeMaterialRef}
            roughness={0.05}
            metalness={0.1}
          />
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
          <meshStandardMaterial {...materialConfig} />
        </mesh>
      </Float>
      
      {/* Bottom left sphere */}
      <Float speed={2.5} rotationIntensity={0.2} floatIntensity={1.5} position={[-10, -5, 2]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[4, 64, 64]} />
          <meshStandardMaterial {...materialConfig} />
        </mesh>
      </Float>

      {/* Top left cylinder */}
      <Float speed={1.8} rotationIntensity={1.5} floatIntensity={1.2} position={[-8, 12, -4]}>
        <mesh castShadow receiveShadow rotation={[0.5, 0.5, 0]}>
          <cylinderGeometry args={[2, 2, 5, 32]} />
          <meshStandardMaterial {...materialConfig} />
        </mesh>
      </Float>
      
      {/* Small floating spheres */}
      <Float speed={3} rotationIntensity={0} floatIntensity={2} position={[10, -8, 4]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial {...materialConfig} />
        </mesh>
      </Float>
      
      <Float speed={2.2} rotationIntensity={1} floatIntensity={1.8} position={[-16, 2, -6]}>
        <mesh castShadow receiveShadow>
          <octahedronGeometry args={[3]} />
          <meshStandardMaterial {...materialConfig} />
        </mesh>
      </Float>
    </group>
  );
}

const CARDS = [
  { id: 'analytics', title: 'Analytics', icon: BarChart3, desc: 'Elevate productivity with our intuitive, intelligent platform designed for modern teams.' },
  { id: 'collaboration', title: 'Collaboration', icon: Share2, desc: 'Elevate productivity with our intuitive, intelligent platform designed for modern teams.' },
  { id: 'automation', title: 'Automation', icon: Settings, desc: 'Elevate productivity with our intuitive, intelligent platform designed for modern teams.' },
];

function TiltCard({ card, onClick, delay }: any) {
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

  const Icon = card.icon;

  return (
    <motion.div
      layoutId={`card-${card.id}`}
      initial={{ opacity: 0, y: 50, rotateX: 10, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.8, delay, type: "spring", bounce: 0.4 }}
      whileHover={{ 
        scale: 1.03, 
        boxShadow: "0px 30px 60px rgba(212, 175, 55, 0.25)"
      }}
      onClick={() => onClick(card.id)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-white/30 backdrop-blur-[16px] rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/60 animate-border-pulse group transition-colors duration-500 overflow-hidden relative cursor-pointer"
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
    >
      <div className="absolute top-0 -inset-full h-full block z-20 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-60 animate-sheen pointer-events-none" />
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-blue-200/20 via-white/10 to-cyan-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
        style={{ transform: "translateZ(-10px)" }}
      />
      
      <motion.div 
        initial={{ clipPath: 'inset(100% 0 0 0)' }}
        whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
        transition={{ duration: 0.8, delay: delay + 0.1, ease: "circOut" }}
        className="w-28 h-28 mb-8 rounded-[1.5rem] bg-gradient-to-br from-white/80 to-blue-50/50 shadow-[0_8px_20px_rgba(37,99,235,0.1)] flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_15px_30px_rgba(37,99,235,0.2)] transition-all duration-500 relative z-10 border border-white"
      >
        <Icon className="w-12 h-12 text-blue-600 group-hover:text-blue-700 transition-colors" strokeWidth={1.5} />
      </motion.div>
      
      <motion.h4 layoutId={`title-${card.id}`} className="text-2xl font-black text-gray-900 mb-4 group-hover:text-blue-700 transition-colors relative z-10" style={{ transform: "translateZ(20px)" }}>{card.title}</motion.h4>
      <motion.p layoutId={`desc-${card.id}`} className="text-base text-gray-600 font-medium mb-8 leading-relaxed relative z-10" style={{ transform: "translateZ(30px)" }}>
        {card.desc}
      </motion.p>
      <motion.button className="bg-blue-600 text-white font-bold group-hover:bg-blue-700 transition-colors mt-auto px-6 py-2 rounded-full shadow-md hover:shadow-lg relative z-10" style={{ transform: "translateZ(40px)" }}>
        Learn More
      </motion.button>
    </motion.div>
  );
}

export function LandingRevolutionizeWorkflow() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "200px" });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (selectedCard) setSelectedCard(null);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedCard]);

  const selectedData = CARDS.find(c => c.id === selectedCard);

  return (
    <div ref={containerRef} className="w-full relative z-20 py-32 lg:py-64 bg-[#FDFBF7] overflow-hidden min-h-screen">
      
      {/* Abstract 3D Canvas Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {isInView && (
          <Canvas dpr={[1, 1.5]}>
            <OrthographicCamera makeDefault position={[0, 0, 40]} zoom={15} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" castShadow />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#e6f0ff" />
            <Environment preset="city" />
            <FloatingShapes scrollProgress={scrollYProgress} />
            <ContactShadows position={[0, -20, 0]} opacity={0.4} scale={80} blur={2.5} far={30} color="#8c9bb0" />
          </Canvas>
        )}
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
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative z-30 perspective-[1000px]"
        >
          {CARDS.map((card, i) => (
            <TiltCard key={card.id} card={card} delay={0.1 + i * 0.1} onClick={setSelectedCard} />
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedCard && selectedData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm cursor-pointer"
          >
            <motion.div
              layoutId={`card-${selectedData.id}`}
              className="bg-white/70 backdrop-blur-[24px] w-full max-w-2xl rounded-[3rem] p-12 md:p-16 flex flex-col items-center text-center shadow-[0_50px_100px_rgba(0,0,0,0.2)] border border-white relative cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-8 right-8 w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                onClick={() => setSelectedCard(null)}
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
              
              <motion.div layoutId={`icon-container-${selectedData.id}`} className="w-32 h-32 mb-10 rounded-[2rem] bg-gradient-to-br from-white to-blue-50/80 shadow-[0_15px_30px_rgba(37,99,235,0.15)] flex items-center justify-center border border-white">
                <selectedData.icon className="w-16 h-16 text-blue-600" strokeWidth={1.5} />
              </motion.div>
              
              <motion.h4 layoutId={`title-${selectedData.id}`} className="text-4xl md:text-5xl font-black text-gray-900 mb-6">{selectedData.title}</motion.h4>
              <motion.p layoutId={`desc-${selectedData.id}`} className="text-xl text-gray-600 font-medium mb-10 leading-relaxed max-w-lg">
                {selectedData.desc} Dive deeper into how this feature transforms your daily operations and unleashes team potential.
              </motion.p>
              
              <div className="flex gap-4">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-colors">Start Using {selectedData.title}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

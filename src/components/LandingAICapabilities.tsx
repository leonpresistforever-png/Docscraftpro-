import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, Image as ImageIcon, Search, ScanSearch, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls, Environment, MeshTransmissionMaterial } from '@react-three/drei';
import type * as THREE from 'three';
import { Color } from 'three';

// Unique 3D Objects for each card
function Brain3D({ color }: { color: string }) {
  const meshRef = useRef<any>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });
  return (
    <group ref={meshRef}>
      {/* Document stack */}
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.4, 2, 1]}>
        <planeGeometry args={[1, 1]} />
        <MeshTransmissionMaterial thickness={0.2} roughness={0.1} transmission={0.9} ior={1.2} color={color} />
      </mesh>
      <mesh position={[0.1, 0, 0.1]} rotation={[-Math.PI / 2, 0, 0.1]} scale={[1.3, 1.9, 1]}>
        <planeGeometry args={[1, 1]} />
        <MeshTransmissionMaterial thickness={0.1} roughness={0.2} transmission={0.8} color="#ffffff" />
      </mesh>
      <mesh position={[-0.1, 0.2, -0.1]} rotation={[-Math.PI / 2, 0, -0.1]} scale={[1.3, 1.9, 1]}>
        <planeGeometry args={[1, 1]} />
        <MeshTransmissionMaterial thickness={0.1} roughness={0.2} transmission={0.9} color={color} />
      </mesh>
    </group>
  );
}

function Sphere3D({ color }: { color: string }) {
  const meshRef = useRef<any>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });
  return (
    <group ref={meshRef}>
      <mesh position={[0, 0, 0]} scale={[1.5, 2, 0.1]}>
        <boxGeometry args={[1, 1, 1]} />
        <MeshTransmissionMaterial thickness={0.5} roughness={0.1} transmission={0.95} ior={1.3} color={color} clearcoat={1} />
      </mesh>
      <mesh position={[0.5, -0.5, 0.2]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 16]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Lens3D({ color }: { color: string }) {
  const groupRef = useRef<any>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime) * 0.3;
      groupRef.current.position.y = Math.cos(state.clock.elapsedTime) * 0.3;
    }
  });
  return (
    <group>
      <mesh position={[0, 0, -0.5]} scale={[1.5, 2, 0.1]}>
        <boxGeometry args={[1, 1, 1]} />
        <MeshTransmissionMaterial thickness={0.2} transmission={0.8} color="#4b5563" />
      </mesh>
      <group ref={groupRef} position={[0, 0, 0.2]}>
        <mesh>
          <torusGeometry args={[0.4, 0.05, 16, 64]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.05, 32]} />
          <MeshTransmissionMaterial thickness={1} transmission={1} ior={1.5} color={color} />
        </mesh>
        <mesh position={[0.4, -0.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

function Scan3D({ color }: { color: string }) {
  const scanLineRef = useRef<any>(null);
  useFrame((state) => {
    if (scanLineRef.current) {
      scanLineRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.8;
    }
  });
  return (
    <group>
      <mesh position={[0, 0, 0]} scale={[1.4, 1.8, 0.05]}>
        <boxGeometry args={[1, 1, 1]} />
        <MeshTransmissionMaterial thickness={0.3} transmission={0.9} color="#374151" />
      </mesh>
      <mesh position={[0, 0, 0.03]} scale={[1.3, 1.7, 0.01]}>
        <planeGeometry args={[1, 1, 10, 10]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
      </mesh>
      <mesh ref={scanLineRef} position={[0, 0, 0.1]} scale={[1.5, 0.02, 0.02]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function Magic3D({ color }: { color: string }) {
  const groupRef = useRef<any>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });
  return (
    <group ref={groupRef}>
      <mesh scale={[1.2, 1.6, 0.1]}>
        <boxGeometry args={[1, 1, 1, 4, 4, 1]} />
        <MeshTransmissionMaterial thickness={0.5} transmission={1} ior={1.3} color={color} distortion={0.5} temporalDistortion={0.2} />
      </mesh>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5)]} scale={0.05}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

function EnergyWave3D() {
  const meshRef = useRef<any>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    uniform float uTime;
    void main() {
      vUv = uv;
      vec3 pos = position;
      float wave = sin(pos.x * 5.0 + uTime * 2.0) * 0.2;
      wave += sin(pos.y * 3.0 + uTime * 1.5) * 0.15;
      pos.z += wave;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform float uTime;
    void main() {
      vec3 color1 = vec3(0.2, 0.4, 1.0); 
      vec3 color2 = vec3(0.8, 0.2, 1.0); 
      vec3 color3 = vec3(1.0, 0.8, 0.2); 
      
      float mix1 = sin(vUv.x * 10.0 + uTime) * 0.5 + 0.5;
      float mix2 = cos(vUv.y * 8.0 - uTime) * 0.5 + 0.5;
      
      vec3 finalColor = mix(color1, color2, mix1);
      finalColor = mix(finalColor, color3, mix2 * 0.5);
      
      float dist = distance(vUv, vec2(0.5));
      float alpha = smoothstep(0.5, 0.0, dist);
      
      gl_FragColor = vec4(finalColor, alpha * 0.8);
    }
  `;

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 4, 0, 0]} scale={[14, 4, 1]}>
      <planeGeometry args={[1, 1, 128, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        transparent={true}
        blending={2} // THREE.AdditiveBlending
        depthWrite={false}
        side={2} // THREE.DoubleSide}
      />
    </mesh>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function LandingAICapabilities() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full overflow-hidden bg-zinc-950 py-32 border-t border-white/5">
       <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-bl from-purple-500/20 to-transparent blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
       <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-gradient-to-tr from-amber-500/20 to-transparent blur-3xl rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3"></div>
       
       <div className="absolute top-0 left-0 w-full h-[400px] pointer-events-none opacity-80 mix-blend-screen">
         <Canvas camera={{ position: [0, 0, 3] }} dpr={[1, 2]}>
           <EnergyWave3D />
         </Canvas>
       </div>

       <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
         
         <motion.div 
           initial="hidden" 
           whileInView="visible" 
           viewport={{ once: true, margin: "-100px" }}
           variants={cardVariants}
           className="text-center max-w-3xl mb-24"
         >
            <h2 className="text-5xl font-black font-serif text-white mb-6 tracking-tight drop-shadow-lg">Intelligence at your fingertips.</h2>
            <p className="text-xl text-gray-400">Docscraft isn't just an editor. It brings bleeding-edge AI models directly into your workflow with highly interactive 3D elements.</p>
         </motion.div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full mb-32">
            
            {/* Feature 1: High Thinking Mode */}
            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: false, amount: 0.1, margin: "-50px" }}
               variants={cardVariants}
               whileHover={{ y: -10 }}
               className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col items-start group relative overflow-hidden"
            >
               {/* 3D Background Element */}
               <div className="absolute top-0 right-0 w-64 h-64 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none translate-x-12 -translate-y-12">
                  <Canvas>
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[2, 2, 2]} intensity={2} />
                    <Environment preset="city" />
                    <PresentationControls global rotation={[0, 0, 0]} polar={[-0.4, 0.2]} azimuth={[-0.4, 0.2]}>
                      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                        <Brain3D color="#d8b4fe" />
                      </Float>
                    </PresentationControls>
                  </Canvas>
               </div>

               <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-400/30 group-hover:bg-purple-500/40 transition-colors duration-300 relative z-10 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <BrainCircuit className="w-7 h-7 text-purple-300 group-hover:text-white transition-colors" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-3 relative z-10">PDF Merger</h3>
               <p className="text-gray-400 flex-1 leading-relaxed relative z-10 font-medium">
                 Merge multiple PDFs side-by-side. The AI will extract, rewrite, and format the combined context of all documents into a single, cohesive PDF file.
               </p>
            </motion.div>

            {/* Feature 2: Unreal Image Gen */}
            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: false, amount: 0.1, margin: "-50px" }}
               variants={cardVariants}
               whileHover={{ y: -10 }}
               className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col items-start group relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-64 h-64 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none translate-x-12 -translate-y-12">
                  <Canvas>
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[2, 2, 2]} intensity={2} />
                    <Environment preset="city" />
                    <PresentationControls global rotation={[0, 0, 0]} polar={[-0.4, 0.2]} azimuth={[-0.4, 0.2]}>
                      <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.2}>
                        <Sphere3D color="#fcd34d" />
                      </Float>
                    </PresentationControls>
                  </Canvas>
               </div>

               <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 border border-amber-400/30 group-hover:bg-amber-500/40 transition-colors duration-300 relative z-10 backdrop-blur-md shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                  <ImageIcon className="w-7 h-7 text-amber-300 group-hover:text-white transition-colors" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Agent Studio</h3>
               <p className="text-gray-400 flex-1 leading-relaxed relative z-10 font-medium">
                 An autonomous resource provisioning engine that dynamically configures files, builds custom packages, and deploys high-fidelity web integrations.
               </p>
            </motion.div>

            {/* Feature 3: Live Search Grounding */}
            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: false, amount: 0.1, margin: "-50px" }}
               variants={cardVariants}
               whileHover={{ y: -10 }}
               className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col items-start group relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-64 h-64 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none translate-x-12 -translate-y-12">
                  <Canvas>
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[2, 2, 2]} intensity={2} />
                    <Environment preset="city" />
                    <PresentationControls global rotation={[0, 0, 0]} polar={[-0.4, 0.2]} azimuth={[-0.4, 0.2]}>
                      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
                        <Lens3D color="#93c5fd" />
                      </Float>
                    </PresentationControls>
                  </Canvas>
               </div>

               <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-400/30 group-hover:bg-blue-500/40 transition-colors duration-300 relative z-10 backdrop-blur-md shadow-[0_0_15px_rgba(96,165,250,0.3)]">
                  <Search className="w-7 h-7 text-blue-300 group-hover:text-white transition-colors" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Real-Time Syncing</h3>
               <p className="text-gray-400 flex-1 leading-relaxed relative z-10 font-medium">
                 Your changes sync instantly across all devices. No need to reload or refresh. Write simultaneously with your peers without stepping on each other's toes.
               </p>
            </motion.div>

            {/* Feature 4: Image Understanding */}
            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: false, amount: 0.1, margin: "-50px" }}
               variants={cardVariants}
               whileHover={{ y: -10 }}
               className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col items-start group lg:col-span-1 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-64 h-64 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none translate-x-12 -translate-y-12">
                  <Canvas>
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[2, 2, 2]} intensity={2} />
                    <Environment preset="city" />
                    <PresentationControls global rotation={[0, 0, 0]} polar={[-0.4, 0.2]} azimuth={[-0.4, 0.2]}>
                      <Float speed={3} rotationIntensity={0.8} floatIntensity={1.5}>
                        <Scan3D color="#fda4af" />
                      </Float>
                    </PresentationControls>
                  </Canvas>
               </div>

               <div className="w-14 h-14 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-6 border border-rose-400/30 group-hover:bg-rose-500/40 transition-colors duration-300 relative z-10 backdrop-blur-md shadow-[0_0_15px_rgba(251,113,133,0.3)]">
                  <ScanSearch className="w-7 h-7 text-rose-300 group-hover:text-white transition-colors" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Intelligent Architecture</h3>
               <p className="text-gray-400 flex-1 leading-relaxed relative z-10 font-medium">
                 From Mermaid diagram support to powerful rich text structures. Docscraft intelligently adapts its layouts for code blocks and media without breaking formatting.
               </p>
            </motion.div>

            {/* Feature 5 (Wide): Magic Edit */}
            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: false, amount: 0.1, margin: "-50px" }}
               variants={cardVariants}
               whileHover={{ y: -10 }}
               onClick={() => navigate('/repositories')}
               className="bg-white/10 backdrop-blur-3xl rounded-3xl p-10 border border-white/20 shadow-2xl flex flex-col md:flex-row items-center gap-10 group lg:col-span-2 overflow-hidden relative cursor-pointer"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-indigo-500/10 mix-blend-overlay"></div>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
               
               <div className="flex-1 relative z-10 w-full">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 border border-emerald-400/30 backdrop-blur-md shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                     <Wand2 className="w-7 h-7 text-emerald-300" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Enterprise Grade Sandboxing</h3>
                  <p className="text-gray-300 leading-relaxed text-lg mb-6 font-medium">
                    Test code, embed APIs, and run full backend instances securely right from your documentation. Docscraft integrates seamlessly with AI agent systems.
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/repositories'); }}
                    className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 hover:bg-emerald-400 transition-all"
                  >
                     Explore Workspaces
                  </button>
               </div>
            </motion.div>

         </div>
       </div>
    </div>
  );
}

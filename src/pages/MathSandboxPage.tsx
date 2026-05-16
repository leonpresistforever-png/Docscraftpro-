import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Send } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'motion/react';

const DEFAULT_MATH = `f(x) = \\int_{-\\infty}^\\infty \\hat f(\\xi)\\,e^{2 \\pi i \\xi x} \\,d\\xi`;

function Math3DBackground() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.2;
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={ref}>
      <Float speed={2} rotationIntensity={2} floatIntensity={2}>
        <mesh position={[-2, 0, -2]}>
          <icosahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#8b5cf6" wireframe transparent opacity={0.3} />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.5}>
        <mesh position={[2, 1, -3]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#ec4899" wireframe transparent opacity={0.3} />
        </mesh>
      </Float>
    </group>
  );
}

export function MathSandboxPage() {
  const [katexInput, setKatexInput] = useState(DEFAULT_MATH);
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gray-900 flex flex-col font-sans relative overflow-hidden">
      {/* 3D Background behind the whole page */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Math3DBackground />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      <div className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/doc/${id}/summarize`)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h1 className="text-lg font-bold text-white tracking-tight">Math & Logic Sandbox</h1>
          </div>
        </div>
        
        <button
          onClick={() => {
             localStorage.setItem('pending_math_element', katexInput);
             navigate(`/doc/${id}`);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
          Implement to Docs
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 z-10 relative">
        {/* Left Pane: Editor */}
        <div className="flex-[0.8] bg-gray-950 border border-gray-800 rounded-2xl p-4 flex flex-col shadow-xl">
          <div className="text-xs font-mono text-gray-400 mb-3 uppercase tracking-wider flex items-center justify-between">
            <span>KaTeX Source</span>
          </div>
          <textarea
            className="flex-1 w-full bg-transparent text-gray-300 font-mono text-base resize-none focus:outline-none focus:ring-0 leading-relaxed"
            value={katexInput}
            onChange={(e) => setKatexInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Right Pane: Live Preview */}
        <div className="flex-[1.2] bg-white/5 backdrop-blur-sm border border-gray-800/80 rounded-2xl p-8 flex flex-col shadow-xl relative overflow-hidden">
          <div className="absolute top-4 left-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Live Render</div>
          <div className="flex-1 flex flex-col items-center justify-center overflow-auto text-white text-4xl">
            <BlockMath math={katexInput} errorColor={'#ef4444'} />
          </div>
        </div>
      </div>
    </div>
  );
}

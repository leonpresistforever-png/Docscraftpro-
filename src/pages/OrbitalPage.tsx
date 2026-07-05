import React from 'react';
import { LandingRevolutionizeWorkflow } from '../components/LandingRevolutionizeWorkflow';
import { useNavigate } from 'react-router-dom';

export default function OrbitalPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FDFBF7] w-full">
      {/* Top Navbar specifically for Orbital */}
      <div className="absolute top-0 left-0 w-full z-50 px-8 py-6 flex items-center justify-between">
        <div className="text-xl font-black tracking-tight cursor-pointer" onClick={() => navigate('/')}>ORBITAL</div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700">
          <a href="#" className="hover:text-black">Home</a>
          <a href="#" className="hover:text-black">Features</a>
          <a href="#" className="hover:text-black">Pricing</a>
          <a href="#" className="hover:text-black">About</a>
          <a href="#" className="hover:text-black">Login</a>
        </div>
        <button className="hidden md:block bg-[#0f172a] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-black transition-colors shadow-lg">
          GET STARTED
        </button>
      </div>

      <div className="absolute top-6 left-6 z-50 md:hidden">
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-white rounded-full shadow hover:shadow-md font-medium text-sm border border-gray-100 transition-all">
          &larr; Back to Home
        </button>
      </div>

      <LandingRevolutionizeWorkflow />
    </div>
  );
}

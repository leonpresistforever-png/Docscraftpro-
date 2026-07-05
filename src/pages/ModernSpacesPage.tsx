import React from 'react';
import { LandingModernSpaces } from '../components/LandingModernSpaces';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function ModernSpacesPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FDFCF9] w-full">
      <div className="absolute top-6 left-6 z-50">
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-white rounded-full shadow hover:shadow-md font-medium text-sm border border-gray-100 transition-all">
          &larr; Back to Home
        </button>
      </div>
      <LandingModernSpaces />
    </div>
  );
}

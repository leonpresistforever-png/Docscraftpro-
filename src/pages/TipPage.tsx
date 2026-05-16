import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Coffee, Shield, CheckCircle2, Sparkles, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const tipAmounts = [
  { value: 0.3, label: '$0.30', icon: Coffee },
  { value: 1, label: '$1', icon: Coffee },
  { value: 3, label: '$3', icon: Heart },
  { value: 5, label: '$5', icon: Heart },
  { value: 10, label: '$10', icon: Sparkles },
  { value: 20, label: '$20', icon: Sparkles },
  { value: 50, label: '$50', icon: Shield },
];

export function TipPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  
  const btcAddress = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"; // dummy BTC address for mock payment

  const getPaymentUrl = () => {
    if (!selectedAmount) return "";
    return `bitcoin:${btcAddress}?amount=${selectedAmount / 60000}`; // simple mock
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-dc-text pt-24 overflow-hidden flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[800px] mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          className="text-center mb-12 w-full"
        >
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold uppercase tracking-widest mb-6">
            <Heart className="w-4 h-4" /> Support the Project
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-[1.1]">
            Tip Jar
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-[600px] mx-auto leading-relaxed">
            Tips simply help support the servers. Choose an amount below to generate a payment QR code.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-2xl bg-white rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EAE6DF]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key="payment-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {tipAmounts.map((amount) => {
                  const Icon = amount.icon;
                  const isSelected = selectedAmount === amount.value;
                  return (
                    <button
                      key={amount.value}
                      onClick={() => setSelectedAmount(amount.value)}
                      className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 ${isSelected ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-[#EAE6DF] hover:border-indigo-300 hover:bg-gray-50'}`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-indigo-600">
                          <CheckCircle2 className="w-5 h-5 fill-indigo-100" />
                        </div>
                      )}
                      <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className={`text-xl font-black ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                        {amount.label}
                      </span>
                    </button>
                  );
                })}
              </motion.div>

              <motion.div variants={itemVariants} className="mb-8 p-4 border border-gray-200 rounded-xl bg-gray-50 flex items-center gap-4">
                 <span className="font-semibold text-gray-700 whitespace-nowrap">Custom Amount:</span>
                 <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                      value={selectedAmount && !tipAmounts.find(t => t.value === selectedAmount) ? selectedAmount : ''}
                      onChange={(e) => setSelectedAmount(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                 </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-6 border-t border-[#EAE6DF] flex flex-col items-center">
                {selectedAmount ? (
                  <div className="flex flex-col items-center w-full animation-fade-in">
                    <div className="bg-white p-4 rounded-2xl border-2 border-indigo-100 shadow-sm mb-6">
                      <QRCodeSVG 
                        value={getPaymentUrl()} 
                        size={200}
                        level="H"
                        includeMargin={true}
                        fgColor="#1a1a1a"
                      />
                    </div>
                    <p className="text-gray-600 mb-4 text-center font-medium">Scan QR code to send tip.</p>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center gap-3 py-5 rounded-xl font-bold text-lg transition-all bg-gray-100 text-gray-400 border-2 border-transparent">
                    <QrCode className="w-6 h-6" />
                    Select an Amount
                  </div>
                )}
                
                <p className="text-center text-sm text-gray-500 mt-6 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" /> Secure QR Mock Payment
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}

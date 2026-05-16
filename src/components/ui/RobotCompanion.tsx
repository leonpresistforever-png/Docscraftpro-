import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'motion/react';

export function RobotCompanion({ isActionTriggered, onFlipComplete }: { isActionTriggered?: boolean, onFlipComplete?: () => void }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [robotMode, setRobotMode] = useState<'sad' | 'smashing' | 'cheering'>('sad');
  
  const leftArmControls = useAnimation();
  const rightArmControls = useAnimation();
  const wrapperControls = useAnimation();

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      if ('touches' in e) {
        if (e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else return;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const x = (clientX / window.innerWidth) * 2 - 1;
      const y = (clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
    };
  }, []);

  // Sequence for Smash -> Flip -> Cheer
  useEffect(() => {
    if (isActionTriggered) {
      async function runAnim() {
        setRobotMode('smashing');
        
        // Wind up the smash - arms go high up
        await Promise.all([
          leftArmControls.start({ rotateZ: -160, transition: { duration: 0.3, ease: "easeOut" } }),
          rightArmControls.start({ rotateZ: 160, transition: { duration: 0.3, ease: "easeOut" } })
        ]);
        
        // Smaaaash down! Hard slam onto the button!
        Promise.all([
          leftArmControls.start({ rotateZ: 20, transition: { type: "spring", stiffness: 400, damping: 10 } }),
          rightArmControls.start({ rotateZ: -20, transition: { type: "spring", stiffness: 400, damping: 10 } })
        ]);
        
        // Body slam visual
        await wrapperControls.start({ y: 40, scaleY: 0.8, transition: { duration: 0.1 } });
        wrapperControls.start({ y: 0, scaleY: 1, transition: { type: "spring", stiffness: 300 } });
        
        // Give time for flip to happen (360 degrees takes a while)
        setTimeout(() => {
           setRobotMode('cheering');
           if (onFlipComplete) setTimeout(() => onFlipComplete(), 1400); // Route after cheer
        }, 600); 
      }
      runAnim();
    }
  }, [isActionTriggered, leftArmControls, rightArmControls, wrapperControls, onFlipComplete]);

  // State-driven poses
  const headRotateX = robotMode === 'sad' ? 15 - mousePosition.y * 5 : -mousePosition.y * 10;
  const headRotateY = mousePosition.x * 15;
  const headTilt = robotMode === 'sad' ? -15 : 0;
  const leftArmRaise = robotMode === 'sad' ? 25 : (robotMode === 'cheering' ? -150 : 25);
  
  // Right arm rests hard left leaning on the massive button when sad (-110deg)
  const rightArmRaise = robotMode === 'sad' ? -110 : (robotMode === 'cheering' ? 150 : -25);
  
  // Arm tracking mix (only track cursor subtly if not smashing, disable partially when sad to keep his arm on the button)
  const dynamicRightArm = robotMode === 'sad' ? { rotateZ: rightArmRaise - (mousePosition.y * 5) } : { rotateZ: rightArmRaise - (mousePosition.y * 20) };
  const dynamicLeftArm = robotMode === 'sad' ? { rotateZ: leftArmRaise + (mousePosition.y * 10) } : { rotateZ: leftArmRaise + (mousePosition.y * 20) };

  return (
    <motion.div 
      whileHover={robotMode !== 'smashing' ? { scale: 1.05, rotateY: 10, rotateX: -5 } : {}}
      animate={wrapperControls}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative w-56 h-56 drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)] z-20 cursor-grab"
      style={{ perspective: "1000px" }}
    >
      {/* Main Wrapper (breathing sighing idle for sad) */}
      <motion.div 
        animate={robotMode === 'sad' ? { y: [0, 8, 0] } : (robotMode === 'cheering' ? { y: [-20, 10, -20] } : { y: 0 })}
        transition={{ duration: robotMode === 'sad' ? 4 : 0.6, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center justify-end h-full [transform-style:preserve-3d]"
      >
        {/* Head */}
        <motion.div 
          className="w-36 h-[6rem] bg-gradient-to-br from-white to-[#E8E8E8] rounded-[3rem] border-[3px] border-[#F4E091] shadow-[0_5px_15px_rgba(212,175,55,0.2)] relative z-20 flex flex-col items-center justify-center overflow-hidden [transform-style:preserve-3d]"
          animate={{ rotateX: -headRotateX, rotateY: headRotateY, rotateZ: headTilt }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
        >
           {/* Eyes Container */}
           <div className="flex gap-6 mb-1 mt-2">
             <motion.div 
               className="w-6 h-7 bg-[#1A1A1A] rounded-full overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center"
               animate={{ 
                 x: mousePosition.x * 3, 
                 y: mousePosition.y * 3,
                 scale: robotMode === 'cheering' ? 1.3 : 1
               }}
             >
                {/* Sad Droop Cutout overlaying eye */}
                {robotMode === 'sad' && <div className="absolute top-[-2px] left-[-2px] right-[-2px] h-4 bg-gradient-to-b from-[#E8E8E8] to-[#CACACA] transform origin-top rotate-[-15deg]"></div>} 
                {robotMode === 'cheering' && <div className="absolute inset-0 bg-[#D4AF37] opacity-40 animate-pulse"></div>}
                <div className="absolute top-[4px] left-[5px] w-2.5 h-2.5 bg-white rounded-full"></div>
             </motion.div>
             <motion.div 
               className="w-6 h-7 bg-[#1A1A1A] rounded-full overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center"
               animate={{ 
                 x: mousePosition.x * 3, 
                 y: mousePosition.y * 3,
                 scale: robotMode === 'cheering' ? 1.3 : 1
               }}
             >
                {/* Sad Droop Cutout overlaying eye */}
                {robotMode === 'sad' && <div className="absolute top-[-2px] left-[-2px] right-[-2px] h-4 bg-gradient-to-b from-[#E8E8E8] to-[#CACACA] transform origin-top rotate-[15deg]"></div>} 
                {robotMode === 'cheering' && <div className="absolute inset-0 bg-[#D4AF37] opacity-40 animate-pulse"></div>}
                <div className="absolute top-[4px] left-[5px] w-2.5 h-2.5 bg-white rounded-full"></div>
             </motion.div>
           </div>
           
           {/* Mouth (Frown when sad, big smile when cheering, regular otherwise) */}
           <motion.div 
             animate={
               robotMode === 'cheering' 
                 ? { width: "45px", height: "18px", borderBottomLeftRadius: "20px", borderBottomRightRadius: "20px", backgroundColor: "#1A1A1A", rotateZ: 0, marginTop: "8px" }
                 : (robotMode === 'sad' 
                     ? { width: "30px", height: "12px", borderBottomLeftRadius: "50%", borderBottomRightRadius: "50%", backgroundColor: "transparent", borderTopWidth: "3px", borderBottomWidth: "0px", rotateZ: 0, marginTop: "12px" } 
                     : { width: "32px", height: "12px", borderBottomLeftRadius: "50%", borderBottomRightRadius: "50%", backgroundColor: "transparent", borderBottomWidth: "3px", borderTopWidth: "0px", rotateZ: 0, marginTop: "8px" })
             }
             className={`border-[#1A1A1A] opacity-80 ${robotMode === 'cheering' ? 'border-none' : ''}`} 
           />
           
           {/* Cheeks */}
           <div className="absolute left-[20px] top-[55px] w-5 h-[8px] bg-pink-400 rounded-full blur-[2px] opacity-50" />
           <div className="absolute right-[20px] top-[55px] w-5 h-[8px] bg-pink-400 rounded-full blur-[2px] opacity-50" />
        </motion.div>

        {/* Neck */}
        <div className="w-10 h-5 bg-gradient-to-b from-[#D0D0D0] to-[#E0E0E0] -mt-3 z-10 border-x-2 border-[#C0C0C0]" />

        {/* Chubby Torso */}
        <div className="w-52 h-44 bg-gradient-to-br from-white via-[#F5F5F5] to-[#E0E0E0] rounded-[4rem] border-[3px] border-[#F4E091] shadow-lg relative z-20 flex justify-center pt-6 [transform-style:preserve-3d]">
           
           {/* Central Core Glow */}
           <motion.div 
             animate={robotMode === 'cheering' ? { scale: [1, 1.8, 1], opacity: [0.6, 1, 0.6] } : { scale: 1, opacity: 0.3 }}
             transition={{ duration: 0.4, repeat: robotMode === 'cheering' ? Infinity : 0 }}
             className="w-12 h-10 bg-[#D4AF37] rounded-[50%] blur-[8px] absolute top-8" 
           />
           <div className="w-8 h-5 bg-white rounded-[50%] opacity-90 blur-[2px] absolute top-10" />
           
           {/* Belly lines */}
           <div className="absolute bottom-8 w-20 h-px bg-[#D0D0D0]"></div>
           <div className="absolute bottom-5 w-12 h-px bg-[#D0D0D0]"></div>

           {/* Left Arm */}
           <motion.div 
             animate={robotMode === 'smashing' ? leftArmControls : dynamicLeftArm}
             transition={(robotMode === 'smashing' || robotMode === 'sad') ? undefined : (robotMode === 'cheering' ? { duration: 0.4, repeat: Infinity, repeatType: "reverse" } : { type: "spring", stiffness: 200, damping: 20 })}
             className="absolute -left-4 top-10 w-12 h-20 bg-gradient-to-br from-white to-[#E0E0E0] rounded-[2rem] border-2 border-[#F4E091] origin-top shadow-sm z-30 flex items-end justify-center pb-2"
           >
             <div className="w-7 h-7 bg-[#D0D0D0] rounded-full border border-[#C0C0C0] shadow-inner relative z-10" />
           </motion.div>
           
           {/* Right Arm (Elbow balance deeply on button when sad) */}
           <motion.div 
             animate={robotMode === 'smashing' ? rightArmControls : dynamicRightArm}
             transition={(robotMode === 'smashing' || robotMode === 'sad') ? undefined : (robotMode === 'cheering' ? { duration: 0.5, repeat: Infinity, repeatType: "reverse" } : { type: "spring", stiffness: 200, damping: 20 })}
             className="absolute -right-4 top-10 w-12 h-20 bg-gradient-to-bl from-white to-[#E0E0E0] rounded-[2rem] border-2 border-[#F4E091] origin-top shadow-sm z-30 flex items-end justify-center pb-2"
           >
             <div className="w-7 h-7 bg-[#D0D0D0] rounded-full border border-[#C0C0C0] shadow-inner relative z-10" />
             
             {/* Fingers (only wiggle if not smashing, and droop limp if sad) */}
             {robotMode !== 'smashing' && (
               <div className="absolute -bottom-2 left-2 flex gap-[2px]">
                 <motion.div animate={robotMode==='sad'?{rotateZ:90}:{rotateZ: mousePosition.x * 30 + mousePosition.y * 10}} className={`w-[8px] h-3 bg-[#A0A0A0] rounded-full origin-top ${robotMode==='sad'?'mt-2':''}`} />
                 <motion.div animate={robotMode==='sad'?{rotateZ:90}:{rotateZ: mousePosition.x * 20 - mousePosition.y * 10}} className={`w-[8px] h-4 bg-[#B0B0B0] rounded-full origin-top mt-[1px] ${robotMode==='sad'?'mt-2':''}`} />
                 <motion.div animate={robotMode==='sad'?{rotateZ:90}:{rotateZ: mousePosition.x * 10 + mousePosition.y * 20}} className={`w-[8px] h-3 bg-[#909090] rounded-full origin-top mt-[2px] ${robotMode==='sad'?'mt-2':''}`} />
               </div>
             )}
           </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

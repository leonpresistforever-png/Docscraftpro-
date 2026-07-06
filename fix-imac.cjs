const fs = require('fs');
let code = fs.readFileSync('src/components/LandingInteractiveImage.tsx', 'utf-8');
const startMatch = '{/* Screen UI - Top Navigation (Simulated Web Design interface) */}';
const endMatch = '{/* iMac Stand */}';
const startIdx = code.indexOf(startMatch);
const endIdx = code.indexOf(endMatch);
if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + `
              {/* Screen UI - Video Only */}
              <div className="w-full h-full relative bg-black overflow-hidden flex items-center justify-center">
                 <iframe 
                   src="https://drive.google.com/file/d/1ZukrOqNACYHCrq8euKUTayf1u5jvyXvw/preview"
                   className="w-full h-full absolute inset-0 border-0"
                   allow="autoplay; fullscreen"
                 ></iframe>
              </div>
            </div>
          </motion.div>
          ` + code.substring(endIdx);
  fs.writeFileSync('src/components/LandingInteractiveImage.tsx', code);
  console.log('Fixed iMac screen');
}

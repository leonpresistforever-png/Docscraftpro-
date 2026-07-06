const fs = require('fs');
let code = fs.readFileSync('src/components/LandingBookSection.tsx', 'utf-8');

const oldText = 'Welcome to Docscraft, the creative document writing journey. Write naturally, and watch as your ideas seamlessly organize themselves on the page. Enjoy the freedom of infinite drafting.';
const newText = `Welcome to Docscraft, the creative document writing journey. Write naturally, and watch as your ideas seamlessly organize themselves on the page. Enjoy the freedom of infinite drafting.
Every keystroke feels intentional, every paragraph perfectly aligned. We believe that a pristine workspace leads to brilliant ideas.
Say goodbye to formatting struggles and hello to pure, unadulterated creativity. Your words deserve a beautiful home.`;

code = code.replaceAll(oldText, newText);

// Also let's adjust the size of HTML overlay if it's too small
code = code.replace('className="w-[280px] h-[160px] overflow-hidden"', 'className="w-[320px] h-[240px] overflow-hidden"');
code = code.replace('<Html position={[-1.7, 0.23, -1.0]}', '<Html position={[-1.8, 0.23, -1.2]}');

fs.writeFileSync('src/components/LandingBookSection.tsx', code);

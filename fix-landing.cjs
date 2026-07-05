const fs = require('fs');
const content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf-8');

const startStr = `<main className="w-full max-w-[1400px] mx-auto px-6 relative z-10 pt-10">`;
const endStr = `<LandingBookSection />`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) +
    `<main className="w-full relative z-10">\n        <div className="w-full max-w-[1400px] mx-auto px-6 relative z-10 pt-10">\n          ` +
    content.substring(endIndex);
  
  fs.writeFileSync('src/pages/LandingPage.tsx', newContent);
  console.log('Replaced successfully!');
} else {
  console.log('Strings not found');
}

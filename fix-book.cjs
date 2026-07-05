const fs = require('fs');
const content = fs.readFileSync('src/components/LandingBookSection.tsx', 'utf-8');

const startStr = "{/* UNIQUE EXPANDED WORKSPACE COMPONENT (NO BLANK PAGES - EXPANDS FLUIDLY WITH DYNAMIC TEXT CHROMALINE EFFECTS) */}";
const endStr = "    </div>\n  );\n}";

const startIndex = content.indexOf(startStr);
const endIndex = content.lastIndexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) +
    endStr;
  
  fs.writeFileSync('src/components/LandingBookSection.tsx', newContent);
  console.log('Replaced successfully!');
} else {
  console.log('Strings not found', startIndex, endIndex);
}

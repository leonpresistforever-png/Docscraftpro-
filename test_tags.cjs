const fs = require('fs');
const content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf-8');
const lines = content.split('\n');
const tagRegex = /<\/?([a-zA-Z0-9\.]+)[^>]*>/g;
let stack = [];
for (let i = 194; i < 830; i++) {
  const line = lines[i];
  let match;
  while ((match = tagRegex.exec(line)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    
    // Skip self-closing
    if (fullTag.endsWith('/>')) continue;
    
    // Skip string contents (hacky)
    
    if (fullTag.startsWith('</')) {
      if (stack.length > 0 && stack[stack.length - 1].name === tagName) {
        stack.pop();
      } else {
        console.log(`Unmatched closing tag ${fullTag} at line ${i + 1}. Expected ${stack.length > 0 ? stack[stack.length-1].name : 'none'}`);
      }
    } else {
      stack.push({name: tagName, line: i + 1});
    }
  }
}
console.log('Remaining tags:', stack);

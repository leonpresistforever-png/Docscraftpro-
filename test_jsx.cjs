const fs = require('fs');
const content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf-8');
const lines = content.split('\n');
let braces = 0;
let parens = 0;
for (let i = 194; i < 830; i++) {
  const line = lines[i];
  for (let c of line) {
    if (c === '{') braces++;
    if (c === '}') braces--;
    if (c === '(') parens++;
    if (c === ')') parens--;
  }
}
console.log('Final braces:', braces, 'parens:', parens);

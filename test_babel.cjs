const fs = require('fs');
const parser = require('@babel/parser');
const content = fs.readFileSync('src/pages/LandingPage.tsx', 'utf-8');
try {
  parser.parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx']
  });
  console.log('Parsed successfully!');
} catch (e) {
  console.error(e.message, 'at line', e.loc.line, 'column', e.loc.column);
}

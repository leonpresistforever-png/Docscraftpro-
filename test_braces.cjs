const fs = require('fs');
const content = fs.readFileSync('src/pages/RepositoriesPage.tsx', 'utf-8');
const openBraces = content.split('{').length - 1;
const closeBraces = content.split('}').length - 1;
console.log('Open:', openBraces, 'Close:', closeBraces);

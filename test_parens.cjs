const fs = require('fs');
const content = fs.readFileSync('src/pages/RepositoriesPage.tsx', 'utf-8');
const openParens = content.split('(').length - 1;
const closeParens = content.split(')').length - 1;
console.log('Open:', openParens, 'Close:', closeParens);

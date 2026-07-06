const fs = require('fs');
const content = fs.readFileSync('src/pages/RepositoriesPage.tsx', 'utf-8');
const openAng = content.split('<').length - 1;
const closeAng = content.split('>').length - 1;
console.log('Open:', openAng, 'Close:', closeAng);

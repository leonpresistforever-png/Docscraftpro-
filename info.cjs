const fs = require('fs');
const path = require('path');

console.log('Applet Dir:', __dirname);
try {
  console.log('Applet Dir files:', fs.readdirSync('/app/applet'));
} catch (err) {
  console.error(err);
}
try {
  console.log('Package.json exists:', fs.existsSync('/app/applet/package.json'));
  if (fs.existsSync('/app/applet/package.json')) {
    console.log('Package.json content:', fs.readFileSync('/app/applet/package.json', 'utf8'));
  }
} catch (err) {
  console.error(err);
}

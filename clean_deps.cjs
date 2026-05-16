const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

delete pkg.dependencies['new left'];
delete pkg.dependencies['current right'];
delete pkg.dependencies['@/src'];
delete pkg.dependencies['@models'];

pkg.devDependencies = {
  "typescript": "latest",
  "tsx": "latest",
  "vite": "latest",
  "tailwindcss": "^3.4.0",
  "@types/react": "latest",
  "@types/react-dom": "latest",
  "@types/express": "latest"
};

// Also standard dependencies that might have been lost
pkg.dependencies["dotenv"] = "latest";
pkg.dependencies["stripe"] = "latest"; 
pkg.dependencies["cors"] = "latest";

fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));

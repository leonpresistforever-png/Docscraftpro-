const fs = require('fs');
try {
  console.log(fs.readFileSync('/etc/nginx/nginx.conf').toString());
} catch (err) {
  console.error(err);
}

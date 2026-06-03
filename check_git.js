const { execSync } = require('child_process');

function run(cmd) {
  try {
    console.log(`\n--- Running: ${cmd} ---`);
    console.log(execSync(cmd, { encoding: 'utf8' }));
  } catch (err) {
    console.error(`Error running ${cmd}:`, err.message);
  }
}

run('find / -name "*.tsx" 2>/dev/null');
run('find / -name "*.ts" 2>/dev/null');

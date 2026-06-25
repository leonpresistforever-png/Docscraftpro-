const fs = require('fs');

function extractEndPoints(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    const content = data.toString('binary');
    const regex = /\/(api|workspace|git|build|sync|source|deploy|run|linter|components|pages)\/[a-zA-Z0-9_/_-]*/g;
    const matches = new Set(content.match(regex));
    console.log('Matches:', Array.from(matches).slice(0, 50));
  } catch (err) {
    console.error(err);
  }
}

extractEndPoints('/app/control-plane-api/control-plane-api');

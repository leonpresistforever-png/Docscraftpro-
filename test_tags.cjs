const fs = require('fs');

const text = fs.readFileSync('src/pages/RepositoriesPage.tsx', 'utf-8');

let stack = [];
let i = 0;

while (i < text.length) {
  if (text.substr(i, 2) === '/*') {
    i = text.indexOf('*/', i) + 2;
    continue;
  }
  if (text.substr(i, 2) === '//') {
    i = text.indexOf('\n', i) + 1;
    continue;
  }
  if (text[i] === '<' && /[a-zA-Z]/.test(text[i+1])) {
    let space = text.indexOf(' ', i);
    let newline = text.indexOf('\n', i);
    let close = text.indexOf('>', i);
    if (close === -1) break;
    
    let spacePos = space !== -1 ? space : close;
    let newlinePos = newline !== -1 ? newline : close;
    let endOfTag = Math.min(spacePos, newlinePos, close);
    let tag = text.substring(i + 1, endOfTag);
    let fullTag = text.substring(i, close + 1);
    
    if (!['input', 'img', 'br', 'hr', 'meta', 'link', 'textarea', 'Editor'].includes(tag) && !fullTag.endsWith('/>')) {
      stack.push({tag, line: text.substr(0, i).split('\n').length});
    }
    i = close + 1;
  } else if (text.substr(i, 2) === '</' && /[a-zA-Z]/.test(text[i+2])) {
    let close = text.indexOf('>', i);
    let tag = text.substring(i + 2, close);
    let last = stack.pop();
    if (last && last.tag !== tag) {
      console.log(`Mismatch! Expected ${last.tag} from line ${last.line}, got ${tag} at line ${text.substr(0, i).split('\n').length}`);
      // stack.push(last);
    }
    i = close + 1;
  } else {
    i++;
  }
}
console.log('Unclosed tags:');
console.table(stack.filter(x => x.tag !== 'string' && x.tag !== 'string[]' && !x.tag.includes('[]') && !x.tag.includes('WorkspaceFile')));

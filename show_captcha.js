const fs = require('fs');
const s = fs.readFileSync('captcha_out.txt','utf8');
const lines = s.split(/\r?\n/);
console.log(lines.slice(Math.max(0, lines.length-70)).join('\n'));

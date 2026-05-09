const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('p:/spendsmart/spendsmart-frontend/src/app', function(filePath) {
  if (filePath.endsWith('.html') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace "shadow-color-300/xx dark:shadow-color-400/yy" with just "dark:shadow-color-400/yy"
    let newContent = content.replace(/shadow-(emerald|slate|indigo|rose|amber)-300\/\d{2}\s+(dark:shadow-\1-400\/\d{2})/g, '$2');
      
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Removed light mode glow in', filePath);
    }
  }
});

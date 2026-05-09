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
    let newContent = content
      // Emerald
      .replace(/shadow-emerald-500\/20 dark:shadow-emerald-500\/10/g, 'shadow-emerald-300/60 dark:shadow-emerald-400/40')
      .replace(/shadow-emerald-500\/30 dark:shadow-emerald-500\/10/g, 'shadow-emerald-300/70 dark:shadow-emerald-400/50')
      .replace(/shadow-emerald-500\/40 dark:shadow-emerald-500\/10/g, 'shadow-emerald-300/80 dark:shadow-emerald-400/60')
      
      // Slate
      .replace(/shadow-slate-500\/10 dark:shadow-none/g, 'shadow-slate-300/40 dark:shadow-slate-400/30')
      .replace(/shadow-slate-500\/20 dark:shadow-none/g, 'shadow-slate-300/50 dark:shadow-slate-400/40')
      .replace(/shadow-slate-500\/30 dark:shadow-none/g, 'shadow-slate-300/60 dark:shadow-slate-400/50')
      
      // Indigo
      .replace(/shadow-indigo-500\/20 dark:shadow-indigo-500\/10/g, 'shadow-indigo-300/60 dark:shadow-indigo-400/40')
      .replace(/shadow-indigo-500\/30 dark:shadow-indigo-500\/10/g, 'shadow-indigo-300/70 dark:shadow-indigo-400/50')
      .replace(/shadow-indigo-500\/40 dark:shadow-indigo-500\/10/g, 'shadow-indigo-300/80 dark:shadow-indigo-400/60')

      // Rose
      .replace(/shadow-rose-500\/20 dark:shadow-rose-500\/10/g, 'shadow-rose-300/60 dark:shadow-rose-400/40')
      .replace(/shadow-rose-500\/30 dark:shadow-rose-500\/10/g, 'shadow-rose-300/70 dark:shadow-rose-400/50')
      .replace(/shadow-rose-500\/40 dark:shadow-rose-500\/10/g, 'shadow-rose-300/80 dark:shadow-rose-400/60')
      
      // Amber
      .replace(/shadow-amber-500\/20 dark:shadow-amber-500\/10/g, 'shadow-amber-300/60 dark:shadow-amber-400/40')
      .replace(/shadow-amber-500\/30 dark:shadow-amber-500\/10/g, 'shadow-amber-300/70 dark:shadow-amber-400/50')
      .replace(/shadow-amber-500\/40 dark:shadow-amber-500\/10/g, 'shadow-amber-300/80 dark:shadow-amber-400/60');
      
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});

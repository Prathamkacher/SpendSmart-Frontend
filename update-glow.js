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
      .replace(/shadow-emerald-100/g, 'shadow-emerald-500/20 dark:shadow-emerald-500/10')
      .replace(/shadow-emerald-200/g, 'shadow-emerald-500/30 dark:shadow-emerald-500/10')
      .replace(/shadow-emerald-300/g, 'shadow-emerald-500/40 dark:shadow-emerald-500/10')
      // Slate
      .replace(/shadow-slate-100/g, 'shadow-slate-500/10 dark:shadow-none')
      .replace(/shadow-slate-200/g, 'shadow-slate-500/20 dark:shadow-none')
      .replace(/shadow-slate-300/g, 'shadow-slate-500/30 dark:shadow-none')
      // Indigo
      .replace(/shadow-indigo-100/g, 'shadow-indigo-500/20 dark:shadow-indigo-500/10')
      .replace(/shadow-indigo-200/g, 'shadow-indigo-500/30 dark:shadow-indigo-500/10')
      .replace(/shadow-indigo-300/g, 'shadow-indigo-500/40 dark:shadow-indigo-500/10')
      // Rose
      .replace(/shadow-rose-100/g, 'shadow-rose-500/20 dark:shadow-rose-500/10')
      .replace(/shadow-rose-200/g, 'shadow-rose-500/30 dark:shadow-rose-500/10')
      .replace(/shadow-rose-300/g, 'shadow-rose-500/40 dark:shadow-rose-500/10')
      // Amber
      .replace(/shadow-amber-100/g, 'shadow-amber-500/20 dark:shadow-amber-500/10')
      .replace(/shadow-amber-200/g, 'shadow-amber-500/30 dark:shadow-amber-500/10')
      .replace(/shadow-amber-300/g, 'shadow-amber-500/40 dark:shadow-amber-500/10');
      
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated', filePath);
    }
  }
});

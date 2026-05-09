const fs = require('fs');

const files = [
  'src/app/features/auth/login/login.component.html',
  'src/app/features/auth/register/register.component.html',
  'src/app/features/auth/forgot-password/forgot-password.component.html'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');

  // Add Theme Toggle if not present
  if (!content.includes('<app-theme-toggle>')) {
    content = content.replace('<!-- ── Right form panel ──────────────────────────────────────── -->', '<!-- ── Right form panel ──────────────────────────────────────── -->\n  <div class="absolute top-4 right-4 z-50"><app-theme-toggle></app-theme-toggle></div>');
    // Also try another hook for forgot-password
    if (!content.includes('<app-theme-toggle>')) {
      content = content.replace('<div class="min-h-screen', '<div class="absolute top-4 right-4 z-50"><app-theme-toggle></app-theme-toggle></div>\n<div class="min-h-screen');
    }
  }

  // Background
  content = content.replace(/bg-gray-50/g, 'bg-gray-50 dark:bg-slate-900 transition-colors duration-300');
  content = content.replace(/bg-white(?!\/)/g, 'bg-white dark:bg-gray-900 transition-colors duration-300'); // avoiding bg-white/20
  
  // Text
  content = content.replace(/text-gray-900/g, 'text-gray-900 dark:text-white');
  content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');
  content = content.replace(/text-gray-700/g, 'text-gray-700 dark:text-gray-300');
  content = content.replace(/text-gray-400/g, 'text-gray-400 dark:text-gray-500');
  
  // Borders
  content = content.replace(/border-gray-200/g, 'border-gray-200 dark:border-gray-700');
  content = content.replace(/border-gray-100/g, 'border-gray-100 dark:border-gray-800');
  
  // Specific inputs
  content = content.replace(/bg-white dark:bg-gray-900 transition-colors duration-300 text-gray-900 dark:text-white placeholder-gray-400 dark:text-gray-500/g, 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300');
  
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});

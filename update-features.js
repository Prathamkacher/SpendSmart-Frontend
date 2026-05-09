const fs = require('fs');

const files = [
  'src/app/features/dashboard/dashboard.component.html',
  'src/app/features/analytics/reports/reports.component.html',
  'src/app/features/expense/expense-list/expense-list.component.html',
  'src/app/features/income/income-list/income-list.component.html',
  'src/app/features/category/category-list/category-list.component.html',
  'src/app/features/budget/budget-list/budget-list.component.html',
  'src/app/features/expense/expense-form/expense-form.component.html',
  'src/app/features/income/income-form/income-form.component.html',
  'src/app/features/category/category-form/category-form.component.html',
  'src/app/features/budget/budget-form/budget-form.component.html'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');

  // Backgrounds
  content = content.replace(/bg-slate-50(?!\/)/g, 'bg-slate-50 dark:bg-slate-900 transition-colors');
  content = content.replace(/bg-white(?!\/)/g, 'bg-white dark:bg-gray-900 transition-colors');
  content = content.replace(/bg-slate-100/g, 'bg-slate-100 dark:bg-gray-800');
  
  // Text
  content = content.replace(/text-slate-800/g, 'text-slate-800 dark:text-white');
  content = content.replace(/text-slate-900/g, 'text-slate-900 dark:text-white');
  content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-gray-400');
  content = content.replace(/text-slate-600/g, 'text-slate-600 dark:text-gray-300');
  content = content.replace(/text-gray-900/g, 'text-gray-900 dark:text-white');
  content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');
  
  // Borders
  content = content.replace(/border-slate-100/g, 'border-slate-100 dark:border-gray-800');
  content = content.replace(/border-slate-200/g, 'border-slate-200 dark:border-gray-800');
  content = content.replace(/border-gray-100/g, 'border-gray-100 dark:border-gray-800');
  content = content.replace(/border-gray-200/g, 'border-gray-200 dark:border-gray-700');

  // Specifics
  content = content.replace(/hover:bg-slate-50/g, 'hover:bg-slate-50 dark:hover:bg-gray-800');
  content = content.replace(/shadow-slate-200\/50/g, 'shadow-slate-200/50 dark:shadow-gray-950/50');

  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});

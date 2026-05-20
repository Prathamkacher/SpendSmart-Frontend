const fs = require('fs');
const path = require('path');

const tsFiles = [
  'src/app/features/admin/admin.component.ts',
  'src/app/features/analytics/reports/reports.component.ts',
  'src/app/features/budget/budget-form/budget-form.component.ts',
  'src/app/features/category/category-form/category-form.component.ts',
  'src/app/features/dashboard/dashboard.component.ts',
  'src/app/features/landing-page/landing-page.component.ts',
  'src/app/features/profile/profile.component.ts',
  'src/app/features/recurring/recurring-form/recurring-form.component.ts',
  'src/app/features/subscriptions/pricing/pricing.component.ts',
  'src/app/shared/components/main-layout/main-layout.component.ts'
];

const htmlFiles = [
  'src/app/features/admin/admin.component.html',
  'src/app/features/analytics/reports/reports.component.html',
  'src/app/features/budget/budget-form/budget-form.component.html',
  'src/app/features/category/category-form/category-form.component.html',
  'src/app/features/dashboard/dashboard.component.html',
  'src/app/features/landing-page/landing-page.component.html',
  'src/app/features/profile/profile.component.html',
  'src/app/features/recurring/recurring-form/recurring-form.component.html',
  'src/app/features/subscriptions/pricing/pricing.component.html',
  'src/app/shared/components/main-layout/main-layout.component.html'
];

function updateTsFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Need to import UserCurrencyPipe and UserCurrencySymbolPipe
  if (!content.includes('UserCurrencyPipe')) {
    // Add imports at top
    // Find last import
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    
    // Calculate path to shared pipes
    const dirDepth = filePath.split('/').length - 3; // src/app = 2, so 3 is correct for offset
    let relativePath = '';
    for(let i=0; i<dirDepth; i++) relativePath += '../';
    relativePath += 'shared/pipes/user-currency.pipe';
    const symbolPath = relativePath.replace('user-currency.pipe', 'user-currency-symbol.pipe');
    
    const importsToAdd = `\nimport { UserCurrencyPipe } from '${relativePath}';\nimport { UserCurrencySymbolPipe } from '${symbolPath}';`;
    content = content.slice(0, endOfLastImport) + importsToAdd + content.slice(endOfLastImport);
  }

  // Add to standalone imports array
  if (content.includes('imports: [')) {
    content = content.replace(/imports:\s*\[([^\]]*)\]/, (match, p1) => {
      let newImports = p1;
      if (!p1.includes('UserCurrencyPipe')) newImports += ', UserCurrencyPipe';
      if (!p1.includes('UserCurrencySymbolPipe')) newImports += ', UserCurrencySymbolPipe';
      return `imports: [${newImports}]`;
    });
  }

  // Fix budget-form.component.ts hardcoded 'INR'
  if (filePath.includes('budget-form.component.ts')) {
    content = content.replace(/currency:\s*'INR'/g, "currency: this.authService.currentUserValue?.currency || 'USD'");
  }

  fs.writeFileSync(filePath, content, 'utf-8');
}

function updateHtmlFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace bare symbols like >₹< with >{{ '' | userCurrencySymbol }}<
  content = content.replace(/>\s*[₹$]\s*</g, ">{{ '' | userCurrencySymbol }}<");
  
  // Replace symbols inside spans/classes
  content = content.replace(/"[^"]*"\s*>\s*[₹$]\s*<\/span>/g, match => {
    return match.replace(/[₹$]/, "{{ '' | userCurrencySymbol }}");
  });

  // Replace Angular's native currency pipe {{ x | currency:'USD' }} or {{ x | currency:'INR' }}
  content = content.replace(/\|\s*currency\s*:\s*'[^']+'(?:\s*:\s*'symbol'[^}]*)?/g, '| userCurrency');
  // Just generic replacing ` | currency ` with ` | userCurrency ` where it's missing the code
  content = content.replace(/\|\s*currency\s*(?=[}|])/g, '| userCurrency ');
  
  // For landing-page.component.html and pricing.component.html (not logged in), 
  // maybe we don't want authService to crash or return USD. 
  // UserCurrencyPipe safely defaults to USD.
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

tsFiles.forEach(updateTsFile);
htmlFiles.forEach(updateHtmlFile);

console.log('Done fixing currency symbols');

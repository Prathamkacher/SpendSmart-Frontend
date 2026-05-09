const fs = require('fs');
const files = [
  'src/app/features/auth/register/register.component.ts',
  'src/app/features/auth/login/login.component.ts',
  'src/app/features/auth/forgot-password/forgot-password.component.ts'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/Validators\.email/g, "Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/)");
  content = content.replace(/Validators\.pattern\(\/\^\(\?=\.\*\[a-z\]\)\(\?=\.\*\[A-Z\]\)\(\?=\.\*\\d\)\.\*\$\/\)/g, "Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/)");
  fs.writeFileSync(f, content);
});
console.log("Done");

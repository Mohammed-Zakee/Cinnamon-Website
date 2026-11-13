const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
execFileSync(process.execPath, ['--check', path.join(root, 'frontend/app.js')], {stdio:'inherit'});
for (const file of ['index.html','app.js','style.css','assets/hero.png','assets/mark.svg','assets/sticks.jpeg','assets/powder.jpeg','assets/oil-10.jpeg','assets/oil-100.jpeg','assets/sticks-studio.webp','assets/powder-studio.webp','assets/oil-10-studio.webp','assets/oil-100-studio.webp']) {
  if (!fs.existsSync(path.join(root,'frontend',file))) throw new Error('Missing storefront asset: '+file);
}
console.log('Storefront ready: frontend/ (static; no database or payment credentials required).');

const fs = require('fs');
const path = require('path');

// Vercel-specifieke build script
console.log('Preparing for Vercel deployment...');

// Controleer of het vercel-package.json bestand bestaat
if (fs.existsSync('vercel-package.json')) {
  // Maak een backup van het originele package.json als dat nog niet bestaat
  if (!fs.existsSync('original-package.json')) {
    fs.copyFileSync('package.json', 'original-package.json');
    console.log('Backed up original package.json');
  }
  
  // Vervang het originele package.json met de Vercel-versie
  fs.copyFileSync('vercel-package.json', 'package.json');
  console.log('Replaced package.json with vercel-package.json');
}

console.log('Vercel preparation complete');
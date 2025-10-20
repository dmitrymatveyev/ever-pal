#!/usr/bin/env node

/**
 * PWA Validation Script
 * Checks that all required PWA files and configurations are present
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');
const DIST_DIR = path.join(__dirname, 'dist');

// Check if we're validating build output or source
const targetDir = fs.existsSync(DIST_DIR) ? DIST_DIR : PUBLIC_DIR;
const isDist = targetDir === DIST_DIR;

console.log(`\n🔍 Validating PWA Configuration...`);
console.log(`📁 Checking: ${isDist ? 'Build Output (dist/)' : 'Source (public/)'}\n`);

let errors = 0;
let warnings = 0;

// Required files
const requiredFiles = [
  'manifest.json',
  'service-worker.js',
  'icon-72x72.png',
  'icon-96x96.png',
  'icon-128x128.png',
  'icon-144x144.png',
  'icon-152x152.png',
  'icon-192x192.png',
  'icon-384x384.png',
  'icon-512x512.png',
  'apple-touch-icon.png',
  'browserconfig.xml',
  'robots.txt'
];

// Check files
console.log('📄 Checking Required Files:');
requiredFiles.forEach(file => {
  const filePath = path.join(targetDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    console.log(`  ✅ ${file} (${size} KB)`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    errors++;
  }
});

// Check manifest.json content
console.log('\n📋 Validating Manifest:');
const manifestPath = path.join(targetDir, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Check required fields
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    requiredFields.forEach(field => {
      if (manifest[field]) {
        console.log(`  ✅ ${field}: ${typeof manifest[field] === 'object' ? 'configured' : manifest[field]}`);
      } else {
        console.log(`  ❌ ${field} - MISSING`);
        errors++;
      }
    });

    // Check icons array
    if (manifest.icons && Array.isArray(manifest.icons)) {
      console.log(`  ✅ Icons: ${manifest.icons.length} sizes defined`);

      // Check for required icon sizes
      const requiredSizes = ['192x192', '512x512'];
      requiredSizes.forEach(size => {
        const hasSize = manifest.icons.some(icon => icon.sizes === size);
        if (hasSize) {
          console.log(`    ✅ ${size} icon defined`);
        } else {
          console.log(`    ⚠️  ${size} icon missing (recommended)`);
          warnings++;
        }
      });
    }

    // Check theme color
    if (manifest.theme_color) {
      console.log(`  ✅ Theme color: ${manifest.theme_color}`);
    } else {
      console.log(`  ⚠️  theme_color not set (recommended)`);
      warnings++;
    }

  } catch (error) {
    console.log(`  ❌ Invalid JSON: ${error.message}`);
    errors++;
  }
} else {
  console.log(`  ❌ manifest.json not found`);
  errors++;
}

// Check index.html
console.log('\n🌐 Checking index.html:');
const indexPath = isDist
  ? path.join(targetDir, 'index.html')
  : path.join(__dirname, 'index.html');

if (fs.existsSync(indexPath)) {
  const html = fs.readFileSync(indexPath, 'utf8');

  const checks = [
    { pattern: /<link rel="manifest"/, name: 'Manifest link' },
    { pattern: /<meta name="theme-color"/, name: 'Theme color meta' },
    { pattern: /<link rel="apple-touch-icon"/, name: 'Apple touch icon' },
    { pattern: /<meta name="viewport"/, name: 'Viewport meta' },
    { pattern: /<meta name="description"/, name: 'Description meta' }
  ];

  checks.forEach(check => {
    if (check.pattern.test(html)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name} - MISSING`);
      errors++;
    }
  });
} else {
  console.log(`  ❌ index.html not found`);
  errors++;
}

// Summary
console.log('\n' + '='.repeat(50));
if (errors === 0 && warnings === 0) {
  console.log('✅ PWA Validation PASSED - All checks successful!');
  console.log('\n🎉 Your app is ready to be installed as a PWA!');
  console.log('\nNext steps:');
  console.log('  1. Build: npm run build');
  console.log('  2. Deploy: vercel --prod');
  console.log('  3. Test installation on mobile device');
} else {
  if (errors > 0) {
    console.log(`❌ PWA Validation FAILED - ${errors} error(s) found`);
  }
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} warning(s) found`);
  }

  if (errors > 0) {
    console.log('\n🔧 Fix the errors above and run this script again.');
    process.exit(1);
  }
}

console.log('='.repeat(50) + '\n');

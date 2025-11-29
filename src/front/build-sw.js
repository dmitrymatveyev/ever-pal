#!/usr/bin/env node

/**
 * Post-build script to inject static assets into service worker
 * Runs after: vite build
 * Updates: dist/service-worker.js with all built asset paths
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');

console.log('🔧 Building service worker with asset precaching...');

// Collect all assets from dist/assets/
const assetsDir = path.join(distDir, 'assets');
let assetFiles = [];

if (fs.existsSync(assetsDir)) {
  assetFiles = fs.readdirSync(assetsDir)
    .filter(file => file.match(/\.(js|css|woff2?|ttf|eot)$/))
    .map(file => `/assets/${file}`);
}

// Collect all icon files from public/
const iconFiles = fs.readdirSync(publicDir)
  .filter(file => file.match(/^(icon-|apple-touch-icon)/))
  .map(file => `/${file}`);

// Build complete static assets array
const staticAssets = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json',
  ...assetFiles,
  ...iconFiles,
].sort();

console.log(`📦 Found ${staticAssets.length} assets to precache`);

// Read service worker template from public/
const swTemplatePath = path.join(publicDir, 'service-worker.js');
const swDistPath = path.join(distDir, 'service-worker.js');

if (!fs.existsSync(swTemplatePath)) {
  console.error('❌ Error: service-worker.js not found in public/');
  process.exit(1);
}

let swContent = fs.readFileSync(swTemplatePath, 'utf-8');

// Replace STATIC_ASSETS array
const assetsArrayString = JSON.stringify(staticAssets, null, 2);
swContent = swContent.replace(
  /const STATIC_ASSETS = \[[\s\S]*?\];/,
  `const STATIC_ASSETS = ${assetsArrayString};`
);

// Write to dist/
fs.writeFileSync(swDistPath, swContent);

console.log('✅ Service worker built successfully');
console.log(`📄 Output: ${swDistPath}`);
console.log('\nPrecached assets:');
staticAssets.slice(0, 10).forEach(asset => console.log(`  - ${asset}`));
if (staticAssets.length > 10) {
  console.log(`  ... and ${staticAssets.length - 10} more`);
}

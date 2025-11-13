const fs = require('fs');
const path = require('path');

// Simple merge script - reads service JSON files and writes a merged file
const root = path.resolve(__dirname, '..');
const outPath = path.join(__dirname, 'merged_services.json');

const filesToRead = [
  path.join(root, 'services.json'),
  path.join(root, 'bikeServices.json'),
  path.join(root, 'carData.json'),
  path.join(root, 'bikeData.json'),
];

const merged = [];
const seen = new Set();

for (const file of filesToRead) {
  if (!fs.existsSync(file)) continue;
  try {
    const text = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(text);
    // data may be an array or object with services key
    let arr = [];
    if (Array.isArray(data)) arr = data;
    else if (Array.isArray(data.services)) arr = data.services;
    else if (Array.isArray(data.data)) arr = data.data;

    for (const item of arr) {
      const key = (item.name || item.title || item.serviceName || '').toString().trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  } catch (e) {
    console.error('Failed to read/parse', file, e.message);
  }
}

fs.writeFileSync(outPath, JSON.stringify({ services: merged }, null, 2), 'utf8');
console.log('Merged services written to', outPath, 'count=', merged.length);

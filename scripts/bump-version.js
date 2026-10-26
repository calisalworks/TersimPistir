import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const versionJsonPath = path.join(rootDir, 'version.json');
const packageJsonPath = path.join(rootDir, 'package.json');
const manifestJsonPath = path.join(rootDir, 'public', 'manifest.json');

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Dosya okunamadı: ${filePath}`, err.message);
    return null;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

const versionData = readJson(versionJsonPath) || {
  appName: 'Tersim Pistir',
  packageName: 'com.tersimpistir.app',
  versionName: '1.0.1',
  versionCode: 2,
};

const packageData = readJson(packageJsonPath) || { version: '1.0.1' };
const manifestData = readJson(manifestJsonPath) || {};

const action = process.argv[2] || 'show';
const customVersion = process.argv[3];
const customCode = process.argv[4];

let [major, minor, patch] = (versionData.versionName || '1.0.1')
  .split('.')
  .map((n) => parseInt(n, 10) || 0);
let versionCode = parseInt(versionData.versionCode, 10) || 2;

if (action === 'show') {
  console.log(`Mevcut Versiyon Adi  : ${versionData.versionName}`);
  console.log(`Mevcut Versiyon Kodu : ${versionData.versionCode} (Google Play versionCode)`);
  process.exit(0);
}

if (action === 'patch') {
  patch += 1;
  versionCode += 1;
} else if (action === 'minor') {
  minor += 1;
  patch = 0;
  versionCode += 1;
} else if (action === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
  versionCode += 1;
} else if (action === 'code') {
  versionCode += 1;
} else if (action === 'custom') {
  if (!customVersion) {
    console.error('Hata: Yeni versiyon adı belirtilmedi (Örn: 1.0.2)');
    process.exit(1);
  }
  const parts = customVersion.split('.').map((n) => parseInt(n, 10) || 0);
  major = parts[0] || 1;
  minor = parts[1] || 0;
  patch = parts[2] || 0;
  if (customCode) {
    versionCode = parseInt(customCode, 10) || (versionCode + 1);
  } else {
    versionCode += 1;
  }
} else {
  console.error(`Geçersiz işlem: ${action}`);
  process.exit(1);
}

const newVersionName = `${major}.${minor}.${patch}`;

// Update version.json
versionData.versionName = newVersionName;
versionData.versionCode = versionCode;
versionData.buildDate = new Date().toISOString().split('T')[0];
writeJson(versionJsonPath, versionData);

// Update package.json
packageData.version = newVersionName;
writeJson(packageJsonPath, packageData);

// Update manifest.json
manifestData.version = newVersionName;
manifestData.version_code = versionCode;
writeJson(manifestJsonPath, manifestData);

console.log('====================================================');
console.log(' BASARIYLA GUNCELLENDI! (Google Play Ready)');
console.log('====================================================');
console.log(` Yeni Versiyon Adi  : ${newVersionName}`);
console.log(` Yeni Versiyon Kodu : ${versionCode} (Google Play versionCode)`);
console.log(' Guncellenen Dosyalar:');
console.log('  - version.json');
console.log('  - package.json');
console.log('  - public/manifest.json');
console.log('====================================================');

import { readFileSync, writeFileSync } from 'node:fs';

const manifestPath = 'android/app/src/main/AndroidManifest.xml';
let xml = readFileSync(manifestPath, 'utf8');
const permissions = [
  'android.permission.RECORD_AUDIO',
  'android.permission.MODIFY_AUDIO_SETTINGS',
];
for (const permission of permissions) {
  const tag = `<uses-permission android:name="${permission}" />`;
  if (!xml.includes(`android:name="${permission}"`)) {
    xml = xml.replace('<application', `    ${tag}\n    <application`);
  }
}
writeFileSync(manifestPath, xml);
console.log('Android microphone/audio permissions ensured.');

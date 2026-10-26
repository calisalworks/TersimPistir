import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.calisalworks.tersimpistir',
  appName: 'Tersim Pistir',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
};

export default config;

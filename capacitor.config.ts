import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'nl.gezin.planner',
  appName: 'Gezinsplanner',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
  },
};

export default config;

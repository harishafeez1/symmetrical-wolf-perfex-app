import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sw_portal.app',
  appName: 'SW Pro',
  webDir: 'www',
  bundledWebRuntime: false,
  // backgroundColor: '#ff0000',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    Badge: {
      persist: true,
      autoClear: false,
    },
    SplashScreen: {
      // launchShowDuration: 3000,
      // launchAutoHide: false
      launchShowDuration: 10000,
      launchAutoHide: false
    }
  }
};

export default config;

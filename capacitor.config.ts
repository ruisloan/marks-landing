import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.centralbraintrust.marks",
  appName: "Marks",
  webDir: "out",
  ios: {
    contentInset: "always",
    scrollEnabled: true,
    backgroundColor: "#0a0c12",
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    backgroundColor: "#0a0c12",
    allowMixedContent: false,
    captureInput: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0a0c12",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0c12",
    },
  },
  server: {
    androidScheme: "https",
    iosScheme: "marks",
  },
};

export default config;

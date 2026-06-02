import { Platform } from 'react-native';

// API base URL resolution, in priority order:
// 1. EXPO_PUBLIC_API_URL  -> set this to your hosted backend (e.g. https://your-api.onrender.com)
//    when you build an APK/IPA or deploy the web app, so testers don't need your laptop.
// 2. Android emulator    -> 10.0.2.2 maps to the host machine's localhost.
// 3. Web / iOS simulator -> localhost.
//
// For a physical device on your Wi-Fi during dev, set EXPO_PUBLIC_API_URL to
// http://YOUR_LOCAL_IP:8000 (e.g. http://192.168.1.50:8000).
const ENV_URL = process.env.EXPO_PUBLIC_API_URL;

const DEFAULT_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export const API_URL = ENV_URL && ENV_URL.length > 0 ? ENV_URL : DEFAULT_URL;

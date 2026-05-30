import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulators, localhost for web/iOS sim, or replace with your machine's local IP for physical devices
export const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

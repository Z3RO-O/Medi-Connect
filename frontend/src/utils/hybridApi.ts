import axios from 'axios';
import { secureApi } from './secureApi';

interface HybridApiConfig {
  baseURL: string;
  useEncryption?: boolean;
}

class HybridApiService {
  private baseURL: string;
  private useEncryption: boolean;
  private isSecureInitialized = false;

  constructor(config: HybridApiConfig) {
    this.baseURL = config.baseURL;
    this.useEncryption = config.useEncryption ?? false;
  }

  // Initialize secure connection if needed
  private async ensureSecureInit(): Promise<void> {
    if (this.useEncryption && !this.isSecureInitialized) {
      try {
        await secureApi.initialize();
        this.isSecureInitialized = true;
        console.log('🔐 Hybrid API: Secure connection initialized');
      } catch {
        console.warn('⚠️ Hybrid API: Failed to initialize secure connection, falling back to regular API');
        this.useEncryption = false;
      }
    }
  }

  // Generic method to handle both encrypted and non-encrypted GET requests
  async get(endpoint: string, config?: Record<string, unknown>): Promise<unknown> {
    await this.ensureSecureInit();

    if (this.useEncryption && this.isSecureInitialized) {
      console.log(`🔐 Making encrypted GET request to: ${endpoint}`);
      return await secureApi.secureGet(endpoint);
    } else {
      console.log(`📡 Making regular GET request to: ${endpoint}`);
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      const response = await axios.get(url, config);
      return response.data;
    }
  }

  // Generic method to handle both encrypted and non-encrypted POST requests
  async post(endpoint: string, data?: unknown, config?: Record<string, unknown>): Promise<unknown> {
    await this.ensureSecureInit();

    if (this.useEncryption && this.isSecureInitialized) {
      console.log(`🔐 Making encrypted POST request to: ${endpoint}`);
      return await secureApi.securePost(endpoint, data);
    } else {
      console.log(`📡 Making regular POST request to: ${endpoint}`);
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      const response = await axios.post(url, data, config);
      return response.data;
    }
  }

  // Enable encryption for this instance
  enableEncryption(): void {
    this.useEncryption = true;
    console.log('🔐 Encryption enabled for this API instance');
  }

  // Disable encryption for this instance
  disableEncryption(): void {
    this.useEncryption = false;
    console.log('📡 Encryption disabled for this API instance');
  }

  // Check if encryption is enabled and working
  isEncryptionActive(): boolean {
    return this.useEncryption && this.isSecureInitialized;
  }

  // Get current configuration
  getConfig() {
    return {
      baseURL: this.baseURL,
      useEncryption: this.useEncryption,
      isSecureInitialized: this.isSecureInitialized,
    };
  }
}

// Create different instances for different use cases
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Main hybrid API instance (starts with encryption disabled, can be enabled per route)
export const hybridApi = new HybridApiService({ 
  baseURL: backendUrl, 
  useEncryption: false 
});

// Secure-first API instance (starts with encryption enabled)
export const secureFirstApi = new HybridApiService({ 
  baseURL: backendUrl, 
  useEncryption: true 
});

// Legacy API instance (always uses regular axios calls)
export const legacyApi = new HybridApiService({ 
  baseURL: backendUrl, 
  useEncryption: false 
});

// Export the class for creating custom instances
export { HybridApiService }; 
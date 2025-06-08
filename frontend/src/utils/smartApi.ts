import axios from 'axios';
import { isEndpointEncrypted } from './migrationConfig';
import { secureApi } from './secureApi';

// Smart API service that automatically chooses encryption per endpoint
class SmartApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Helper function to convert FormData to regular object
  private formDataToObject(formData: FormData): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    
    console.log('🔐 Smart API: Converting FormData, entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`🔐 Smart API: FormData entry - ${key}:`, value);
      
      if (value instanceof File) {
        // For files, we'll convert to base64 string
        obj[key] = {
          type: 'file',
          name: value.name,
          size: value.size,
          lastModified: value.lastModified,
          // Note: In a real implementation, you'd convert file to base64
          // For now, we'll just include file metadata
          data: `[File: ${value.name}]`
        };
        console.log(`🔐 Smart API: Converted file ${key}:`, obj[key]);
      } else {
        obj[key] = value;
        console.log(`🔐 Smart API: Converted field ${key}:`, value);
      }
    }
    
    console.log('🔐 Smart API: Final converted object:', obj);
    return obj;
  }

  // Smart GET request - automatically chooses encryption based on endpoint
  async get(endpoint: string, config?: Record<string, unknown>): Promise<unknown> {
    const shouldEncrypt = isEndpointEncrypted(endpoint);
    
    if (shouldEncrypt) {
      console.log(`🔐 Smart API: Using REAL encryption for ${endpoint}`);
      return this.makeEncryptedRequest('GET', endpoint, undefined, config);
    } else {
      console.log(`📡 Smart API: Using regular request for ${endpoint}`);
      return this.makeRegularRequest('GET', endpoint, undefined, config);
    }
  }

  // Smart POST request - automatically chooses encryption based on endpoint
  async post(endpoint: string, data?: unknown, config?: Record<string, unknown>): Promise<unknown> {
    const shouldEncrypt = isEndpointEncrypted(endpoint);
    
    if (shouldEncrypt) {
      console.log(`🔐 Smart API: Using REAL encryption for ${endpoint}`);
      return this.makeEncryptedRequest('POST', endpoint, data, config);
    } else {
      console.log(`📡 Smart API: Using regular request for ${endpoint}`);
      return this.makeRegularRequest('POST', endpoint, data, config);
    }
  }

  // Make encrypted request using the secure API system
  private async makeEncryptedRequest(method: string, endpoint: string, data?: unknown, config?: Record<string, unknown>): Promise<unknown> {
    try {
      // Initialize secure connection if needed
      console.log('🔐 Smart API: Initializing secure connection...');
      await secureApi.initialize();

      // For GET requests with headers (like auth token), we need to include them in the secure request
      if (method === 'GET') {
        // For encrypted GET, we'll send data as empty object but include headers info in the secure POST
        let requestData = {};
        if (config?.headers) {
          requestData = { headers: config.headers };
          console.log('🔐 Smart API: Including headers in encrypted GET request:', config.headers);
        }
        return await secureApi.securePost(endpoint, requestData);
      } else if (method === 'POST') {
        // For POST, include both data and any headers
        let requestData: Record<string, unknown> = {};
        
        // Handle different data types
        if (data instanceof FormData) {
          console.log('🔐 Smart API: Converting FormData to object for encryption');
          requestData = this.formDataToObject(data);
        } else if (data && typeof data === 'object') {
          requestData = { ...data as Record<string, unknown> };
        } else if (data) {
          requestData = { data };
        }
        
        // Include headers if provided
        if (config?.headers) {
          requestData.headers = config.headers;
          console.log('🔐 Smart API: Including headers in encrypted POST request:', config.headers);
        }
        
        console.log('🔐 Smart API: Final encrypted POST data:', requestData);
        return await secureApi.securePost(endpoint, requestData);
      }
      
      throw new Error(`Unsupported encrypted method: ${method}`);
    } catch (error) {
      console.error(`❌ Encrypted ${method} request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Make regular axios request
  private async makeRegularRequest(method: string, endpoint: string, data?: unknown, config?: Record<string, unknown>): Promise<unknown> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    if (method === 'GET') {
      const response = await axios.get(url, config);
      return response.data;
    } else if (method === 'POST') {
      const response = await axios.post(url, data, config);
      return response.data;
    }
    
    throw new Error(`Unsupported method: ${method}`);
  }

  // Get status of encryption for debugging
  getStatus() {
    return {
      secureApiStatus: secureApi.getSessionInfo(),
      baseURL: this.baseURL
    };
  }
}

// Create and export smart API instance
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
export const smartApi = new SmartApiService(backendUrl); 
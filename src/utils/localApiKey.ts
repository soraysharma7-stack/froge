/**
 * FROGÉ Local API Key Manager
 * 
 * Handles generation, persistence, headers, and validation for local FastAPI connections.
 * Standard format: `froge_local_sk_<16_hex_chars>`
 */

const LOCAL_KEY_STORAGE_KEY = 'froge_local_api_key';
const LOCAL_ENDPOINT_STORAGE_KEY = 'froge_local_fastapi_endpoint';

export const DEFAULT_LOCAL_KEY = 'froge_local_sk_7f89d3a1b2c4e5';
export const DEFAULT_LOCAL_ENDPOINT = 'http://127.0.0.1:8000';

export function generateLocalApiKey(): string {
  const chars = '0123456789abcdef';
  let hex = '';
  for (let i = 0; i < 16; i++) {
    hex += chars[Math.floor(Math.random() * chars.length)];
  }
  return `froge_local_sk_${hex}`;
}

export function getStoredLocalApiKey(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCAL_KEY;
  try {
    const stored = localStorage.getItem(LOCAL_KEY_STORAGE_KEY);
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
  } catch (e) {
    console.warn('Could not read local API key from storage', e);
  }
  return DEFAULT_LOCAL_KEY;
}

export function setStoredLocalApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_KEY_STORAGE_KEY, key.trim());
  } catch (e) {
    console.warn('Could not save local API key to storage', e);
  }
}

export function getStoredFastApiEndpoint(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCAL_ENDPOINT;
  try {
    const stored = localStorage.getItem(LOCAL_ENDPOINT_STORAGE_KEY);
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
  } catch (e) {
    console.warn('Could not read FastAPI endpoint from storage', e);
  }
  return DEFAULT_LOCAL_ENDPOINT;
}

export function setStoredFastApiEndpoint(endpoint: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_ENDPOINT_STORAGE_KEY, endpoint.trim());
  } catch (e) {
    console.warn('Could not save FastAPI endpoint to storage', e);
  }
}

export function isValidLocalApiKeyFormat(key: string): boolean {
  if (!key) return false;
  return key.startsWith('froge_local_sk_') && key.length >= 20;
}

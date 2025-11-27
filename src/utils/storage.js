/**
 * Storage adapter that mimics MMKV API but uses AsyncStorage
 * This provides compatibility with existing code while working reliably in Expo
 * Uses in-memory caching for fast reads (similar to MMKV's performance)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageAdapter {
  constructor(id = 'default') {
    this.id = id;
    this.prefix = `@storage_${id}:`;
    // In-memory cache for fast synchronous reads (like MMKV)
    this.cache = new Map();
    this.initialized = false;
  }

  // Initialize by loading all keys into cache
  async _ensureInitialized() {
    if (this.initialized) return;
    
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const storageKeys = allKeys.filter(key => key.startsWith(this.prefix));
      
      if (storageKeys.length > 0) {
        const items = await AsyncStorage.multiGet(storageKeys);
        items.forEach(([key, value]) => {
          const cacheKey = key.replace(this.prefix, '');
          this.cache.set(cacheKey, value);
        });
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Storage initialization error:', error);
      this.initialized = true; // Continue anyway
    }
  }

  // Synchronous get (from cache) - mimics MMKV's sync API
  getString(key) {
    return this.cache.get(key) || null;
  }

  getNumber(key) {
    const value = this.cache.get(key);
    if (value === null || value === undefined) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  getBoolean(key) {
    const value = this.cache.get(key);
    if (value === null || value === undefined) return null;
    return value === 'true';
  }

  // Asynchronous set (updates cache and storage)
  async set(key, value) {
    const stringValue = typeof value === 'string' ? value : String(value);
    this.cache.set(key, stringValue);
    
    try {
      await AsyncStorage.setItem(`${this.prefix}${key}`, stringValue);
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error);
      // Remove from cache on error
      this.cache.delete(key);
      throw error;
    }
  }

  // Synchronous set (fire and forget for performance)
  setSync(key, value) {
    const stringValue = typeof value === 'string' ? value : String(value);
    this.cache.set(key, stringValue);
    
    // Async write in background
    AsyncStorage.setItem(`${this.prefix}${key}`, stringValue).catch(error => {
      console.error(`Storage setSync error for key ${key}:`, error);
      this.cache.delete(key);
    });
  }

  async delete(key) {
    this.cache.delete(key);
    try {
      await AsyncStorage.removeItem(`${this.prefix}${key}`);
    } catch (error) {
      console.error(`Storage delete error for key ${key}:`, error);
    }
  }

  async clearAll() {
    this.cache.clear();
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const storageKeys = allKeys.filter(key => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(storageKeys);
    } catch (error) {
      console.error('Storage clearAll error:', error);
    }
  }
}

// Create storage instances (mimics MMKV pattern)
export const createStorage = (id) => {
  const storage = new StorageAdapter(id);
  // Initialize cache in background
  storage._ensureInitialized();
  return storage;
};

// Export default storage instance
export default createStorage;


/**
 * Storage Interface
 *
 * Abstracts file system operations to enable dependency injection
 * and easier testing without mocking node:fs.
 */

/**
 * Simple key-value storage interface for JSON data.
 * Implementations can use file system, memory, or other backends.
 */
export interface KeyValueStorage {
  /**
   * Read data from storage by key.
   * @returns The stored string data, or null if not found
   */
  read(key: string): string | null;

  /**
   * Write data to storage.
   * @param key - Storage key (e.g., filename)
   * @param data - String data to store (typically JSON)
   */
  write(key: string, data: string): void;

  /**
   * Check if a key exists in storage.
   */
  exists(key: string): boolean;
}

/**
 * Configuration for file-based storage
 */
export interface StorageConfig {
  /** Base directory for file storage */
  dataDir: string;
}

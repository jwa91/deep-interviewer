/**
 * In-Memory Storage Implementation
 *
 * Used for testing - stores data in a Map instead of the file system.
 * No mocking of node:fs required when using this implementation.
 */

import type { KeyValueStorage } from "./types.js";

/**
 * In-memory storage implementation for testing.
 * Data is stored in a Map and is not persisted.
 */
export class InMemoryStorage implements KeyValueStorage {
  private data = new Map<string, string>();

  read(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  write(key: string, data: string): void {
    this.data.set(key, data);
  }

  exists(key: string): boolean {
    return this.data.has(key);
  }

  /**
   * Clear all stored data. Useful for test cleanup.
   */
  clear(): void {
    this.data.clear();
  }

  /**
   * Get all stored keys. Useful for test assertions.
   */
  keys(): string[] {
    return Array.from(this.data.keys());
  }

  /**
   * Pre-populate storage with data. Useful for test setup.
   */
  seed(entries: Record<string, string>): void {
    for (const [key, value] of Object.entries(entries)) {
      this.data.set(key, value);
    }
  }
}

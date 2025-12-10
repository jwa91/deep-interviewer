/**
 * Node.js File System Storage Implementation
 *
 * Wraps node:fs operations to implement the KeyValueStorage interface.
 * Used in production for persisting data to the file system.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { KeyValueStorage, StorageConfig } from "./types.js";

/**
 * File-based storage implementation using Node.js fs module.
 */
export class NodeFileStorage implements KeyValueStorage {
  private readonly dataDir: string;

  constructor(config: StorageConfig) {
    this.dataDir = config.dataDir;
  }

  read(key: string): string | null {
    const filePath = this.getFilePath(key);
    try {
      if (!existsSync(filePath)) {
        return null;
      }
      return readFileSync(filePath, "utf-8");
    } catch (error) {
      console.error(`Failed to read ${key}:`, error);
      return null;
    }
  }

  write(key: string, data: string): void {
    const filePath = this.getFilePath(key);
    try {
      writeFileSync(filePath, data);
    } catch (error) {
      console.error(`Failed to write ${key}:`, error);
    }
  }

  exists(key: string): boolean {
    return existsSync(this.getFilePath(key));
  }

  private getFilePath(key: string): string {
    return join(this.dataDir, key);
  }
}

/**
 * Create a NodeFileStorage instance with default config from environment.
 */
export function createNodeFileStorage(): NodeFileStorage {
  const dataDir = process.env.DATA_DIR || "./data";
  return new NodeFileStorage({ dataDir });
}

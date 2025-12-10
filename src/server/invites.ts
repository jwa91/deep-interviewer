/**
 * Invite Store
 *
 * Manages invite codes for interview sessions.
 * Uses dependency injection for storage to enable easy testing.
 */

import type { KeyValueStorage } from "./storage/index.js";
import { createNodeFileStorage } from "./storage/index.js";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface Invite {
	code: string;
	sessionId?: string;
	createdAt: string;
}

export interface InviteStore {
	createInvite(): string;
	getInvite(code: string): Invite | undefined;
	linkSessionToInvite(code: string, sessionId: string): void;
	listInvites(): Invite[];
}

// ═══════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════

const INVITES_FILE = "invites.json";

/**
 * Creates an invite store with the given storage backend.
 *
 * @param storage - Storage implementation (defaults to file storage)
 * @returns InviteStore instance
 *
 * @example
 * // Production usage
 * const store = createInviteStore();
 *
 * @example
 * // Test usage
 * const store = createInviteStore(new InMemoryStorage());
 */
export function createInviteStore(
	storage: KeyValueStorage = createNodeFileStorage(),
): InviteStore {
	// In-memory cache
	let invites = new Map<string, Invite>();
	let initialized = false;

	function ensureInitialized(): void {
		if (initialized) {
			return;
		}

		try {
			const data = storage.read(INVITES_FILE);
			if (data) {
				const parsed = JSON.parse(data);
				invites = new Map(Object.entries(parsed));
			}
		} catch (error) {
			console.error("Failed to load invites:", error);
		}
		initialized = true;
	}

	function saveInvites(): void {
		try {
			const data = Object.fromEntries(invites);
			storage.write(INVITES_FILE, JSON.stringify(data, null, 2));
		} catch (error) {
			console.error("Failed to save invites:", error);
		}
	}

	return {
		createInvite(): string {
			ensureInitialized();

			// Generate random 6-char code (uppercase alphanumeric)
			const code = Math.random().toString(36).substring(2, 8).toUpperCase();

			// Ensure uniqueness (extremely unlikely to collide but good practice)
			if (invites.has(code)) {
				return this.createInvite();
			}

			const invite: Invite = {
				code,
				createdAt: new Date().toISOString(),
			};

			invites.set(code, invite);
			saveInvites();

			return code;
		},

		getInvite(code: string): Invite | undefined {
			ensureInitialized();
			return invites.get(code.toUpperCase()); // Case-insensitive lookup
		},

		linkSessionToInvite(code: string, sessionId: string): void {
			ensureInitialized();
			const upperCode = code.toUpperCase();
			const invite = invites.get(upperCode);

			if (invite) {
				invites.set(upperCode, { ...invite, sessionId });
				saveInvites();
			}
		},

		listInvites(): Invite[] {
			ensureInitialized();
			return Array.from(invites.values());
		},
	};
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT INSTANCE (for backwards compatibility during migration)
// ═══════════════════════════════════════════════════════════════

let defaultStore: InviteStore | null = null;

function getDefaultStore(): InviteStore {
	if (!defaultStore) {
		defaultStore = createInviteStore();
	}
	return defaultStore;
}

// Legacy exports - use these during migration, then switch to DI
export const createInvite = () => getDefaultStore().createInvite();
export const getInvite = (code: string) => getDefaultStore().getInvite(code);
export const linkSessionToInvite = (code: string, sessionId: string) =>
	getDefaultStore().linkSessionToInvite(code, sessionId);
export const listInvites = () => getDefaultStore().listInvites();

// For testing - resets the default store
export function _resetForTesting(): void {
	defaultStore = null;
}

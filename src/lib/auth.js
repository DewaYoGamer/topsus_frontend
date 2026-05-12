import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'topsus3.auth';

/** @typedef {{token:string, role:string, id:number, nama:string}} AuthState */

function load() {
  if (!browser) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function createAuth() {
  /** @type {import('svelte/store').Writable<AuthState|null>} */
  const store = writable(load());

  store.subscribe((value) => {
    if (!browser) return;
    if (value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  });

  return {
    subscribe: store.subscribe,
    set: store.set,
    login(data) {
      store.set({
        token: data.access_token,
        role: data.role,
        id: data.id,
        nama: data.nama
      });
    },
    /**
     * Logout: tell backend to blacklist the JWT, then clear local state.
     * Import is deferred to avoid the api.js -> auth.js -> api.js cycle at module init.
     */
    async logout() {
      try {
        const { api } = await import('./api.js');
        await api('/auth/logout', { method: 'POST' });
      } catch {
        // Network errors / already-expired tokens: ignore, still clear state.
      }
      store.set(null);
    },
    /** Clear local state only (used when server already invalidated the session). */
    clear() {
      store.set(null);
    }
  };
}

export const auth = createAuth();

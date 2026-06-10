import { getCurrentUserId } from "./apiClient";

const CACHE_PREFIX = "shmallet-cache";
const DEFAULT_TTL_MS = 5 * 60 * 1000;

const memoryCache = new Map();
const inFlightRequests = new Map();

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function buildStorageKey(resourceKey, userId) {
  return `${CACHE_PREFIX}:${userId}:${resourceKey}`;
}

function isFresh(entry) {
  return Boolean(entry) && entry.expiresAt > Date.now();
}

function readStoredEntry(storageKey) {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const rawEntry = storage.getItem(storageKey);

  if (!rawEntry) {
    return null;
  }

  try {
    const parsedEntry = JSON.parse(rawEntry);

    if (!parsedEntry || !Array.isArray(parsedEntry.data) || typeof parsedEntry.expiresAt !== "number") {
      storage.removeItem(storageKey);
      return null;
    }

    if (!isFresh(parsedEntry)) {
      storage.removeItem(storageKey);
      return null;
    }

    return parsedEntry;
  } catch {
    storage.removeItem(storageKey);
    return null;
  }
}

function writeEntry(storageKey, data, ttlMs = DEFAULT_TTL_MS) {
  const entry = {
    data,
    expiresAt: Date.now() + ttlMs,
  };

  memoryCache.set(storageKey, entry);

  const storage = getStorage();

  if (!storage) {
    return entry;
  }

  try {
    storage.setItem(storageKey, JSON.stringify(entry));
  } catch {
    storage.removeItem(storageKey);
  }

  return entry;
}

async function getScopedStorageKey(resourceKey) {
  const userId = await getCurrentUserId();
  return buildStorageKey(resourceKey, userId);
}

export async function getCachedCollection(resourceKey, fetcher, options = {}) {
  const { ttlMs = DEFAULT_TTL_MS, force = false } = options;
  const storageKey = await getScopedStorageKey(resourceKey);

  if (!force) {
    const memoryEntry = memoryCache.get(storageKey);

    if (isFresh(memoryEntry)) {
      return memoryEntry.data;
    }

    const storedEntry = readStoredEntry(storageKey);

    if (storedEntry) {
      memoryCache.set(storageKey, storedEntry);
      return storedEntry.data;
    }
  }

  if (inFlightRequests.has(storageKey)) {
    return inFlightRequests.get(storageKey);
  }

  const request = (async () => {
    try {
      const data = await fetcher();
      writeEntry(storageKey, Array.isArray(data) ? data : [], ttlMs);
      return Array.isArray(data) ? data : [];
    } finally {
      inFlightRequests.delete(storageKey);
    }
  })();

  inFlightRequests.set(storageKey, request);
  return request;
}

export async function updateCachedCollection(resourceKey, updater, options = {}) {
  const { ttlMs = DEFAULT_TTL_MS } = options;
  const storageKey = await getScopedStorageKey(resourceKey);
  const currentEntry = memoryCache.get(storageKey) || readStoredEntry(storageKey);
  const currentData = Array.isArray(currentEntry?.data) ? currentEntry.data : [];
  const nextData = updater(currentData);

  writeEntry(storageKey, Array.isArray(nextData) ? nextData : [], ttlMs);
}

export async function invalidateCachedCollection(resourceKey) {
  const storageKey = await getScopedStorageKey(resourceKey);
  memoryCache.delete(storageKey);
  inFlightRequests.delete(storageKey);

  const storage = getStorage();

  if (storage) {
    storage.removeItem(storageKey);
  }
}

export async function clearAllCachedCollections() {
  const userId = await getCurrentUserId();
  const storage = getStorage();
  const userPrefix = `${CACHE_PREFIX}:${userId}:`;

  for (const cacheKey of memoryCache.keys()) {
    if (cacheKey.startsWith(userPrefix)) {
      memoryCache.delete(cacheKey);
    }
  }

  for (const requestKey of inFlightRequests.keys()) {
    if (requestKey.startsWith(userPrefix)) {
      inFlightRequests.delete(requestKey);
    }
  }

  if (!storage) {
    return;
  }

  const keysToRemove = [];

  for (let index = 0; index < storage.length; index += 1) {
    const storageKey = storage.key(index);

    if (storageKey?.startsWith(userPrefix)) {
      keysToRemove.push(storageKey);
    }
  }

  keysToRemove.forEach((storageKey) => storage.removeItem(storageKey));
}
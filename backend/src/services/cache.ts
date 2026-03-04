import { SrvRecord } from "node:dns";

interface CacheEntry {
    longUrl: string;
    expiresAt: Date | null;
}

const redirectCache = new Map<string, CacheEntry>();

export function getFromCache(shortCode: string): CacheEntry | null {
    const entry = redirectCache.get(shortCode);

    console.log("redirectCache, new Map = ", redirectCache);

    if(!entry) {
        return null;
    }

    // If expired, remove from cache
    if (entry.expiresAt && entry.expiresAt.getTime() < Date.now()) {
        redirectCache.delete(shortCode);
        return null;
    }
    
    return entry;
}

export function setCache(
    shortCode: string,
    longUrl: string,
    expiresAt: Date | null
) : void {
    redirectCache.set(shortCode, { longUrl, expiresAt});
}

export function deleteFromCache(shortCode: string): void {
    redirectCache.delete(shortCode);
}
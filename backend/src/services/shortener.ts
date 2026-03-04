import e from 'express';
import db from '../db';
import { encodeBase62 } from '../utils/base62';
import { deleteFromCache, getFromCache, setCache } from './cache';

export interface CreateShortUrlInput {
    longUrl: string;
    customAlias?: string;
    expiresAt?: Date;
}

export interface ShortUrlRecord {
    id: number;
    shortCode: string;
    longUrl: string;
    expiresAt: Date | null;
    createdAt: Date;
}

const CUSTOM_ALIAS_REGEX = /^[a-zA-Z0-9_-]{3,50}$/;

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    } 
}

function isValidFutureDate(date: Date): boolean {
    return date.getTime() > Date.now();
}

export function createShortUrl(input: CreateShortUrlInput): ShortUrlRecord {
    const { longUrl, customAlias, expiresAt } = input;

    // 1. Validate long URL
    if(!isValidUrl(longUrl)) {
        throw new Error("Invalid long URL");
    }

    // 2. Validate expiry if provided
    if(expiresAt && !isValidFutureDate(expiresAt)) {
        throw new Error("Expirey date must be in the future");
    }

    // 3. If custom alias is provided, validate it
    if(customAlias) {
        if(!CUSTOM_ALIAS_REGEX.test(customAlias)) {
            throw new Error("Custom alias must be 3–50 characters and only contain letters, numbers, _ or -")
        }

        const existing = db.prepare(
            `
            SELECT id FROM urls
            WHERE short_code = ? AND is_deleted = 0
            `
        ).get(customAlias) as { id: number } | undefined;

        if(existing) {
            throw new Error("Custom alias is already in use");
        }

        // Insert directly with custom alias
        const result = db.prepare(
            `
            INSERT INTO urls (short_code, long_url, expires_at)
            VALUES (?, ?, ?)
            `
        ).run(customAlias, longUrl, expiresAt ? expiresAt.toISOString() : null);

        const id = Number(result.lastInsertRowid);
        
        return {
            id,
            shortCode: customAlias,
            longUrl,
            expiresAt: expiresAt ?? null,
            createdAt: new Date()
        };
    }

    // 4. No custom alias → auto-generate using Base62
    
    // Insert placeholder row to get ID
    const insertResult = db.prepare(
        `
        INSERT INTO urls (short_code, long_url, expires_at)
        VALUES ('', ?, ?)
        `
    ).run(longUrl,expiresAt ? expiresAt.toISOString() : null);

    const id = Number(insertResult.lastInsertRowid)
    const shortCode = encodeBase62(id);

    // Update with generated short code 
    db.prepare(
        `
        UPDATE urls
        SET short_code = ?
        WHERE id = ?
        `
    ).run(shortCode, id);

    return {
        id,
        shortCode,
        longUrl,
        expiresAt: expiresAt ?? null,
        createdAt: new Date(),
    }
}


// -=-=-=-=-=-=-=-=-=-=-= HOTPATH =-=-=-=-=-=-=-=-=-=-=-=-

export interface ResolveResult {
    longUrl: string;
}

export function resolveShortCode(shortCode: string): ResolveResult {
    // 1. Try cache first
    const cached = getFromCache(shortCode);
    if (cached) {
        // console.log(`[CACHE HIT] shortCode=${shortCode}`);
        return { longUrl: cached.longUrl }
    }

    // console.log(`[DB HIT] shortCode=${shortCode}`);
    
    // 2. Fall back to DB
    const row = db.prepare(
        `
        SELECT long_url, expires_at, is_deleted
        FROM urls 
        WHERE short_code = ? 
        LIMIT 1
        `
    ).get(shortCode) as 
    | {
        long_url: string;
        expires_at: string | null;
        is_deleted: number;
    } 
    | undefined;
    // *above usage of union ( | ) is also for style/readability purpose*

    if(!row) {
        throw new Error("Short URL not found");
    }

    if (row.is_deleted === 1) {
        throw new Error("This short URL has been deleted");
    }

    let expiresAt: Date | null = null;

    if (row.expires_at) {
        expiresAt = new Date(row.expires_at);

        if (expiresAt.getTime() < Date.now()) {
            throw new Error("This short URL has expired")
        }
    }

    // 3. Store in cache
    setCache(shortCode, row.long_url, expiresAt)

    return {
        longUrl: row.long_url,
    };
}


export function deleteShortUrl(shortCode: string): void {
    // Check existence 
    const row = db
    .prepare(
        `
        SELECT is_deleted 
        FROM urls 
        WHERE short_code = ?
        LIMIT 1
        `
    )
    .get(shortCode) as 
    | { is_deleted: number; }
    | undefined;

    if (!row) {
        throw new Error("Short URL not found")
    }

    if (row.is_deleted === 1) {
        throw new Error("Short URL already deleted")
    }

    // Soft delete
    db.prepare(
        `
        UPDATE urls
        SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP 
        WHERE short_code = ?

        `
    ).run(shortCode);

    // Invalidate cache
    deleteFromCache(shortCode);
}

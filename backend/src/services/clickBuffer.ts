import db from "../db";

interface ClickEvent {
    shortCode: string;
    timestamp: number;
}

const CLICK_BUFFER: ClickEvent[] = [];

/**
 * Add a click event to the in-memory buffer.
 * This is non-blocking and extremely fast.
 */
export function recordClick(shortCode: string): void {
    console.log(`Recording click for short code: ${shortCode}`);
    CLICK_BUFFER.push({
        shortCode,
        timestamp: Date.now(),
    });
    console.log(`Current click buffer size: ${CLICK_BUFFER.length}`);
    console.log(`Current click buffer contents: ${JSON.stringify(CLICK_BUFFER)}`);
}

/**
 * Get and clear buffered clicks.
 * Used later by a background worker.
 */
export function drainClickBuffer(): ClickEvent[] {
    const events = CLICK_BUFFER.splice(0, CLICK_BUFFER.length);
    return events;
}

/**
 * Flush click buffer to database in batches.
 */
function flushClicksToDatabase(): void {
    const events = drainClickBuffer();

    if (events.length === 0) return;

    const insert = db.prepare(`
    INSERT INTO clicks (short_code, clicked_at)
    VALUES (?, ?)
  `);

    const transaction = db.transaction((batch: typeof events) => {
        for (const event of batch) {
            insert.run(event.shortCode, new Date(event.timestamp).toISOString());
        }
    });

    transaction(events);

    console.log(`[CLICK FLUSH] inserted ${events.length} events`);
}

/**
 * Start background click flusher.
 * Runs every 5 seconds.
 */
export function startClickFlusher(): void {
    setInterval(() => {
        try {
            flushClicksToDatabase();
        } catch (error) {
            console.error("Click flush failed:", error);
        }
    }, 5000);
}

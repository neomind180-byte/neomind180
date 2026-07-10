/**
 * Client-side application logger for NeoMind180.
 *
 * Captures auth failures, fetch timeouts, API errors, and session events
 * and persists them to a Supabase `app_logs` table via a lightweight API endpoint.
 * This provides diagnostic visibility beyond Supabase's free-tier current-day-only logs.
 *
 * Events are batched (max 10 per flush, 60s interval) to minimize noise.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEvent {
  level: LogLevel;
  event: string;
  message: string;
  page?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

const LOG_BATCH_SIZE = 10;
const LOG_FLUSH_INTERVAL = 60_000; // 1 minute
const MAX_QUEUE_SIZE = 100; // Prevent memory leaks

class AppLogger {
  private queue: LogEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isFlushing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.flushTimer = setInterval(() => this.flush(), LOG_FLUSH_INTERVAL);

      // Flush on page unload to capture final events
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  private getPage(): string {
    if (typeof window === 'undefined') return 'server';
    return window.location.pathname;
  }

  info(event: string, message: string, metadata?: Record<string, unknown>, userId?: string) {
    this.enqueue('info', event, message, metadata, userId);
  }

  warn(event: string, message: string, metadata?: Record<string, unknown>, userId?: string) {
    this.enqueue('warn', event, message, metadata, userId);
  }

  error(event: string, message: string, metadata?: Record<string, unknown>, userId?: string) {
    this.enqueue('error', event, message, metadata, userId);
  }

  private enqueue(
    level: LogLevel,
    event: string,
    message: string,
    metadata?: Record<string, unknown>,
    userId?: string
  ) {
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      // Drop oldest events to prevent memory leak
      this.queue.shift();
    }

    this.queue.push({
      level,
      event,
      message,
      page: this.getPage(),
      userId,
      metadata,
      timestamp: new Date().toISOString(),
    });

    if (this.queue.length >= LOG_BATCH_SIZE) {
      this.flush();
    }
  }

  async flush() {
    if (this.isFlushing || this.queue.length === 0 || typeof window === 'undefined') return;

    this.isFlushing = true;
    const batch = this.queue.splice(0, LOG_BATCH_SIZE);

    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
      });

      if (!res.ok) {
        // Re-queue on failure, but only if under limit
        if (this.queue.length + batch.length <= MAX_QUEUE_SIZE) {
          this.queue.unshift(...batch);
        }
      }
    } catch {
      // Re-queue on network failure
      if (this.queue.length + batch.length <= MAX_QUEUE_SIZE) {
        this.queue.unshift(...batch);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// Singleton instance
export const appLogger = new AppLogger();

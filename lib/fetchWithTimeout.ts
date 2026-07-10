/**
 * fetchWithTimeout — A resilient fetch wrapper with timeout protection.
 *
 * Prevents the UI from hanging indefinitely when API calls stall due to
 * network issues, stale auth tokens, or slow server responses.
 */

export class FetchTimeoutError extends Error {
  public readonly url: string;
  public readonly timeoutMs: number;

  constructor(url: string, timeoutMs: number) {
    super(`Request to ${url} timed out after ${timeoutMs}ms`);
    this.name = 'FetchTimeoutError';
    this.url = url;
    this.timeoutMs = timeoutMs;
  }
}

export class FetchAuthError extends Error {
  public readonly status: number;

  constructor(status: number, message?: string) {
    super(message || `Authentication failed (HTTP ${status})`);
    this.name = 'FetchAuthError';
    this.status = status;
  }
}

interface FetchWithTimeoutOptions extends RequestInit {
  /** Timeout in milliseconds. Defaults to 30000 (30s). */
  timeoutMs?: number;
  /** If true, throws FetchAuthError on 401/403 responses instead of returning them. */
  throwOnAuthError?: boolean;
}

export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeoutMs = 30000, throwOnAuthError = false, ...fetchOptions } = options;

  const controller = new AbortController();

  // If the caller already provided a signal, chain it
  if (fetchOptions.signal) {
    fetchOptions.signal.addEventListener('abort', () => controller.abort());
  }

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    if (throwOnAuthError && (response.status === 401 || response.status === 403)) {
      throw new FetchAuthError(response.status);
    }

    return response;
  } catch (error) {
    if (error instanceof FetchAuthError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new FetchTimeoutError(url, timeoutMs);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

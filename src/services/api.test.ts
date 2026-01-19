import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ApiService from '@/services/api';

describe('ApiService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns parsed JSON on success', async () => {
    const api = new ApiService('http://test', 1000);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok' }),
    } as Response);

    await expect(api.health()).resolves.toEqual({ status: 'ok' });
  });

  it('wraps network errors with actionable message', async () => {
    const api = new ApiService('http://broken', 1000);
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(api.health()).rejects.toThrow(/Network error/);
  });

  it('throws on non-200 responses', async () => {
    const api = new ApiService('http://test', 1000);
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: async () => ({}),
    } as Response);

    await expect(api.health()).rejects.toThrow(/HTTP 500/);
  });
});

import type { APIRequestContext, APIResponse } from '@playwright/test';

/** Everything a test needs to assert on a single HTTP exchange. */
export interface ApiResponse<TBody = unknown> {
  readonly status: number;
  readonly ok: boolean;
  readonly headers: Readonly<Record<string, string>>;
  /** Parsed JSON body, or the raw text when the server did not send JSON. */
  readonly body: TBody;
  /** Wall-clock time between sending the request and receiving the full response. */
  readonly durationMs: number;
  readonly request: { readonly method: string; readonly url: string };
}

/** swapi.tech resources covered by the suite. */
export type SwapiResource = 'people' | 'planets' | 'films';

/** Query parameters accepted by the list endpoints. */
export type QueryParams = Readonly<Record<string, string | number>>;

/**
 * Thin, typed wrapper around Playwright's `APIRequestContext` for swapi.tech.
 *
 * Responsibilities:
 *  - Build endpoint URLs from resource names so tests never hard-code paths.
 *  - Measure response time for every call.
 *  - Parse JSON when possible, otherwise expose the raw text (error pages are HTML).
 *
 * It deliberately does **not** assert anything; assertions live in
 * `src/api/assertions` so the client stays reusable.
 */
export class SwapiClient {
  private static readonly BASE_PATH = '/api';

  public constructor(private readonly request: APIRequestContext) {}

  /** GET `/api/<resource>` with optional query parameters (`page`, `limit`, `name`...). */
  public async list(resource: SwapiResource, params: QueryParams = {}): Promise<ApiResponse> {
    return this.get(SwapiClient.pathFor(resource), params);
  }

  /** GET `/api/<resource>/<id>`. `id` is a string so tests can send malformed values. */
  public async getById(resource: SwapiResource, id: string): Promise<ApiResponse> {
    return this.get(`${SwapiClient.pathFor(resource)}/${encodeURIComponent(id)}`);
  }

  /**
   * POST a raw string body to `/api/<resource>`.
   * swapi.tech is read-only, so this only exists to exercise 400 handling:
   * malformed JSON is rejected by the server's body parser.
   */
  public async postRaw(resource: SwapiResource, rawBody: string): Promise<ApiResponse> {
    const url = SwapiClient.pathFor(resource);
    const startedAt = Date.now();
    const response = await this.request.post(url, {
      data: rawBody,
      headers: { 'Content-Type': 'application/json' },
    });
    return SwapiClient.toApiResponse('POST', response, startedAt);
  }

  private async get(url: string, params: QueryParams = {}): Promise<ApiResponse> {
    const startedAt = Date.now();
    const response = await this.request.get(url, { params });
    return SwapiClient.toApiResponse('GET', response, startedAt);
  }

  private static pathFor(resource: SwapiResource): string {
    return `${SwapiClient.BASE_PATH}/${resource}`;
  }

  private static async toApiResponse(
    method: string,
    response: APIResponse,
    startedAt: number,
  ): Promise<ApiResponse> {
    const text = await response.text();
    const durationMs = Date.now() - startedAt;
    return {
      status: response.status(),
      ok: response.ok(),
      headers: response.headers(),
      body: SwapiClient.parseBody(text),
      durationMs,
      request: { method, url: response.url() },
    };
  }

  private static parseBody(text: string): unknown {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }
}

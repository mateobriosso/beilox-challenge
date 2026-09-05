import dotenv from 'dotenv';

// Load the local `.env` (git-ignored). On CI the variables come from the runner.
dotenv.config({ quiet: true });

/** Strongly typed view of the environment variables the framework depends on. */
export interface Env {
  readonly isCI: boolean;
  readonly uiBaseUrl: string;
  readonly apiBaseUrl: string;
  /** Upper bound, in milliseconds, for an API response to be considered healthy. */
  readonly apiMaxResponseMs: number;
}

const DEFAULTS = {
  uiBaseUrl: 'https://www.centraldepasajes.com.ar',
  apiBaseUrl: 'https://www.swapi.tech',
  apiMaxResponseMs: 3000,
} as const;

function readString(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value === undefined || value === '' ? fallback : value;
}

function readPositiveInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (raw === undefined || raw === '') {
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer, received "${raw}"`);
  }
  return parsed;
}

export const env: Env = {
  isCI: Boolean(process.env.CI),
  uiBaseUrl: readString('UI_BASE_URL', DEFAULTS.uiBaseUrl),
  apiBaseUrl: readString('API_BASE_URL', DEFAULTS.apiBaseUrl),
  apiMaxResponseMs: readPositiveInt('API_MAX_RESPONSE_MS', DEFAULTS.apiMaxResponseMs),
};

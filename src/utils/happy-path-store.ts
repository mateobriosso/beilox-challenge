import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

/** Folder where happy-path bodies are persisted for future contract validations. */
export const HAPPY_PATH_DIR = path.resolve(process.cwd(), 'resource', 'api');

/** Shape of every file written by {@link saveHappyPathBody}. */
export interface HappyPathRecord {
  readonly savedAt: string;
  readonly request: { readonly method: string; readonly url: string };
  readonly status: number;
  readonly body: unknown;
}

/**
 * Keys that change on every call (server clock) and would otherwise make the
 * stored file differ on each run without any real contract change.
 */
const VOLATILE_TOP_LEVEL_KEYS: readonly string[] = ['timestamp'];

function stripVolatile(body: unknown): unknown {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return body;
  }
  const entries = Object.entries(body as Record<string, unknown>).filter(
    ([key]) => !VOLATILE_TOP_LEVEL_KEYS.includes(key),
  );
  return Object.fromEntries(entries);
}

function sameContract(existing: HappyPathRecord, incoming: Omit<HappyPathRecord, 'savedAt'>): boolean {
  return (
    existing.status === incoming.status &&
    JSON.stringify(stripVolatile(existing.body)) === JSON.stringify(stripVolatile(incoming.body))
  );
}

async function readExisting(filePath: string): Promise<HappyPathRecord | undefined> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as HappyPathRecord;
  } catch {
    return undefined;
  }
}

/**
 * Persists a happy-path response under `resource/api/<name>.json`.
 *
 * The file is only rewritten when the body (ignoring volatile keys) actually
 * changed, so re-running the suite does not produce noisy diffs in git.
 *
 * @returns the absolute path of the stored file.
 */
export async function saveHappyPathBody(
  name: string,
  record: Omit<HappyPathRecord, 'savedAt'>,
): Promise<string> {
  await mkdir(HAPPY_PATH_DIR, { recursive: true });
  const filePath = path.join(HAPPY_PATH_DIR, `${name}.json`);

  const existing = await readExisting(filePath);
  const unchanged = existing !== undefined && sameContract(existing, record);

  if (!unchanged) {
    // Pick fields explicitly: callers usually pass a full `ApiResponse`, and headers /
    // timings are volatile noise that does not belong in a contract snapshot.
    const payload: HappyPathRecord = {
      savedAt: new Date().toISOString(),
      request: record.request,
      status: record.status,
      body: record.body,
    };
    await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  }
  return filePath;
}

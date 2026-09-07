import { test } from '@playwright/test';
import type { KnownDefect } from '../data/known-defects';

/** Annotation type consumed by `src/reporters/known-defects.reporter.ts`. */
export const KNOWN_DEFECT_ANNOTATION = 'known-defect';

/**
 * Declares that the current test exists because of an open defect.
 *
 * Call it first thing in the test body: the annotation shows up next to the
 * test in the HTML report and feeds the end-of-run summary, so a green tally
 * can never hide how many defects the suite is currently tolerating.
 */
export function annotateKnownDefect(defect: KnownDefect): void {
  test.info().annotations.push({
    type: KNOWN_DEFECT_ANNOTATION,
    description: `#${String(defect.issue)} — ${defect.summary} [${defect.coverage}]`,
  });
}

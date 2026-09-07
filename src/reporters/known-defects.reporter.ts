import { appendFileSync } from 'node:fs';
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { KNOWN_DEFECT_ANNOTATION } from '../utils/known-defects';

interface Row {
  test: string;
  /** Issue number, kept apart so the report is ordered by it and not by finish time. */
  issue: number;
  defect: string;
  /** `expected` while the defect is still there, `unexpected` once it is fixed. */
  outcome: ReturnType<TestCase['outcome']>;
}

/**
 * Prints, at the end of every run, how many known defects the suite is
 * tolerating. Without it the tally reads "27 passed" and says nothing about the
 * three open issues the suite deliberately works around.
 */
export default class KnownDefectsReporter implements Reporter {
  private readonly rows: Row[] = [];

  public onTestEnd(test: TestCase, _result: TestResult): void {
    const annotation = test.annotations.find((a) => a.type === KNOWN_DEFECT_ANNOTATION);
    if (annotation?.description !== undefined) {
      this.rows.push({
        test: `${test.parent.title} › ${test.title}`,
        issue: Number.parseInt(annotation.description.replace('#', ''), 10),
        defect: annotation.description,
        outcome: test.outcome(),
      });
    }
  }

  public onEnd(): void {
    if (this.rows.length === 0) return;

    const sorted = [...this.rows].sort((a, b) => a.issue - b.issue);
    const issues = sorted.map((r) => `#${String(r.issue)}`).join(', ');
    const fixed = sorted.filter((r) => r.outcome === 'unexpected');

    console.log(`\nKnown defects tolerated by this run: ${String(sorted.length)} (${issues})`);
    console.table(sorted.map(({ issue: _issue, ...rest }) => rest));
    if (fixed.length > 0) {
      console.log(
        `${String(fixed.length)} of them no longer reproduce — close the issue and drop the workaround.`,
      );
    }

    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (summaryFile === undefined) return;
    const md = [
      `## Known defects tolerated: ${String(sorted.length)}`,
      '| Test | Defect | Outcome |',
      '|---|---|---|',
      ...sorted.map((r) => `| ${r.test} | ${r.defect} | ${r.outcome} |`),
    ].join('\n');
    appendFileSync(summaryFile, `${md}\n`);
  }
}

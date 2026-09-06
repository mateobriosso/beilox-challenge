import { appendFileSync } from 'node:fs';
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

interface Row {
  title: string;
  ms: number;
  status: TestResult['status'];
}

export default class ResponseTimeReporter implements Reporter {
  private readonly rows: Row[] = [];

  public onTestEnd(test: TestCase, result: TestResult): void {
    const a = test.annotations.find((x) => x.type === 'response-time');
    if (a?.description) {
      this.rows.push({
        title: test.title,
        ms: Number.parseInt(a.description, 10),
        status: result.status,
      });
    }
  }

  public onEnd(): void {
    if (this.rows.length === 0) return;
    const sorted = [...this.rows].sort((a, b) => b.ms - a.ms);
    console.table(sorted);
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (!summaryFile) return;
    const md = [
      '## API response times',
      '| Test | ms | Status |',
      '|---|---:|---|',
      ...sorted.map((r) => `| ${r.title} | ${r.ms} | ${r.status} |`),
    ].join('\n');
    appendFileSync(summaryFile, `${md}\n`);
  }
}

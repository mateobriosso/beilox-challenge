/**
 * Registry of defects found on the systems under test and accepted as known.
 *
 * A suite that stays green while real bugs are open only stays honest if the
 * toleration is declared somewhere the reader can see. Each entry here is
 * attached to the covering test as a `known-defect` annotation, which
 * `src/reporters/known-defects.reporter.ts` turns into a summary at the end of
 * the run and into a table in the GitHub Actions job summary.
 */
export interface KnownDefect {
  /** Issue number in this repository. */
  readonly issue: number;
  /** One line, in the same language as the issue title. */
  readonly summary: string;
  /**
   * How the covering test behaves today.
   * - `expected-failure`: the test asserts the correct behaviour and is marked
   *   `test.fail`, so it fails on purpose and turns the run red once fixed.
   * - `documents-current`: the test asserts the current (defective) behaviour,
   *   so it passes today and turns red once fixed.
   */
  readonly coverage: 'expected-failure' | 'documents-current';
}

export const KNOWN_DEFECTS = {
  planetsNotFoundTypo: {
    issue: 1,
    summary: 'swapi.tech: el 404 de /planets/:id devuelve la clave `messsage`',
    coverage: 'expected-failure',
  },
  emptyResultsHeading: {
    issue: 2,
    summary: 'centraldepasajes.com.ar: el h1 de la ruta queda vacío sin servicios',
    coverage: 'expected-failure',
  },
  sameStationAccepted: {
    issue: 3,
    summary: 'centraldepasajes.com.ar: el buscador acepta origen igual a destino',
    coverage: 'documents-current',
  },
} as const satisfies Record<string, KnownDefect>;

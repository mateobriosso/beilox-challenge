/**
 * TypeScript view of the swapi.tech response envelopes.
 *
 * These interfaces are the *typed* counterpart of the JSON schemas under
 * `src/api/schemas`. Schemas validate the wire format; the interfaces give tests
 * autocomplete and compile-time safety once a body has passed validation.
 */

/** Metadata appended to every swapi.tech response. */
export interface SwapiMeta {
  readonly apiVersion: string;
  readonly timestamp: string;
  readonly support: { readonly contact: string };
}

/** Summary entry returned by paginated list endpoints (`/people`, `/planets`). */
export interface SwapiListItem {
  readonly uid: string;
  readonly name: string;
  readonly url: string;
}

/** Paginated collection envelope (`/people`, `/planets`). */
export interface SwapiPagedList extends SwapiMeta {
  readonly message: string;
  readonly total_records: number;
  readonly total_pages: number;
  readonly previous: string | null;
  readonly next: string | null;
  readonly results: readonly SwapiListItem[];
}

/** Full record wrapper used by detail endpoints and by `/films`. */
export interface SwapiRecord<TProperties> {
  readonly properties: TProperties;
  readonly _id: string;
  readonly description: string;
  readonly uid: string;
  readonly __v: number;
}

/** Single-record envelope (`/people/:id`, `/planets/:id`, `/films/:id`). */
export interface SwapiDetail<TProperties> extends SwapiMeta {
  readonly message: string;
  readonly result: SwapiRecord<TProperties>;
}

/** Collection-of-records envelope (`/films`, and `?name=` / `?title=` searches). */
export interface SwapiRecordList<TProperties> extends SwapiMeta {
  readonly message: string;
  readonly result: readonly SwapiRecord<TProperties>[];
}

export interface PersonProperties {
  readonly name: string;
  readonly height: string;
  readonly mass: string;
  readonly hair_color: string;
  readonly skin_color: string;
  readonly eye_color: string;
  readonly birth_year: string;
  readonly gender: string;
  readonly homeworld: string;
  readonly films: readonly string[];
  readonly vehicles: readonly string[];
  readonly starships: readonly string[];
  readonly created: string;
  readonly edited: string;
  readonly url: string;
}

export interface PlanetProperties {
  readonly name: string;
  readonly diameter: string;
  readonly rotation_period: string;
  readonly orbital_period: string;
  readonly gravity: string;
  readonly population: string;
  readonly climate: string;
  readonly terrain: string;
  readonly surface_water: string;
  readonly created: string;
  readonly edited: string;
  readonly url: string;
}

export interface FilmProperties {
  readonly title: string;
  readonly episode_id: number;
  readonly opening_crawl: string;
  readonly director: string;
  readonly producer: string;
  readonly release_date: string;
  readonly characters: readonly string[];
  readonly planets: readonly string[];
  readonly starships: readonly string[];
  readonly vehicles: readonly string[];
  readonly species: readonly string[];
  readonly created: string;
  readonly edited: string;
  readonly url: string;
}

/**
 * Error envelope for 404 responses.
 *
 * `/planets/:id` misspells the key as `messsage` (three "s"), a real upstream
 * defect surfaced by the suite. The schema accepts either spelling so the test
 * documents it without hiding it.
 */
export interface SwapiNotFound extends SwapiMeta {
  readonly message?: string;
  readonly messsage?: string;
}

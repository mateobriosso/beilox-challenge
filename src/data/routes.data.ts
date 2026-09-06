/**
 * Test data for the centraldepasajes.com.ar search flow.
 *
 * Each station carries the three representations the site uses for it:
 *  - `query`: what a user types in the Select2 box,
 *  - `optionLabel`: a distinctive fragment of the dropdown option to pick,
 *  - `resultsLabel`: how the results page names the station (heading and cards),
 *  - `slug`: the path segment of the results URL.
 */
export interface Station {
  readonly query: string;
  readonly optionLabel: string;
  readonly resultsLabel: string;
  readonly slug: string;
}

export interface Route {
  readonly origin: Station;
  readonly destination: Station;
}

/** Everything needed to run one search from the home page. */
export interface SearchCriteria extends Route {
  readonly departureDate: Date;
  readonly passengers: number;
}

export const STATIONS = {
  retiro: {
    query: 'Buenos Aires',
    optionLabel: 'Buenos Aires. Terminal Retiro',
    resultsLabel: 'Retiro Buenos Aires',
    slug: 'retiro-buenos-aires',
  },
  marDelPlata: {
    query: 'Mar del Plata',
    optionLabel: 'Mar del Plata Terminal',
    resultsLabel: 'Mar del Plata',
    slug: 'mar-del-plata',
  },
  tresArroyos: {
    query: 'Tres Arroyos',
    optionLabel: 'Tres Arroyos',
    resultsLabel: 'Tres Arroyos',
    slug: 'tres-arroyos',
  },
  ushuaia: {
    query: 'Ushuaia',
    optionLabel: 'Ushuaia',
    resultsLabel: 'Ushuaia',
    slug: 'ushuaia',
  },
} as const satisfies Record<string, Station>;

/** High-frequency corridor: always has services on sale. */
export const POPULAR_ROUTE: Route = {
  origin: STATIONS.retiro,
  destination: STATIONS.marDelPlata,
};

/** Two real stations with no direct bus service between them. */
export const UNSERVED_ROUTE: Route = {
  origin: STATIONS.tresArroyos,
  destination: STATIONS.ushuaia,
};

/** A city that does not exist in the station catalogue. */
export const UNKNOWN_CITY = 'Xyzzyq';

/** Validation messages the form shows when submitted empty (Parsley). */
export const REQUIRED_FIELD_MESSAGES: readonly string[] = [
  'Completá el Origen de tu viaje',
  'Completá el Destino de tu viaje',
  'Completá la fecha',
];

/** Message Select2 shows when the typed text matches no station. */
export const NO_STATION_MATCH_MESSAGE = 'No se encontraron resultados';

/** Message shown on the results page when the route has no services. */
export const NO_SERVICES_MESSAGE = 'No encontramos opciones para tu viaje';

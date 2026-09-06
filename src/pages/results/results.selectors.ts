/**
 * CSS selectors for the results page (`/cdp/pasajes-micro/<origin>/<destination>`).
 */
export const resultsSelectors = {
  /** `<h1 class="city-names">` with the origin and destination names. */
  routeHeading: 'h1.city-names',
  routeOrigin: 'h1.city-names .salida',
  routeDestination: 'h1.city-names .llegada',

  /** Date strip above the list; the searched day carries `.active`. */
  selectedDate: '.fechas-slider a.active .fecha',

  /** Embedded "Modificar" form; its passengers select mirrors the `CntPas` parameter. */
  passengers: '#pasajeros',

  /** Container hidden when the route has no services. */
  servicesContainer: '#servicios',
  serviceCard: '#servicios .card',

  card: {
    departureTime: '.salida .hora',
    departureCity: '.salida .ciudad',
    arrivalTime: '.llegada .hora',
    arrivalCity: '.llegada .ciudad',
    price: '.btn-selec-servicio',
  },

  /** Modal shown instead of the list when there are no options. */
  noResultsModal: '#modal-alert',
  noResultsMessage: '#modal-alert .modal-body',
  newSearchButton: '#modal-alert #buttonInicio',
} as const;

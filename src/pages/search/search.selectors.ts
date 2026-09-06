/**
 * CSS selectors for the home-page search form (centraldepasajes.com.ar).
 *
 * The form is an ASP.NET page enhanced with Select2 (stations), a custom
 * inline calendar (`#cdp-calendar-container`) and Parsley validation.
 * Keeping selectors in one place means a markup change touches only this file.
 */
export const searchSelectors = {
  form: '#parametros_busqueda_servicios_home',

  origin: {
    /** Hidden native input that carries the selected station id. */
    input: '#PadOrigen',
    /** Clickable Select2 combobox. */
    combobox: '[aria-labelledby="select2-PadOrigen-container"]',
    /** Text rendered for the current selection (or the placeholder). */
    rendered: '#select2-PadOrigen-container',
    /** Results list that exists only while this dropdown is open. */
    resultsList: '#select2-PadOrigen-results',
  },

  destination: {
    input: '#PadDestino',
    combobox: '[aria-labelledby="select2-PadDestino-container"]',
    rendered: '#select2-PadDestino-container',
    resultsList: '#select2-PadDestino-results',
  },

  select2: {
    /** Search box inside whichever Select2 dropdown is currently open. */
    openSearchField: '.select2-container--open input.select2-search__field',
    option: '.select2-results__option',
    /** "No se encontraron resultados" entry. */
    noResultsMessage: '.select2-results__message',
  },

  departureDate: '#fechaPartida',

  calendar: {
    /** The wrapper has a real box; the outer `#cdp-calendar-container` is zero-sized. */
    container: '#cdp-calendar-container .date-picker-wrapper',
    monthName: '.month-name',
    nextMonth: '.next',
    /** Selectable day of the month currently shown. */
    selectableDay: '.day.toMonth.valid',
    /** Day the site refuses (in the past). */
    disabledDay: '.day.invalid',
  },

  passengers: '#pasajeros',
  submit: '#btnCons',

  /** Parsley error messages rendered under invalid fields. */
  validationError: '.parsley-errors-list li',
} as const;

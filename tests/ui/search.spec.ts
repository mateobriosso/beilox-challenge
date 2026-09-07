import { test } from '../../src/fixtures/ui.fixture';
import type { SearchCriteria } from '../../src/data/routes.data';
import {
  POPULAR_ROUTE,
  SAME_STATION_ROUTE,
  UNKNOWN_CITY,
  UNSERVED_ROUTE,
} from '../../src/data/routes.data';
import { daysFromToday } from '../../src/utils/dates';
import { KNOWN_DEFECTS } from '../../src/data/known-defects';
import { annotateKnownDefect } from '../../src/utils/known-defects';

/** Far enough ahead to have services on sale, close enough to stay in the calendar. */
const DEPARTURE_IN_DAYS = 7;

/** Not the form's default (1), so the assertions prove the selection travelled through. */
const PASSENGERS = 2;

const popularTrip: SearchCriteria = {
  ...POPULAR_ROUTE,
  departureDate: daysFromToday(DEPARTURE_IN_DAYS),
  passengers: PASSENGERS,
};

const sameStationTrip: SearchCriteria = {
  ...SAME_STATION_ROUTE,
  departureDate: daysFromToday(DEPARTURE_IN_DAYS),
  passengers: 1,
};

const unservedTrip: SearchCriteria = {
  ...UNSERVED_ROUTE,
  departureDate: daysFromToday(DEPARTURE_IN_DAYS),
  passengers: 1,
};

test.describe('Búsqueda de pasajes en centraldepasajes.com.ar', () => {
  test.beforeEach(async ({ searchPage }) => {
    await searchPage.open();
  });

  test.describe('búsqueda válida', () => {
    test('muestra servicios coherentes con origen, destino, fecha y pasajeros ingresados', async ({
      searchPage,
      resultsPage,
      resultsAssertions,
    }) => {
      await searchPage.search(popularTrip);
      await resultsPage.waitForLoaded();

      await resultsAssertions.expectUrlReflects(popularTrip);
      await resultsAssertions.expectRouteHeading(popularTrip);
      await resultsAssertions.expectSelectedDate(popularTrip.departureDate);
      await resultsAssertions.expectPassengers(popularTrip.passengers);
      await resultsAssertions.expectServicesForRoute(popularTrip);
    });
  });

  test.describe('sin resultados', () => {
    test('informa que no hay opciones cuando la ruta no tiene servicios', async ({
      searchPage,
      resultsPage,
      resultsAssertions,
    }) => {
      await searchPage.search(unservedTrip);
      await resultsPage.waitForLoaded();

      await resultsAssertions.expectUrlReflects(unservedTrip);
      await resultsAssertions.expectNoServicesMessage();
    });

    test('mantiene el encabezado con la ruta buscada aunque no haya servicios', async ({
      searchPage,
      resultsPage,
      resultsAssertions,
    }) => {
      // Known site defect (observed 2026-09-06): the results page renders `h1.city-names`
      // with empty origin/destination spans when there are no services, although the
      // `<title>` still names the route. Marked as an expected failure so the suite stays
      // green today and flags the moment the site fixes it.
      annotateKnownDefect(KNOWN_DEFECTS.emptyResultsHeading);
      test.fail(
        true,
        'centraldepasajes.com.ar leaves the route heading empty on no-results pages (issue #2)',
      );

      await searchPage.search(unservedTrip);
      await resultsPage.waitForLoaded();

      await resultsAssertions.expectRouteHeading(unservedTrip);
    });
  });

  test.describe('datos inválidos', () => {
    test('bloquea el envío del formulario vacío y marca los campos obligatorios', async ({
      searchPage,
      searchAssertions,
    }) => {
      await searchPage.submit();

      await searchAssertions.expectStillOnSearchPage();
      await searchAssertions.expectRequiredFieldErrors();
    });

    test('no ofrece sugerencias para una ciudad inexistente', async ({
      searchPage,
      searchAssertions,
    }) => {
      await searchPage.typeStation('origin', UNKNOWN_CITY);

      await searchAssertions.expectNoStationSuggestions();
    });

    test('acepta origen y destino iguales y solo lo informa como búsqueda sin opciones', async ({
      searchPage,
      resultsPage,
      resultsAssertions,
    }) => {
      // The destination picker is not filtered by the chosen origin, so the form lets the
      // same station through and the site only reacts downstream with the "no options"
      // modal. This test documents that validation gap (issue #3) rather than a desired
      // behaviour; if the site adds the validation, rewrite it as a form-level check.
      annotateKnownDefect(KNOWN_DEFECTS.sameStationAccepted);

      await searchPage.search(sameStationTrip);
      await resultsPage.waitForLoaded();

      await resultsAssertions.expectUrlReflects(sameStationTrip);
      await resultsAssertions.expectNoServicesMessage();
    });

    test('no permite elegir una fecha pasada en el calendario', async ({
      searchPage,
      searchAssertions,
    }) => {
      await searchPage.openDepartureCalendar();

      await searchAssertions.expectDateDisabled(daysFromToday(-1));
    });
  });

  test.describe('volver atrás desde resultados', () => {
    test('regresa al buscador conservando los datos de la búsqueda', async ({
      searchPage,
      searchAssertions,
      resultsPage,
    }) => {
      await searchPage.search(popularTrip);
      await resultsPage.waitForLoaded();

      await resultsPage.goBack();

      await searchAssertions.expectStillOnSearchPage();
      await searchAssertions.expectSelectedOrigin(popularTrip.origin);
      await searchAssertions.expectSelectedDestination(popularTrip.destination);
      await searchAssertions.expectDepartureDate(popularTrip.departureDate);
      await searchAssertions.expectPassengers(popularTrip.passengers);
    });
  });
});

import { test } from '../../src/fixtures/ui.fixture';
import type { SearchCriteria } from '../../src/data/routes.data';
import { POPULAR_ROUTE, UNKNOWN_CITY, UNSERVED_ROUTE } from '../../src/data/routes.data';
import { daysFromToday } from '../../src/utils/dates';

/** Far enough ahead to have services on sale, close enough to stay in the calendar. */
const DEPARTURE_IN_DAYS = 7;

const popularTrip: SearchCriteria = {
  ...POPULAR_ROUTE,
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
    test('muestra servicios coherentes con el origen, destino y fecha ingresados', async ({
      searchPage,
      resultsPage,
      resultsAssertions,
    }) => {
      await searchPage.search(popularTrip);
      await resultsPage.waitForLoaded();

      await resultsAssertions.expectUrlReflects(popularTrip);
      await resultsAssertions.expectRouteHeading(popularTrip);
      await resultsAssertions.expectSelectedDate(popularTrip.departureDate);
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
    });
  });
});

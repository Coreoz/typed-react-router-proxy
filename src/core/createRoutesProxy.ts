import type { NavigateFunction } from 'react-router';
import { AnyRouteDefinition, BuildRouteArgs, RouteDefinition, UseRoutes } from '../types';
import { buildRoute } from './buildRoute';

/**
 * Creates a route proxy to handle navigation and link generation.
 */
export function createRoutesProxy<Config extends Record<string, AnyRouteDefinition>>(
  routes: Config,
  navigate: NavigateFunction,
): UseRoutes<Config> {
  return new Proxy({} as UseRoutes<Config>, {
    // Dans un Proxy, "property" est toujours de type string | symbol
    get: (_, property: string | symbol) => {
      const routeDefinition: RouteDefinition | undefined = routes[property as keyof Config];

      if (routeDefinition === undefined) {
        throw new Error(`Route "${property.toString()}" not found in routes configuration.`);
      }

      return (...args: BuildRouteArgs<Record<string, string | number>, Record<string, unknown>>) => {
        const {
          link,
          params,
          queryParams,
        } = buildRoute(
          routeDefinition,
            ...args,
        );

        return {
          name: property,
          push: () => {
            navigate(link);
          },
          replace: () => {
            navigate(link, { replace: true });
          },
          link,
          params,
          queryParams,
        };
      };
    },
  });
}

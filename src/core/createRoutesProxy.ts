import type { NavigateFunction } from 'react-router';
import type { AnyRouteDefinition, RouteDefinition, UseRoutes } from '../types';
import { addQueryParams, replaceParams } from '../utils';

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

      return (arg1?: Record<string, string | number>, arg2?: Record<string, unknown>) => {
        const pathWithParams: string = routeDefinition.path();
        const hasPathParams: boolean = routeDefinition.relativePath.includes(':')
          || !!new RegExp(/:[a-zA-Z]+/).exec(routeDefinition.path());

        const params: Record<string, string | number> | undefined = hasPathParams ? arg1 : undefined;
        const queryParams: Record<string, unknown> | undefined = hasPathParams ? arg2 : arg1;

        const path: string = replaceParams(pathWithParams, params);
        const link: string = addQueryParams(path, queryParams);

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

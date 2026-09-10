import { BuildRouteArgs, RouteDefinition, StaticRouteConfig } from '../types';
import { addQueryParams, replaceParams } from '../utils';

/**
 * Statically builds the URL for a route definition with typed parameters and query parameters.
 */
export function buildRoute<
  Params extends Record<string, unknown> = Record<never, never>,
  QueryParams extends Record<string, unknown> = Record<never, never>,
>(
  route: RouteDefinition<Params, QueryParams>,
  ...args: BuildRouteArgs<Params, QueryParams>
): StaticRouteConfig<Params, QueryParams> {
  const pathTemplate: string = route.path();
  const hasPathParams: boolean = route.relativePath.includes(':')
    || !!new RegExp(/:[a-zA-Z]+/).exec(pathTemplate);

  const params: Record<string, string | number> | undefined = (hasPathParams ? args[0] : undefined) as
    | Record<string, string | number>
    | undefined;
  const queryParams: Record<string, unknown> | undefined = (hasPathParams ? args[1] : args[0]) as
    | Record<string, unknown>
    | undefined;

  const path: string = replaceParams(pathTemplate, params);
  const link: string = addQueryParams(path, queryParams);
  return {
    link,
    params: params as Params,
    queryParams: queryParams as QueryParams,
  };
}

export type StaticRouteConfig<P, Q> = {
  /**
   * The absolute link for the route.
   */
  link: string,

  /**
   * The route parameters.
   */
  params?: P,

  /**
   * The query parameters.
   */
  queryParams?: Q,
};

/**
 * Maps a route enum/key to its path and parameter type.
 */
export type RouteConfig<Name extends string | number | symbol, P, Q> = {
  /**
   * The name of the route.
   */
  name: Name,

  /**
   * Navigates to the route.
   */
  push: () => void,

  /**
   * Replaces the current route with the given route.
   */
  replace: () => void,
} & StaticRouteConfig<P, Q>;

export type AnyRouteDefinition = RouteDefinition<Record<string, unknown>>;

/**
 * Extracts the parameter types from a route path.
 * Example:
 * ```ts
 * type Params = ExtractRouteParams<"/users/:id/posts/:postId">;
 * // { id: string; postId: string }
 * ```
 */
export type ExtractRouteParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string | number } & ExtractRouteParams<Rest>
    : Path extends `${string}:${infer Param}`
      ? { [K in Param]: string | number }
      // Si aucun paramètre n'est trouvé, on retourne un type vide (indiquant qu'aucun argument n'est requis)
      : Record<never, never>;

export type RouteDefinitionPathOptions = { relativeTo?: AnyRouteDefinition };

export type BuildRouteArgs<Params, QueryParams> = Record<string, never> extends Params
  ? [queryParams?: Partial<QueryParams>]
  : [params: Params, queryParams?: Partial<QueryParams>];

/**
 * A route definition that can be composed.
 */
export interface RouteDefinition<
  Params extends Record<string, unknown> = Record<never, never>,
  QueryParams extends Record<string, unknown> = Record<never, never>,
> {
  /**
   * The path segment of the route.
   */
  relativePath: string,

  /**
   * Extends the current route with a new segment.
   */
  extend<const Path extends string>(
    path: Path
  ): RouteDefinition<Params & ExtractRouteParams<Path>, QueryParams>,

  /**
   * Returns the full path of the route.
   */
  path(pathOptions?: RouteDefinitionPathOptions): string,

  /**
   * Adds query parameters to the route.
   */
  withQueryParams<T extends Record<string, unknown>>(): RouteDefinition<Params, T>,

  /**
   * Statically builds the URL for this route with typed parameters and query parameters.
   */
  format(...args: BuildRouteArgs<Params, QueryParams>): string,
}

// Si Params ne contient aucune clé, on n'attend aucun argument.
// Sinon, on exige l'objet Params completement typé et obligatoire.
export type Route<
  Name extends string | number | symbol,
  Params,
  QueryParams,
> = Record<string, never> extends Params
  ? (queryParams?: Partial<QueryParams>) => RouteConfig<Name, Params, QueryParams>
  : (params: Params, queryParams?: Partial<QueryParams>) => RouteConfig<Name, Params, QueryParams>;

/**
 * The routes object that can be used to navigate to routes.
 */
export type UseRoutes<Config extends Record<string, AnyRouteDefinition>> = {
  [Name in keyof Config]: Config[Name] extends RouteDefinition<infer Params, infer QueryParams>
    ? Route<Name, Params, QueryParams>
    : never;
};

// 3. Le type global retourné par createRoutes
export interface Routes<Config extends Record<string, AnyRouteDefinition>> {
  useRoutes: () => UseRoutes<Config>,
  routes: Config,
}

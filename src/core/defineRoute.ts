import type {
  AnyRouteDefinition,
  BuildRouteArgs,
  ExtractRouteParams,
  RouteDefinition,
  RouteDefinitionPathOptions,
} from '../types';
import { stripUrlFragment } from '../utils';
import { buildRoute } from './buildRoute';

/**
 * Creates a new route definition.
 */
export const defineRoute = <
  const Path extends string,
  ParentParams extends Record<string, unknown> = Record<never, never>,
  QueryParams extends Record<string, unknown> = Record<never, never>,
>(
  path: Path,
  options?: Partial<{ parent: RouteDefinition<ParentParams> }>,
): RouteDefinition<ParentParams & ExtractRouteParams<Path>, QueryParams> => ({
  relativePath: stripUrlFragment(path),
  extend<const NextPath extends string>(nextPath: NextPath): RouteDefinition<
    ParentParams & ExtractRouteParams<Path> & ExtractRouteParams<NextPath>,
    QueryParams
  > {
    return defineRoute(nextPath, { parent: this });
  },
  path(pathOptions?: RouteDefinitionPathOptions): string {
    // If we reach the specific ancestor, we want to be relative to, stop the chain.
    if (this.relativePath === pathOptions?.relativeTo?.relativePath) {
      return '';
    }
    const currentSegment: string = stripUrlFragment(this.relativePath);
    if (!options?.parent) {
      return currentSegment;
    }
    const parentSegment: string = options.parent.path({ relativeTo: pathOptions?.relativeTo });
    if (!parentSegment) {
      return currentSegment;
    }
    if (!currentSegment) {
      return parentSegment;
    }
    return `${parentSegment}/${currentSegment}`;
  },
  withQueryParams<T extends Record<string, unknown>>(): RouteDefinition<
    ParentParams & ExtractRouteParams<Path>,
    T
  > {
    return this as unknown as RouteDefinition<ParentParams & ExtractRouteParams<Path>, T>;
  },
  format(
    ...args: BuildRouteArgs<ParentParams & ExtractRouteParams<Path>, QueryParams>
  ): string {
    return buildRoute(this, ...args).link;
  },
});

/**
 * Allows to define the routes configuration.
 * Acts like a type guard to ensure that the configuration is correct.
 */
export function defineRouteConfig<const Config extends Record<string, AnyRouteDefinition>>(
  config: Config,
): Config {
  return config;
}

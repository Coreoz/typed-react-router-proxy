// Public API of the library.
// Only re-export what consumers are supposed to use to avoid deep imports.

export { defineRoute, defineRouteConfig } from './core/defineRoute';
export { createRoutes } from './core/createRoutes';
export { useRoutes } from './hooks/useRoutes';

export type {
  AnyRouteDefinition,
  ExtractRouteParams,
  Route,
  RouteConfig,
  RouteDefinition,
  RouteDefinitionPathOptions,
  Routes,
  UseRoutes,
} from './types';

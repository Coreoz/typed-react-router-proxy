import type { AnyRouteDefinition, Routes } from '../types';
import { useRoutes } from '../hooks/useRoutes';

/**
 * Creates the routes object exposing both the `useRoutes` hook
 * and the raw `routes` configuration for static usage.
 */
export function createRoutes<Config extends Record<string, AnyRouteDefinition>>(
  routes: Config,
): Routes<Config> {
  return {
    useRoutes: () => useRoutes<Config>(routes),
    // just forwarding for project static use
    routes,
  };
}

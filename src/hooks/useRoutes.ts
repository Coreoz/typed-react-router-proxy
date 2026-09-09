import { type NavigateFunction, useNavigate } from 'react-router';
import type { AnyRouteDefinition, UseRoutes } from '../types';
import { createRoutesProxy } from '../core/createRoutesProxy';

/**
 * React hook that binds a routes configuration to the current
 * router navigation, returning a typed proxy to build links and navigate.
 */
export function useRoutes<Config extends Record<string, AnyRouteDefinition>>(
  routes: Config,
): UseRoutes<Config> {
  const navigate: NavigateFunction = useNavigate();
  return createRoutesProxy<Config>(routes, navigate);
}

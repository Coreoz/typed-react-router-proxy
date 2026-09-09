import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoutesProxy } from './createRoutesProxy';
import { defineRoute, defineRouteConfig } from './defineRoute';

describe('createRoutesProxy', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const routesConfig = defineRouteConfig({
    HOME: defineRoute('home'),
    USER_DETAILS: defineRoute('users/:id'),
  });

  it('should generate a simple link without params', () => {
    const routes = createRoutesProxy(routesConfig, mockNavigate);
    expect(routes.HOME().link).toBe('/home');
  });

  it('should generate a link with params', () => {
    const routes = createRoutesProxy(routesConfig, mockNavigate);
    expect(routes.USER_DETAILS({ id: 123 }).link).toBe('/users/123');
  });

  it('should navigate using push without params', () => {
    const routes = createRoutesProxy(routesConfig, mockNavigate);
    routes.HOME().push();
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  it('should navigate using push with params', () => {
    const routes = createRoutesProxy(routesConfig, mockNavigate);
    routes.USER_DETAILS({ id: 'abc' }).push();
    expect(mockNavigate).toHaveBeenCalledWith('/users/abc');
  });

  it('should navigate using replace without params', () => {
    const routes = createRoutesProxy(routesConfig, mockNavigate);
    routes.HOME().replace();
    expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
  });

  it('should navigate using replace with params', () => {
    const routes = createRoutesProxy(routesConfig, mockNavigate);
    routes.USER_DETAILS({ id: 456 }).replace();
    expect(mockNavigate).toHaveBeenCalledWith('/users/456', { replace: true });
  });

  it('should handle query params with path params', () => {
    const routes = createRoutesProxy(routesConfig, mockNavigate);
    expect(routes.USER_DETAILS({ id: 123 }, { query: 'test' }).link).toBe('/users/123?query=test');
  });

  it('should handle query params without path params', () => {
    const routes = createRoutesProxy(routesConfig, mockNavigate);
    expect(routes.HOME({ query: 'test' }).link).toBe('/home?query=test');
  });

  it('should throw an error when accessing an undefined route', () => {
    const routes = createRoutesProxy(routesConfig, mockNavigate);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => (routes as any).UNDEFINED_ROUTE()).toThrow(
      'Route "UNDEFINED_ROUTE" not found in routes configuration.',
    );
  });

  it('should handle routes with multiple params', () => {
    const baseRoute = defineRoute('org');
    const multiParamRoutes = defineRouteConfig({
      TEST: baseRoute.extend(':orgId').extend('project/:projectId'),
    });
    const routes = createRoutesProxy(multiParamRoutes, mockNavigate);

    expect(routes.TEST({
      orgId: 'o1',
      projectId: 'p2',
    }).link).toBe('/org/o1/project/p2');
  });

  it('should return /path if no params are provided to a route with params (fallback behavior)', () => {
    const routes = createRoutesProxy(routesConfig, mockNavigate);

    // @ts-expect-error testing fallback when params are omitted
    expect(routes.USER_DETAILS().link).toBe('/users/:id');
  });

  it('should work with parent route prefix', () => {
    const prefix = defineRoute('api');
    const configWithPrefix = defineRouteConfig({
      TEST: defineRoute('users', { parent: prefix }),
    });
    const routes = createRoutesProxy(configWithPrefix, mockNavigate);
    expect(routes.TEST().link).toBe('/api/users');
  });
});

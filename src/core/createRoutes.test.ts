import { describe, expect, it, vi } from 'vitest';
import { createRoutes } from './createRoutes';
import { defineRoute, defineRouteConfig } from './defineRoute';

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
}));

describe('createRoutes', () => {
  const routesConfig = defineRouteConfig({
    HOME: defineRoute('home'),
  });

  it('should expose the raw routes configuration', () => {
    const { routes } = createRoutes(routesConfig);
    expect(routes).toBe(routesConfig);
  });

  it('should return useRoutes hook function', () => {
    const { useRoutes } = createRoutes(routesConfig);
    expect(typeof useRoutes).toBe('function');
    const proxy = useRoutes();
    expect(proxy.HOME().link).toBe('/home');
  });
});

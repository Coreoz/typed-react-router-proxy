import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useNavigate } from 'react-router';
import { useRoutes } from './useRoutes';
import { defineRoute, defineRouteConfig } from '../core/defineRoute';

vi.mock('react-router', () => ({
  useNavigate: vi.fn(),
}));

describe('useRoutes', () => {
  const mockNavigate: Mock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useNavigate as any).mockReturnValue(mockNavigate);
  });

  const routesConfig = defineRouteConfig({
    HOME: defineRoute('home'),
    USER_DETAILS: defineRoute('users/:id'),
  });

  it('should call useNavigate and return routes proxy with navigation capabilities', () => {
    const routes = useRoutes(routesConfig);

    expect(routes.HOME().link).toBe('/home');
    expect(routes.USER_DETAILS({ id: 123 }).link).toBe('/users/123');

    routes.HOME().push();
    expect(mockNavigate).toHaveBeenCalledWith('/home');

    routes.USER_DETAILS({ id: 'abc' }).replace();
    expect(mockNavigate).toHaveBeenCalledWith('/users/abc', { replace: true });
  });
});

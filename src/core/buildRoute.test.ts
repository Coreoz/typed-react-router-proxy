import { describe, expect, it } from 'vitest';
import { buildRoute } from './buildRoute';
import { defineRoute } from './defineRoute';

describe('buildRoute', () => {
  it('should build static route without params', () => {
    const route = defineRoute('/home');
    expect(buildRoute(route).link).toBe('/home');
  });

  it('should build static route with query parameters', () => {
    const route = defineRoute('/search').withQueryParams<{ q: string; page?: number }>();
    expect(buildRoute(route, { q: 'react', page: 2 }).link).toBe('/search?q=react&page=2');
  });

  it('should build route with path params', () => {
    const route = defineRoute('/users/:id');
    expect(buildRoute(route, { id: 42 }).link).toBe('/users/42');
  });

  it('should build route with path params and query parameters', () => {
    const route = defineRoute('/users/:id').withQueryParams<{ tab: string }>();
    expect(buildRoute(route, { id: 42 }, { tab: 'profile' }).link).toBe('/users/42?tab=profile');
  });

  it('should build nested extended routes with params', () => {
    const base = defineRoute('/organizations/:orgId');
    const child = base.extend('projects/:projectId').withQueryParams<{ filter: string }>();

    expect(buildRoute(child, { orgId: 'acme', projectId: 123 }, { filter: 'active' }).link).toBe(
      '/organizations/acme/projects/123?filter=active',
    );
  });
});

describe('RouteDefinition.build', () => {
  it('should build static route via .build()', () => {
    const route = defineRoute('/dashboard');
    expect(route.format()).toBe('/dashboard');
  });

  it('should build static route with query params via .format()', () => {
    const route = defineRoute('/dashboard').withQueryParams<{ tab: string }>();
    expect(route.format({ tab: 'analytics' })).toBe('/dashboard?tab=analytics');
  });

  it('should build parameterized route via .format()', () => {
    const route = defineRoute('/users/:id/posts/:postId');
    expect(route.format({ id: '10', postId: 99 })).toBe('/users/10/posts/99');
  });

  it('should build parameterized route with query params via .format()', () => {
    const route = defineRoute('/users/:id/posts/:postId').withQueryParams<{ highlight: boolean }>();
    expect(route.format({ id: '10', postId: 99 }, { highlight: true })).toBe(
      '/users/10/posts/99?highlight=true',
    );
  });
});

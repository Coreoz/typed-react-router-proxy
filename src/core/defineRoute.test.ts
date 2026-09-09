import { describe, expect, it } from 'vitest';
import { defineRoute, defineRouteConfig } from './defineRoute';

describe('defineRoute', () => {
  it('should store relativePath without slashes', () => {
    const route = defineRoute('/users/');
    expect(route.relativePath).toBe('users');
    expect(route.path()).toBe('users');
  });

  describe('Route composition (extends)', () => {
    it('should support route composition with extend()', () => {
      const baseRoute = defineRoute('base');
      const detailRoute = baseRoute.extend(':id');
      const creationRoute = baseRoute.extend('create');

      expect(baseRoute.path()).toBe('base');
      expect(detailRoute.path()).toBe('base/:id');
      expect(creationRoute.path()).toBe('base/create');
    });

    it('should support multiple extend() calls', () => {
      const deepRoute = defineRoute('a').extend('b').extend('c').extend(':id');
      expect(deepRoute.path()).toBe('a/b/c/:id');
    });
  });

  describe('prefix / parent handling', () => {
    it('should handle parent with leading and trailing slashes', () => {
      const parent = defineRoute('/my-prefix/');
      const route = defineRoute('home', { parent });
      expect(route.path()).toBe('my-prefix/home');
    });

    it.each([
      { description: 'without slashes', parentPath: 'my-prefix', expected: 'my-prefix/home' },
      { description: 'empty string', parentPath: '', expected: 'home' },
      { description: 'only slash', parentPath: '/', expected: 'home' },
    ])('should handle parent prefix $description', ({ parentPath, expected }: { parentPath: string; expected: string }) => {
      const parent = defineRoute(parentPath);
      const route = defineRoute('home', { parent });
      expect(route.path()).toBe(expected);
    });
  });

  describe('relativeTo', () => {
    it('should generate a path relative to another route', () => {
      const parent = defineRoute('admin');
      const child = parent.extend('users');
      const grandchild = child.extend(':id');

      expect(grandchild.path({ relativeTo: parent })).toBe('users/:id');
      expect(grandchild.path({ relativeTo: child })).toBe(':id');
    });

    it('should return empty string if relativeTo is the same route', () => {
      const route = defineRoute('home');
      expect(route.path({ relativeTo: route })).toBe('');
    });

    it('should work when parent is not directly the relativeTo route', () => {
      const root = defineRoute('root');
      const parent = root.extend('parent');
      const child = parent.extend('child');

      expect(child.path({ relativeTo: root })).toBe('parent/child');
    });
  });

  describe('withQueryParams', () => {
    it('should return the route definition instance', () => {
      const route = defineRoute('search');
      const routeWithQuery = route.withQueryParams<{ query: string }>();
      expect(routeWithQuery.path()).toBe('search');
    });
  });
});

describe('defineRouteConfig', () => {
  it('should return the config object as-is', () => {
    const config = {
      HOME: defineRoute('home'),
      USERS: defineRoute('users'),
    };
    expect(defineRouteConfig(config)).toBe(config);
  });
});

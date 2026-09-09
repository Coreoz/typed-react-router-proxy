import { describe, expect, it } from 'vitest';
import { addQueryParams, replaceParams, stripUrlFragment } from './index';

describe('utils', () => {
  describe('stripUrlFragment', () => {
    it('should strip leading and trailing slashes', () => {
      expect(stripUrlFragment('/users/')).toBe('users');
      expect(stripUrlFragment('/users')).toBe('users');
      expect(stripUrlFragment('users/')).toBe('users');
      expect(stripUrlFragment('users')).toBe('users');
    });

    it('should handle undefined or empty string', () => {
      expect(stripUrlFragment(undefined)).toBe('');
      expect(stripUrlFragment('')).toBe('');
      expect(stripUrlFragment('/')).toBe('');
    });
  });

  describe('replaceParams', () => {
    it('should replace params with given values', () => {
      expect(replaceParams('users/:id', { id: 123 })).toBe('/users/123');
      expect(replaceParams('org/:orgId/project/:projectId', { orgId: 'o1', projectId: 'p2' })).toBe('/org/o1/project/p2');
    });

    it('should return path with leading slash when no params provided', () => {
      expect(replaceParams('home')).toBe('/home');
      expect(replaceParams('/home')).toBe('/home');
    });
  });

  describe('addQueryParams', () => {
    it('should append query parameters when provided', () => {
      expect(addQueryParams('/users', { query: 'test', page: 1 })).toBe('/users?query=test&page=1');
    });

    it('should ignore undefined and null values', () => {
      expect(addQueryParams('/users', { query: 'test', empty: undefined, nil: null })).toBe('/users?query=test');
    });

    it('should return untouched path if no query params or empty object', () => {
      expect(addQueryParams('/users')).toBe('/users');
      expect(addQueryParams('/users', {})).toBe('/users');
    });
  });
});

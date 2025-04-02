import {it, expect, describe} from 'vitest';
import { matchPath, matchDomain } from './utils';

describe('matchPath', () => {
  it('should match exact paths', () => {
    expect(matchPath('/api/user', '/api/user')).toBe(true);
    expect(matchPath('/api/user/:id', '/api/user/123')).toBe(true);
    expect(matchPath('/api/user/:id', '/api/user/abc')).toBe(true);
  });

  it('should not match different paths', () => {
    expect(matchPath('/api/user', '/api/users')).toBe(false);
    expect(matchPath('/api/user/:id', '/api/user/123/extra')).toBe(false);
  });

  it('should match wildcard paths', () => {
    expect(matchPath('/api/*', '/api/user')).toBe(true);
    expect(matchPath('/api/*', '/api/anything/else')).toBe(true);
  });

  it('should match paths with multiple parameters', () => {
    expect(matchPath('/api/:type/:id', '/api/user/123')).toBe(true);
    expect(matchPath('/api/:type/:id', '/api/product/456')).toBe(true);
  });

  it('should not match paths with incorrect parameters', () => {
    expect(matchPath('/api/:type/:id', '/api/user')).toBe(false);
    expect(matchPath('/api/:type/:id', '/api/user/123/extra')).toBe(false);
  });
});

describe('matchDomain', () => {
  it('should match exact domains', () => {
    expect(matchDomain('example.com', 'https://example.com')).toBe(true);
    expect(matchDomain('example.com', 'http://example.com/path')).toBe(true);
  });

  it('should not match different domains', () => {
    expect(matchDomain('example.com', 'https://another.com')).toBe(false);
    expect(matchDomain('example.com', 'http://sub.example.com')).toBe(false);
  });

  it('should match wildcard domains', () => {
    expect(matchDomain('*.example.com', 'https://sub.example.com')).toBe(true);
    expect(matchDomain('https://*.example.com', 'https://sub.example.com')).toBe(true);
    expect(matchDomain('https://*.example.com', 'http://sub.example.com')).toBe(false);
    expect(matchDomain('*.example.com', 'http://another.example.com/path')).toBe(true);
  });

  it('should not match wildcard domains incorrectly', () => {
    expect(matchDomain('https://*.example.com', 'https://example.com')).toBe(false);
    expect(matchDomain('https://*.example.com', 'http://example.com')).toBe(false);
    expect(matchDomain('*.example.com', 'http://another.com')).toBe(false);
  });
});

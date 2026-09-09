/**
 * Remove the fragment from the URL
 * @param url
 */
export const stripUrlFragment = (url: string | undefined): string => {
  // remove '/' at the start or end or both
  if (url) {
    return url?.replaceAll(/(^\/|\/$)/g, '');
  }
  return '';
};

/**
 * Replaces route parameters (e.g., :id) with actual values.
 */
export const replaceParams = (
  path: string,
  params?: Record<string, string | number>,
): string => {
  const resolvedPath: string = params
    ? Object.entries(params).reduce(
      (acc: string, [key, value]: [string, string | number]) =>
        acc.replace(`:${key}`, value.toString()),
      path,
    )
    : path;

  return resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`;
};

/**
 * Adds query parameters to a path.
 */
export const addQueryParams = (path: string, queryParams?: Record<string, unknown>): string => {
  if (!queryParams || Object.keys(queryParams).length === 0) {
    return path;
  }

  const searchParams: URLSearchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]: [string, unknown]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value as string | number | boolean));
    }
  });

  const queryString: string = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
};

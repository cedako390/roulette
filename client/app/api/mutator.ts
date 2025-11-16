export const customFetch = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};

  return { data, status: res.status, headers: res.headers } as T;
};


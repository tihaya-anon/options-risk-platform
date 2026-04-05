let apiBaseUrl = "";

export function setApiBaseUrl(nextApiBaseUrl: string) {
  apiBaseUrl = nextApiBaseUrl.replace(/\/$/, "");
}

export async function customFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const requestUrl = `${apiBaseUrl}${url}`;
  const response = await fetch(requestUrl, options);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

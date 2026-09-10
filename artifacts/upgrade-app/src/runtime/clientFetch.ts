import { assertBrowserRuntime } from "./environment";

export async function clientFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const target =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  assertBrowserRuntime(`fetch ${target}`);
  return fetch(input, init);
}
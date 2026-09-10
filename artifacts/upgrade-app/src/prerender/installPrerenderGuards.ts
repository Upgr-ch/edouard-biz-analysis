import { prerenderFlag } from "../runtime/environment";

type GuardedGlobal = typeof globalThis & {
  [key: string]: unknown;
};

export function installPrerenderGuards(): () => void {
  const runtime = globalThis as GuardedGlobal;
  const previousFlag = runtime[prerenderFlag];
  const previousFetch = globalThis.fetch;

  runtime[prerenderFlag] = true;
  globalThis.fetch = async (input: RequestInfo | URL) => {
    const target =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    throw new Error(
      `Forbidden network request during prerendering: ${target}`,
    );
  };

  return () => {
    if (previousFlag === undefined) {
      delete runtime[prerenderFlag];
    } else {
      runtime[prerenderFlag] = previousFlag;
    }
    globalThis.fetch = previousFetch;
  };
}
const PRERENDER_FLAG = "__EDOUARD_PRERENDER__";

type PrerenderGlobal = typeof globalThis & {
  [PRERENDER_FLAG]?: boolean;
};

export function isPrerenderRuntime(): boolean {
  return (globalThis as PrerenderGlobal)[PRERENDER_FLAG] === true;
}

export function assertBrowserRuntime(operation: string): void {
  if (
    isPrerenderRuntime() ||
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    throw new Error(
      `Browser-only operation attempted during prerendering: ${operation}`,
    );
  }
}

export function assertPrerenderRuntime(operation: string): void {
  if (!isPrerenderRuntime()) {
    throw new Error(
      `Prerender-only operation attempted outside prerendering: ${operation}`,
    );
  }
}

export const prerenderFlag = PRERENDER_FLAG;
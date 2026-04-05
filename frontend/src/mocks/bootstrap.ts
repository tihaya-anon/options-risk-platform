export async function enableMocking() {
  const mockFlag = import.meta.env.VITE_ENABLE_MSW;
  const shouldEnable =
    mockFlag === "true" || (import.meta.env.DEV && mockFlag !== "false");

  if (!shouldEnable) {
    if (import.meta.env.DEV) {
      console.info("[msw] mocking disabled");
    }
    return;
  }

  const { worker } = await import("./browser");
  if (import.meta.env.DEV) {
    console.info("[msw] starting browser worker");
  }
  await worker.start({
    onUnhandledRequest(request, print) {
      const url = new URL(request.url);
      const isApiRequest =
        url.pathname === "/api/health" ||
        url.pathname === "/api/config" ||
        url.pathname === "/api/snapshot" ||
        url.pathname === "/api/portfolio/analyze" ||
        url.pathname.endsWith("/health") ||
        url.pathname.endsWith("/config") ||
        url.pathname.endsWith("/snapshot") ||
        url.pathname.endsWith("/portfolio/analyze");

      if (!isApiRequest) {
        return;
      }

      console.warn("[msw] unhandled api request", request.method, request.url);
      print.warning();
    },
  });
  if (import.meta.env.DEV) {
    console.info("[msw] browser worker ready");
  }
}

import "server-only";

const isDemo = () => process.env.DEMO_MODE === "true";
export { isDemo };

export async function backendFetch(path: string, init: RequestInit = {}) {
  const origin = process.env.BACKEND_URL || (process.env.NODE_ENV !== "production" ? "http://127.0.0.1:8000" : "");
  if (!origin) throw new Error("BACKEND_URL is not configured");
  const headers = new Headers(init.headers);
  if (process.env.BACKEND_API_KEY) headers.set("X-API-Key", process.env.BACKEND_API_KEY);
  return fetch(`${origin.replace(/\/$/, "")}${path}`, {
    ...init, headers, cache: "no-store", signal: AbortSignal.timeout(15000),
  });
}

export async function backendJson<T>(path: string): Promise<T | null> {
  const response = await backendFetch(path);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Backend request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export async function proxyApi(request: Request) {
  const url = new URL(request.url);
  if (isDemo()) {
    if (request.method === "GET" && url.pathname === "/api/products") {
      const { PRODUCTS } = await import("@/data/products");
      const category = url.searchParams.get("category");
      const data = PRODUCTS.filter((p) => !category || p.categorySlug === category);
      return Response.json({ success: true, source: "demo", count: data.length, data });
    }
    return Response.json({ success: false, error: "Preview mode: connect the Node.js backend to manage data." }, { status: 503 });
  }
  try {
    const headers = new Headers();
    if (request.headers.has("content-type")) headers.set("content-type", request.headers.get("content-type")!);
    const response = await backendFetch(url.pathname + url.search, {
      method: request.method, headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(),
    });
    const resultHeaders = new Headers({ "Cache-Control": "no-store" });
    for (const key of ["content-type", "content-disposition"]) {
      const value = response.headers.get(key);
      if (value) resultHeaders.set(key, value);
    }
    return new Response(response.body, { status: response.status, headers: resultHeaders });
  } catch {
    return Response.json({ success: false, error: "Backend API unavailable. Check BACKEND_URL and backend health." }, { status: 503 });
  }
}

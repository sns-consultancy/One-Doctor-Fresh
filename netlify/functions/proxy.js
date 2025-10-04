// netlify/functions/proxy.js
export async function handler(event) {
  // --- CORS preflight
  const origin = event.headers.origin || "*";
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Vary": "Origin",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers":
          event.headers["access-control-request-headers"] || "Content-Type, Authorization",
      },
    };
  }

  // --- Backend from env (NO hard-coded URL)
  const BACKEND = process.env.BACKEND_URL;
  if (!BACKEND) return { statusCode: 500, body: "Missing BACKEND_URL env var" };

  // Strip the function prefix and keep the query string
  const path = event.path.replace(/^\/\.netlify\/functions\/proxy/, "");
  const qs = event.rawQuery ? `?${event.rawQuery}` : "";
  const url = `${BACKEND}${path}${qs}`;

  // Forward headers (drop ones that break proxying)
  const { host, connection, "content-length": _cl, ...headers } = event.headers;

  // Forward body (support base64 for file uploads)
  const body =
    ["GET", "HEAD"].includes(event.httpMethod)
      ? undefined
      : event.isBase64Encoded
        ? Buffer.from(event.body || "", "base64")
        : event.body;

  const res = await fetch(url, { method: event.httpMethod, headers, body });
  const text = await res.text();

  return {
    statusCode: res.status,
    headers: {
      // If you use cookies, reflecting the origin is required; don't use "*"
      "Access-Control-Allow-Origin": origin,
      "Vary": "Origin",
      "Access-Control-Allow-Credentials": "true",
      ...Object.fromEntries(res.headers),
    },
    body: text,
  };
}

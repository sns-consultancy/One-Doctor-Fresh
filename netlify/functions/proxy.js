export async function handler(event) {
  const path = event.path.replace(/^\/.netlify\/functions\/proxy/, "");
  const url = `https://one-doctor-service-fresh-ztxv.onrender.com${path}`;

  const res = await fetch(url, {
    method: event.httpMethod,
    headers: { ...event.headers, host: undefined }, // scrub host
    body: ["GET","HEAD"].includes(event.httpMethod) ? undefined : event.body,
  });

  const body = await res.text();
  return {
    statusCode: res.status,
    headers: { ...Object.fromEntries(res.headers), "access-control-allow-origin": "*" },
    body,
  };
}

// Accepts POSTs from web-vitals; no storage yet (returns 204)
export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  // You could forward to your backend or store to a DB here
  // console.log("web-vitals", event.body);
  return { statusCode: 204, headers: { "Access-Control-Allow-Origin": "*" } };
}

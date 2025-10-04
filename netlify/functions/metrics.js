// netlify/functions/metrics.js
export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const payload = JSON.parse(event.body || '{}');
    // TODO: store to DB / analytics provider if you want
    console.log('web-vitals', payload);
    return { statusCode: 204 };
  } catch (e) {
    return { statusCode: 400, body: 'Bad Request' };
  }
}

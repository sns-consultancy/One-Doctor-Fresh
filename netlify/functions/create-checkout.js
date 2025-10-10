// netlify/functions/create-checkout.js
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // server-only

export async function handler(event) {
  const { priceId } = JSON.parse(event.body || "{}");
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${getSiteUrl()}/success`,
    cancel_url: `${getSiteUrl()}/cancel`,
  });
  return { statusCode: 200, body: JSON.stringify({ id: session.id }) };
}

// Works on prod, previews, and local `netlify dev`
function getSiteUrl() {
  return (
    process.env.URL ||               // production
    process.env.DEPLOY_PRIME_URL ||  // deploy previews
    "http://localhost:8888"          // netlify dev
  );
}

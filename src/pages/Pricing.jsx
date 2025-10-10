import React from "react";
// Define plans directly here:
const plans = [
  {
    id: "free",
    name: "Free Trial",
    price: 0,
    description: "30 days free trial with all features",
    features: [
      "100MB Storage",
      "100 Queries/Day",
      "No Video Uploads"
    ],
    stripePriceId: null
  },
  {
    id: "basic",
    name: "Basic",
    price: 4.99,
    description: "For individuals needing more resources",
    features: [
      "1GB Storage",
      "500 Queries/Day",
      "Basic Video Uploads"
    ],
    stripePriceId: "price_basic_123"
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    description: "Advanced plan for professionals",
    features: [
      "10GB Storage",
      "Unlimited Queries",
      "HD Video Uploads"
    ],
    stripePriceId: "price_pro_456"
  }
];

export default function Pricing() {
  const handleSubscribe = async (planId) => {
    console.log(`Subscribing to plan: ${planId}`);

    const plan = plans.find((p) => p.id === planId);
    if (!plan || !plan.stripePriceId) {
      alert("This plan cannot be subscribed. Please select a valid paid plan.");
      return;
    }

    const userEmail = localStorage.getItem("userEmail");

    try {
      const res = await fetch("/.netlify/functions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          email: userEmail
        })
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session.");
        console.error("Stripe API response:", data);
      }
    } catch (err) {
      console.error("Subscription error:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="pricing-container">
      <h2>Choose Your Plan</h2>
      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className="plan-card">
            <h3>{plan.name}</h3>
            <p>{plan.description}</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            {plan.price > 0 ? (
              plan.stripePriceId ? (
                <button onClick={() => handleSubscribe(plan.id)}>
                  Subscribe - ${plan.price}/month
                </button>
              ) : (
                <p>Subscription not available</p>
              )
            ) : (
              <p>This plan is free.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

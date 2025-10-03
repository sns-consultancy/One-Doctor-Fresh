import React, { useState, useEffect } from "react";

export default function BillingHistory() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      const res = await fetch(`/api/stripe/invoices/${localStorage.getItem("stripeCustomerId")}`);
      const data = await res.json();
      setInvoices(data.data);
    };
    fetchInvoices();
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <h2>Billing History</h2>
      {invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <ul>
          {invoices.map((inv) => (
            <li key={inv.id}>
              {new Date(inv.created * 1000).toLocaleDateString()} - ${inv.amount_paid / 100}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Shared PayMongo helpers used by the checkout + confirm backend functions.
// PayMongo uses HTTP Basic auth with the secret key as the username.

const API = "https://api.paymongo.com/v1";

function authHeader(secretKey) {
  return "Basic " + btoa(secretKey + ":");
}

function errorMsg(json, status) {
  const detail = json?.errors?.[0]?.detail || json?.errors?.[0]?.code;
  if (typeof detail === "string") return detail;
  return `PayMongo error ${status}`;
}

// Creates a one-time Checkout Session (hosted page supporting GCash, Maya, card).
// Returns the API resource: { id, attributes: { checkout_url, payments, ... } }
export async function createCheckoutSession({ secretKey, lineItems, paymentMethodTypes, successUrl, cancelUrl, description, metadata }) {
  const body = {
    data: {
      attributes: {
        line_items: lineItems,
        payment_method_types: paymentMethodTypes,
        success_url: successUrl,
        cancel_url: cancelUrl,
        description,
        metadata: metadata || {},
      },
    },
  };
  const res = await fetch(`${API}/checkout_sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader(secretKey) },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(errorMsg(json, res.status));
  return json.data;
}

// Retrieves a Checkout Session by id (used to verify payment on return).
export async function retrieveSession(secretKey, id) {
  const res = await fetch(`${API}/checkout_sessions/${id}`, {
    headers: { Authorization: authHeader(secretKey) },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(errorMsg(json, res.status));
  return json.data;
}

// True when the session has at least one paid payment (or a succeeded intent).
export function isSessionPaid(sessionData) {
  const payments = sessionData?.attributes?.payments || [];
  if (payments.some((p) => p?.attributes?.status === "paid")) return true;
  const intent = sessionData?.attributes?.payment_intent;
  return intent?.attributes?.status === "succeeded";
}

export function paidAmount(sessionData) {
  const payments = sessionData?.attributes?.payments || [];
  return (payments[0]?.attributes?.amount || 0) / 100;
}
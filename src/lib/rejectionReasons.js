// Predefined reasons an admin can pick when rejecting an unlock request.
// The chosen label is stored on the request (admin_note) and included in the
// rejection email + in-app notification sent to the user.
export const REJECTION_REASONS = [
  { key: "unclear_proof", label: "The payment proof was unclear or unreadable" },
  { key: "amount_mismatch", label: "The amount paid doesn't match the required amount" },
  { key: "not_received", label: "We couldn't find this payment on our end" },
  { key: "duplicate", label: "This looks like a duplicate request" },
  { key: "other", label: "Other" },
];
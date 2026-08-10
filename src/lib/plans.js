export const SESSION_LIMIT = 10;
export const SAVED_STRIP_LIMIT = 10;

// Default (international) pricing, shown until the user's country is detected.
export const LIFETIME_PRICE = 4.99;
export const COLLECTION_PRICE = 1;
export const CURRENCY = "$";

// Country-specific pricing: PH users are billed in PHP, everyone else in USD.
export const PRICING = {
  PH: { collection: 39, lifetime: 99, currency: "₱" },
  INTL: { collection: COLLECTION_PRICE, lifetime: LIFETIME_PRICE, currency: CURRENCY },
};

export const getPricing = (countryCode) => (countryCode === "PH" ? PRICING.PH : PRICING.INTL);

// Billing period key (local day) used to reset the free session counter.
export const currentPeriod = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Legacy "premium" accounts are treated as Lifetime Pass owners.
export const isLifetime = (user) => user?.plan === "lifetime" || user?.plan === "premium";

// A "collection" is identified by the template's `code` field (e.g. "transformers").
// Owning a collection unlocks every template sharing that code.
export const ownsCollection = (user, code) =>
  !!code && (user?.owned_collections || []).includes(code);

// A single collection unlock grants access to that collection's templates only.
// It does NOT remove the free-plan session cap or the 10-saved-strip cap —
// only the Lifetime Pass does.
export const hasAnyUnlock = (user) =>
  isLifetime(user) || (user?.owned_collections || []).length > 0;

export const canUseTemplate = (user, template) =>
  !template || template.tier !== "premium" || isLifetime(user) || ownsCollection(user, template.code);

export const sessionLimitReached = (user) => {
  if (isLifetime(user)) return false;
  if (user?.sessions_period !== currentPeriod()) return false;
  return (user?.sessions_used_this_month || 0) >= SESSION_LIMIT;
};

export const planLabel = (user) =>
  isLifetime(user) ? "Lifetime Pass" : hasAnyUnlock(user) ? "Collection Unlocked" : "Free";
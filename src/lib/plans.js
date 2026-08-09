export const SESSION_LIMIT = 10;
export const SAVED_STRIP_LIMIT = 10;
export const LIFETIME_PRICE = 3.99;
export const COLLECTION_PRICE = 1;
export const CURRENCY = "$";

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

// Any paid unlock (a single collection or the Lifetime Pass) removes the
// free-plan session cap and the 10-saved-strip cap.
export const hasAnyUnlock = (user) =>
  isLifetime(user) || (user?.owned_collections || []).length > 0;

export const canUseTemplate = (user, template) =>
  !template || template.tier !== "premium" || isLifetime(user) || ownsCollection(user, template.code);

export const sessionLimitReached = (user) =>
  !hasAnyUnlock(user) && (user?.sessions_used_this_month || 0) >= SESSION_LIMIT;

export const planLabel = (user) =>
  isLifetime(user) ? "Lifetime Pass" : hasAnyUnlock(user) ? "Collection Unlocked" : "Free";
export const SESSION_LIMIT = 10;
export const LIFETIME_PRICE = 299;
export const COLLECTION_PRICE = 49;

// Billing period key (local month) used to reset the free session counter.
export const currentPeriod = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

// Legacy "premium" accounts are treated as Lifetime Pass owners.
export const isLifetime = (user) => user?.plan === "lifetime" || user?.plan === "premium";

export const ownsCollection = (user, category) =>
  !!category && (user?.owned_collections || []).includes(category);

export const canUseTemplate = (user, template) =>
  !template || template.tier !== "premium" || isLifetime(user) || ownsCollection(user, template.category);

export const sessionLimitReached = (user) =>
  !isLifetime(user) && (user?.sessions_used_this_month || 0) >= SESSION_LIMIT;

export const planLabel = (user) => (isLifetime(user) ? "Lifetime Pass" : "Free");
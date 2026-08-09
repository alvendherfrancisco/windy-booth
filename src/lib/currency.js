// The app charges in USD but the admin dashboard reports revenue in PHP.
// Conversion rates fluctuate and differ for local vs. international payers,
// so an approximate default rate is used and can be overridden per-record.
export const USD_TO_PHP = 58;

export const PESO = (n) => `₱${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Returns the PHP amount to display/sum for a record: an admin-set override
// (amount_php) takes precedence over the automatic USD -> PHP conversion.
export const toPhp = (usdAmount, overridePhp) =>
  overridePhp != null ? overridePhp : (usdAmount || 0) * USD_TO_PHP;
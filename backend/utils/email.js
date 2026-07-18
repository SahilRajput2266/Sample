// Shared email helpers — used by User model, auth and admin controllers.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Returns a trimmed, lowercased email string, or null when the value is not a
// plain string (rejects NoSQL operator objects like { $gt: '' }) or is empty.
export const normalizeEmail = (value) => {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length ? email : null;
};

// Case-insensitive filter matching legacy mixed-case emails already stored in
// the users collection (documents created before lowercase normalization).
export const emailLookupFilter = (normalizedEmail) => ({
  email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
});

// In-memory caches for generated brand descriptions, keyed by brandId.
// Live for the lifetime of the server process (this session).
export const brandDescriptionCache = new Map();
export const brandSecondaryDescriptionCache = new Map();

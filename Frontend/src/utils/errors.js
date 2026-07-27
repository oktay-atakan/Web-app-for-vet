// The backend's error shape is { error: { code, message, details? } }, where
// `details` (only present for 422s) has the actual per-field reason —
// message alone is just "Request validation failed", not useful on its own.
export function getErrorMessage (err, fallback) {
  const apiError = err.response?.data?.error
  if (!apiError) {
    return fallback
  }
  if (apiError.details?.length) {
    const fieldMessages = apiError.details.map((d) => `${d.field}: ${d.message}`).join('; ')
    return `${apiError.message} — ${fieldMessages}`
  }
  return apiError.message || fallback
}
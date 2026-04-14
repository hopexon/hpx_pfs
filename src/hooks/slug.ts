export function normalizeSlug(raw?: string) {
  if(!raw) return ''
  return decodeURIComponent(raw).trim()
} 
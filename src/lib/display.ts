/** Display a website as its host only (no site name, no protocol). */
export function domainLabel(domain?: string | null) {
  const value = (domain || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '')
  return value || '—'
}

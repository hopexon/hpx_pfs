import type { EmbedProvider } from './types'

export type EmbedValidationResult =
  | {
      ok: true
      normalizedUrl: string
    }
  | {
      ok: false
      message: string
    }

const EMBED_PROVIDER_HOSTS: Record<EmbedProvider, string[]> = {
  Bandcamp: ['bandcamp.com'],
  SoundCloud: ['w.soundcloud.com', 'soundcloud.com'],
  MixCloud: ['www.mixcloud.com', 'mixcloud.com', 'player-widget.mixcloud.com'],
  Beatport: ['player.beatport.com', 'www.beatport.com', 'beatport.com'],
  Traxsource: ['www.traxsource.com', 'traxsource.com', 'player.traxsource.com'],
  'Juno Download': ['www.junodownload.com', 'junodownload.com', 'www.juno.co.uk', 'juno.co.uk'],
  YouTube: [
    'www.youtube.com',
    'youtube.com',
    'm.youtube.com',
    'www.youtube-nocookie.com',
    'youtube-nocookie.com',
    'youtu.be',
  ],
}

const SINGLE_IFRAME_RE = /^\s*<iframe\b[\s\S]*?(?:<\/iframe>|\/>)\s*$/i
const IFRAME_COUNT_RE = /<iframe\b/gi
const IFRAME_SRC_RE = /\bsrc\s*=\s*([''""])(.*?)\1/i

function isEmbedProvider(value: string): value is EmbedProvider {
  return Object.prototype.hasOwnProperty.call(EMBED_PROVIDER_HOSTS, value)
}

function normalizeUrlCandidate(value: string): string {
  const compact = value.trim().replaceAll('&amp', '&')

  if (compact.startsWith('//')) {
    return `https:${compact}`
  }

  return compact
}

function isAllowedHost(hostname: string, allowedHosts: string[]): boolean {
  const normalizedHost = hostname.toLowerCase()

  return allowedHosts.some((allowedHost) => {
    const normalizedAllowedHost = allowedHost.toLowerCase()
    return normalizedHost === normalizedAllowedHost || normalizedHost.endsWith(`.${normalizedAllowedHost}`)
  })
}

function extractEmbedUrl(rawInput: string): EmbedValidationResult {
  const trimmed = rawInput.trim()

  if (!trimmed) {
    return {
      ok: true,
      normalizedUrl: '',
    }
  }

  const isMarkupInput = /<[^>]+>/.test(trimmed)

  if (!isMarkupInput) {
    return {
      ok: true,
      normalizedUrl: normalizeUrlCandidate(trimmed),
    }
  }

  const iframeCount = trimmed.match(IFRAME_COUNT_RE)?.length ?? 0
  if (iframeCount !== 1) {
    return {
      ok: false,
      message: 'Only one iframe tag is allowed',
    }
  }

  if (!SINGLE_IFRAME_RE.test(trimmed)) {
    return {
      ok: false,
      message: 'Only iframe tags are allowed',
    }
  }

  const srcMatch = trimmed.match(IFRAME_SRC_RE)
  const srcValue = srcMatch?.[2]?.trim() ?? ''
  if (!srcValue) {
    return {
      ok: false, 
      message: 'Enter the src attribute of the iframe',
    }
  }

  return {
    ok: true,
    normalizedUrl: normalizeUrlCandidate(srcValue),
  }
}

function parseHttpsUrl(rawUrl: string): URL | null {
  let url: URL

  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }

  if (url.protocol !== 'https:') {
    return null
  }

  return url
}

export function validateEmbedPlayerInput(provider: EmbedProvider | '', rawInput: string): EmbedValidationResult {
  const normalizedProvider = provider.trim() as EmbedProvider | ''
  const normalizedInput = rawInput.trim()

  if (!normalizedProvider && !normalizedInput) {
    return {
      ok: true,
      normalizedUrl: '',
    }
  }

  if (normalizedProvider && !normalizedInput) {
    return {
      ok: false,
      message: 'Enter the Embedded Player URL or iframe',
    }
  }

  if (!normalizedProvider && normalizedInput) {
    return {
      ok: false,
      message: 'Select the Embedded Player Provider',
    }
  }

  if (!isEmbedProvider(normalizedProvider)) {
    return {
      ok: false,
      message: 'Unsupported Embedded Player Provider',
    }
  }

  const extracted = extractEmbedUrl(normalizedInput)
  if (!extracted.ok) {
    return extracted
  }

  const url = parseHttpsUrl(extracted.normalizedUrl)
  if (!url) {
    return {
      ok: false,
      message: 'Enter the Embedded Player URL as an https URL',
    }
  }

  const allowedHosts = EMBED_PROVIDER_HOSTS[normalizedProvider]
  if (!isAllowedHost(url.hostname, allowedHosts)) {
    return {
      ok: false,
      message: `Enter a valid embed URL for ${normalizedProvider}`,
    }
  }

  return {
    ok: true,
    normalizedUrl: url.toString(),
  }
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const MAX_503_RETRIES = 0
const REQUEST_TIMEOUT_MS = 45000  // Increased to 45s for slow Gemini API

const sanitizeModelName = (value) => value.trim() || 'gemini-3-flash-preview'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const get503BackoffMs = (attempt) => {
  const base = [700, 1300][attempt] || 1300
  const jitter = Math.floor(Math.random() * 250)
  return base + jitter
}

const normalizeRetryDelay = (retryDelay) => {
  if (!retryDelay || typeof retryDelay !== 'string') {
    return null
  }

  const seconds = Number.parseInt(retryDelay.replace(/s$/, ''), 10)
  if (Number.isNaN(seconds) || seconds <= 0) {
    return null
  }

  return `${seconds}s`
}

const findBalancedJsonObjects = (text) => {
  const value = String(text || '')
  const matches = []
  let depth = 0
  let start = -1
  let inString = false
  let escaped = false

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '"') {
      inString = !inString
      continue
    }

    if (inString) {
      continue
    }

    if (char === '{') {
      if (depth === 0) {
        start = i
      }
      depth += 1
      continue
    }

    if (char === '}') {
      if (depth > 0) {
        depth -= 1
        if (depth === 0 && start !== -1) {
          matches.push(value.slice(start, i + 1))
          start = -1
        }
      }
    }
  }

  return matches
}

const extractJson = (text) => {
  const raw = String(text || '').trim()

  const tryParse = (candidate) => {
    try {
      return JSON.parse(candidate)
    } catch {
      return null
    }
  }

  const direct = tryParse(raw)
  if (direct) {
    return direct
  }

  const fenced = raw.match(/```json\s*([\s\S]*?)```/i)
  if (fenced?.[1]) {
    const fencedParsed = tryParse(fenced[1].trim())
    if (fencedParsed) {
      return fencedParsed
    }
  }

  const objects = findBalancedJsonObjects(raw)
  for (const candidate of objects) {
    const parsed = tryParse(candidate)
    if (parsed) {
      return parsed
    }
  }

  return null
}

const decodeEscapedJsonString = (value) => {
  const raw = String(value || '')

  try {
    return JSON.parse(`"${raw}"`)
  } catch {
    return raw
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
  }
}

const extractPossiblyTruncatedField = (raw, key, nextKeys = []) => {
  const value = String(raw || '')
  const keyToken = `"${key}"`
  const keyIndex = value.indexOf(keyToken)
  if (keyIndex === -1) {
    return ''
  }

  const colonIndex = value.indexOf(':', keyIndex + keyToken.length)
  if (colonIndex === -1) {
    return ''
  }

  const startQuoteIndex = value.indexOf('"', colonIndex)
  if (startQuoteIndex === -1) {
    return ''
  }

  let escaped = false
  for (let i = startQuoteIndex + 1; i < value.length; i += 1) {
    const char = value[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '"') {
      return value.slice(startQuoteIndex + 1, i)
    }
  }

  const tail = value.slice(startQuoteIndex + 1)
  let cut = tail.length

  for (const nextKey of nextKeys) {
    const marker = `\n  "${nextKey}"`
    const markerIndex = tail.indexOf(marker)
    if (markerIndex !== -1 && markerIndex < cut) {
      cut = markerIndex
    }
  }

  return tail.slice(0, cut).trim()
}

const extractLooseComponentPayload = (text) => {
  const raw = String(text || '')
  const componentNameEscaped = extractPossiblyTruncatedField(raw, 'componentName', ['jsx', 'css', 'notes'])
  const jsxEscaped = extractPossiblyTruncatedField(raw, 'jsx', ['css', 'notes'])
  const cssEscaped = extractPossiblyTruncatedField(raw, 'css', ['notes'])
  const notesEscaped = extractPossiblyTruncatedField(raw, 'notes', [])

  const componentName = decodeEscapedJsonString(componentNameEscaped).trim()
  const jsx = decodeEscapedJsonString(jsxEscaped)
  const css = decodeEscapedJsonString(cssEscaped)
  const notes = decodeEscapedJsonString(notesEscaped)

  if (!jsx || !css) {
    return null
  }

  return {
    componentName: componentName || 'GeneratedComponent',
    jsx,
    css,
    notes,
  }
}

const parseGeminiTextResponse = (payload) => {
  const parts = payload?.candidates?.[0]?.content?.parts || []
  return parts
    .filter((part) => typeof part.text === 'string')
    .map((part) => part.text)
    .join('\n')
    .trim()
}

const requestBackendAPI = async ({ finalModel, userPrompt }) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  return fetch('/api/generate', {
    method: 'POST',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 2600,
        responseMimeType: 'application/json',
      },
    }),
  }).finally(() => clearTimeout(timeout))
}

const requestGemini = async ({ finalModel, apiKey, userPrompt }) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  return fetch(
    `${GEMINI_API_URL}/${encodeURIComponent(finalModel)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    },
  ).finally(() => clearTimeout(timeout))
}

const buildGeminiError = async (response, finalModel) => {
  const raw = await response.text()

  let parsed = null
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = null
  }

  const apiMessage = parsed?.error?.message || raw
  const retryInfo = parsed?.error?.details?.find(
    (detail) => detail?.['@type'] === 'type.googleapis.com/google.rpc.RetryInfo',
  )
  const retryDelay = normalizeRetryDelay(retryInfo?.retryDelay)

  if (response.status === 429) {
    const retryLine = retryDelay
      ? ` Retry after about ${retryDelay}.`
      : ' Retry after a short delay.'

    throw new Error(
      `Gemini quota/rate limit reached for model "${finalModel}".${retryLine} ` +
        'Try model "gemini-3-flash-preview", or enable billing in Google AI Studio/Cloud.',
    )
  }

  throw new Error(`Gemini request failed (${response.status}): ${apiMessage}`)
}

export async function generateComponentWithGemini({ prompt, model }) {
  const finalModel = sanitizeModelName(model)

  const userPrompt = `
You are an expert React UI engineer. Generate complete, production-ready components.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON (no explanations, markdown, or backticks)
2. ALL CSS RULES MUST BE COMPLETE - no truncated properties or unfinished values
3. All string values must be properly escaped for JSON
4. Check your output before responding

JSON Format (must be valid):
{
  "componentName": "ComponentName",
  "jsx": "export default function ComponentName(){ return <div>content</div> }",
  "css": "/* Complete CSS with all properties finished */",
  "notes": "Brief description"
}

EXAMPLES OF VALID CSS (complete values):
.button { color: blue; font-size: 16px; } ✓
.button { transition: all 0.3s ease; } ✓
.button { transition: all 0.3s ease, transform 0.2s; } ✓

INVALID CSS (incomplete - DO NOT DO THIS):
.button { transition: } ✗ (missing value)
.button { color: } ✗ (missing value)
.button { font-size } ✗ (missing colon and value)

Generate a component for:
${prompt}

VERIFY: Your response is valid JSON and all CSS properties have complete values.`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 2600,
          responseMimeType: 'application/json',
        },
      }),
    })
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') {
      throw new Error(
        `Backend request timed out after ${Math.round(REQUEST_TIMEOUT_MS / 1000)}s. ` +
          'Use a shorter prompt or try again.',
      )
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    if (response.status === 503) {
      throw new Error('Backend is unavailable. Please try again.')
    }
    const errorText = await response.text()
    throw new Error(`Backend error (${response.status}): ${errorText}`)
  }

  const data = await response.json()

  if (data?.jsx && data?.componentName) {
    return {
      componentName: data.componentName,
      jsx: data.jsx,
      css: data.css || '',
      notes: data.notes || '',
    }
  }

  throw new Error('Backend returned invalid component data.')
}
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const MAX_503_RETRIES = 0
const REQUEST_TIMEOUT_MS = 18000

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
          maxOutputTokens: 2600,
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
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Add it in .env and restart the dev server.')
  }

  const finalModel = sanitizeModelName(model)

  const userPrompt = `You are an expert React UI engineer.
Return only JSON with this shape:
{
  "componentName": "PascalCaseName",
  "jsx": "React component code as plain text. Export default component.",
  "css": "CSS styles as plain text",
  "notes": "short optional integration note"
}

Rules:
- JSX must be valid for React + Vite JavaScript.
- No markdown fences.
- No external UI libraries.
- Return exactly one JSON object and nothing else.
- Keep classes semantic and readable.
- Keep output concise and production-ready.
- Limit JSX to around 120 lines and CSS to around 180 lines.
- Avoid very large decorative blocks.

Request:\n${prompt}`

  let response = null
  try {
    for (let attempt = 0; attempt <= MAX_503_RETRIES; attempt += 1) {
      response = await requestGemini({ finalModel, apiKey, userPrompt })

      if (response.status !== 503) {
        break
      }

      if (attempt < MAX_503_RETRIES) {
        await sleep(get503BackoffMs(attempt))
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(
        `Gemini request timed out after ${Math.round(REQUEST_TIMEOUT_MS / 1000)}s. ` +
          'Use a shorter prompt or try again.',
      )
    }

    throw err
  }

  if (!response.ok) {
    if (response.status === 503) {
      throw new Error(
        `Gemini model "${finalModel}" is under high demand right now. ` +
          'Automatic retries were attempted. Please try again in a minute or switch to another Gemini model.',
      )
    }

    await buildGeminiError(response, finalModel)
  }

  const data = await response.json()
  const text = parseGeminiTextResponse(data)

  if (!text) {
    throw new Error('Gemini returned an empty response.')
  }

  const parsed = extractJson(text)

  if (!parsed?.jsx || !parsed?.css) {
    const looseParsed = extractLooseComponentPayload(text)
    if (looseParsed) {
      return {
        componentName: looseParsed.componentName,
        jsx: looseParsed.jsx,
        css: looseParsed.css,
        notes:
          looseParsed.notes ||
          'Recovered from non-strict/truncated JSON response. Consider re-generating for a cleaner output.',
      }
    }
  }

  if (!parsed?.jsx || !parsed?.css) {
    return {
      componentName: 'GeneratedComponent',
      jsx: text,
      css: '/* Gemini did not return separate CSS. */',
      notes: 'The response was not strict JSON, so raw output is shown in JSX tab.',
    }
  }

  return {
    componentName: parsed.componentName || 'GeneratedComponent',
    jsx: parsed.jsx,
    css: parsed.css,
    notes: parsed.notes || '',
  }
}
const escapeScriptTagTerminator = (value) =>
  String(value || '').replace(/<\/script/gi, '<\\/script')

const escapeStyleTagTerminator = (value) =>
  String(value || '').replace(/<\/style/gi, '<\\/style')

const toIdentifier = (value, fallback = 'GeneratedComponent') => {
  const normalized = String(value || '')
    .replace(/[^a-zA-Z0-9_$]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part, index) => {
      const lower = part.toLowerCase()
      return index === 0 ? lower : lower[0].toUpperCase() + lower.slice(1)
    })
    .join('')

  const prefixed = normalized.match(/^[a-zA-Z_$]/)
    ? normalized
    : `${fallback}${normalized}`

  return prefixed || fallback
}

const normalizePreviewJsx = (jsx, componentName) => {
  const fallbackName = toIdentifier(componentName)
  let source = String(jsx || '').trim()
  let exportedName = null

  // If incoming code contains escaped closing tags (<\/div>), convert back to valid JSX (</div>).
  source = source.replace(/<\\\//g, '</')

  // Remove import statements because iframe executes in script context, not ESM module context.
  source = source
    .split('\n')
    .filter((line) => !/^\s*import\s.+from\s+['"].+['"]\s*;?\s*$/.test(line))
    .join('\n')

  // Convert module-style export default to a script-friendly declaration.
  if (/export\s+default\s+/.test(source)) {
    source = source.replace(/export\s+default\s+/, 'const __PreviewDefault = ')
    exportedName = '__PreviewDefault'
  }

  // Remove named exports that can also break script evaluation.
  source = source.replace(/^\s*export\s+\{[^}]+\}\s*;?\s*$/gm, '')

  return {
    source,
    candidates: [exportedName, fallbackName, 'GeneratedComponent'].filter(Boolean),
  }
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

const parseEmbeddedJsonPayload = (value) => {
  const raw = String(value || '').trim()
  if (!raw.includes('"jsx"')) {
    return null
  }

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

  const objects = findBalancedJsonObjects(raw)
  for (const candidate of objects) {
    const parsed = tryParse(candidate)
    if (parsed?.jsx || parsed?.css) {
      return parsed
    }
  }

  return null
}

export const buildPreviewDoc = (jsx, css, componentName) => {
  const embedded = parseEmbeddedJsonPayload(jsx)
  const resolvedJsx = embedded?.jsx || jsx
  const resolvedCss = embedded?.css || css
  const resolvedComponentName = embedded?.componentName || componentName

  const normalized = normalizePreviewJsx(resolvedJsx, resolvedComponentName)
  const safeJsx = escapeScriptTagTerminator(normalized.source)
  const safeCss = escapeStyleTagTerminator(resolvedCss)
  const safeCandidates = JSON.stringify(normalized.candidates)

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      body {
        margin: 0;
        font-family: "Space Grotesk", "Segoe UI", sans-serif;
        background: linear-gradient(180deg, #fff7ed, #ffedd5);
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        box-sizing: border-box;
      }
      #mount {
        width: min(960px, 100%);
      }
      ${safeCss}
    </style>
  </head>
  <body>
    <div id="mount"></div>
    <script id="component-source" type="text/plain">${safeJsx}</script>
    <script>
      const mountNode = document.getElementById('mount');
      const candidateNames = ${safeCandidates};

      const renderError = (title, error) => {
        const details = error && (error.stack || error.message || String(error));
        mountNode.innerHTML =
          '<div style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background:#fff1f2; border:1px solid #fecdd3; color:#9f1239; border-radius:12px; padding:14px; line-height:1.45;">' +
          '<strong style="display:block; margin-bottom:8px;">' + title + '</strong>' +
          '<pre style="white-space:pre-wrap; margin:0;">' + (details || 'Unknown error') + '</pre>' +
          '</div>';
      };

      window.addEventListener('error', (event) => {
        renderError('Preview runtime error', event.error || event.message);
      });

      const loadScript = (urls) =>
        new Promise((resolve, reject) => {
          const tryNext = (index) => {
            if (index >= urls.length) {
              reject(new Error('Unable to load script from all provided CDNs.'));
              return;
            }

            const script = document.createElement('script');
            script.src = urls[index];
            script.async = false;
            script.crossOrigin = 'anonymous';
            script.onload = () => resolve();
            script.onerror = () => {
              script.remove();
              tryNext(index + 1);
            };
            document.head.appendChild(script);
          };

          tryNext(0);
        });

      const boot = async () => {
        try {
          await loadScript([
            'https://unpkg.com/react@18/umd/react.production.min.js',
            'https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js'
          ]);
          await loadScript([
            'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
            'https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js'
          ]);
          await loadScript([
            'https://unpkg.com/@babel/standalone/babel.min.js',
            'https://cdn.jsdelivr.net/npm/@babel/standalone/babel.min.js'
          ]);

          if (!window.React || !window.ReactDOM || !window.Babel) {
            throw new Error('React/ReactDOM/Babel did not load. Check network or browser extensions.');
          }

          const source = document.getElementById('component-source').textContent;
          const transpiled = window.Babel.transform(source, { presets: ['react'] }).code;
          const runtimeCode = [
            'const { useState, useEffect, useMemo, useRef, useCallback, useContext, useReducer, Fragment } = React;',
            transpiled,
            'let RootComponent = null;',
            'for (const name of candidateNames) {',
            '  try {',
            '    const maybe = eval(name);',
            '    if (typeof maybe === "function") {',
            '      RootComponent = maybe;',
            '      break;',
            '    }',
            '  } catch {',
            '    // keep checking',
            '  }',
            '}',
            'if (!RootComponent) {',
            "  throw new Error('No renderable component found. Ensure JSX exports or defines a component function.');",
            '}',
            'ReactDOM.createRoot(mountNode).render(React.createElement(RootComponent));',
          ].join('\\n');

          const runPreview = new Function(
            'React',
            'ReactDOM',
            'mountNode',
            'candidateNames',
            runtimeCode,
          );

          runPreview(window.React, window.ReactDOM, mountNode, candidateNames);
        } catch (error) {
          renderError('Preview build failed', error);
        }
      };

      boot();
    </script>
  </body>
</html>`
}
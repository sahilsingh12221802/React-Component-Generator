import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import path from "path";
import prom from "prom-client";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

// ===== PROMETHEUS METRICS SETUP =====
const register = new prom.Registry();

// Default metrics (memory, CPU, etc)
prom.collectDefaultMetrics({ register });

// Custom metrics
const apiRequestsTotal = new prom.Counter({
  name: "api_requests_total",
  help: "Total number of API requests",
  labelNames: ["method", "path", "status"],
  registers: [register],
});

const apiRequestDuration = new prom.Histogram({
  name: "api_request_duration_seconds",
  help: "API request duration in seconds",
  labelNames: ["method", "path", "status"],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

const geminiApiCalls = new prom.Counter({
  name: "gemini_api_calls_total",
  help: "Total Gemini API calls",
  labelNames: ["status"],
  registers: [register],
});

const geminiApiDuration = new prom.Histogram({
  name: "gemini_api_duration_seconds",
  help: "Gemini API call duration",
  labelNames: ["status"],
  buckets: [1, 5, 10, 20, 40],
  registers: [register],
});

const systemCpuUsage = new prom.Gauge({
  name: "system_cpu_usage_percent",
  help: "CPU usage percentage",
  registers: [register],
});

const systemMemoryUsage = new prom.Gauge({
  name: "system_memory_usage_bytes",
  help: "Memory usage in bytes",
  registers: [register],
});

const systemMemoryTotal = new prom.Gauge({
  name: "system_memory_total_bytes",
  help: "Total system memory in bytes",
  registers: [register],
});

const generatedComponentsTotal = new prom.Counter({
  name: "generated_components_total",
  help: "Total components generated",
  registers: [register],
});

// Update system metrics every 5 seconds
setInterval(() => {
  const usage = process.memoryUsage();
  systemMemoryUsage.set(usage.heapUsed);
  systemMemoryTotal.set(usage.heapTotal);
  
  // CPU usage approximation
  const cpuUsage = process.cpuUsage();
  const totalUsage = (cpuUsage.user + cpuUsage.system) / 1000000;
  systemCpuUsage.set(Math.min(totalUsage * 100, 100)); // Cap at 100%
}, 5000);

function sanitizeCss(cssInput, isPossiblyTruncated = false) {
  if (typeof cssInput !== "string") {
    return "";
  }

  const lines = cssInput.split("\n");
  let idx = lines.length - 1;

  while (idx >= 0 && lines[idx].trim() === "") {
    idx -= 1;
  }

  if (idx >= 0) {
    const lastLine = lines[idx];
    if (/\w\s*:\s*$/.test(lastLine)) {
      lines[idx] = `${lastLine} 0;`;
    } else if (/\w\s*:\s*[^;{}]+$/.test(lastLine.trim())) {
      lines[idx] = `${lastLine};`;
    }
  }

  let css = lines.join("\n");
  const openBraces = (css.match(/\{/g) || []).length;
  const closeBraces = (css.match(/\}/g) || []).length;

  if (openBraces > closeBraces) {
    css += `\n${"}\n".repeat(openBraces - closeBraces)}`;
  }

  if (isPossiblyTruncated) {
    css = css.trimEnd();
    if (css && !css.endsWith(";") && !css.endsWith("}")) {
      css += ";";
    }
  }

  return css;
}

function extractJsonStringField(source, key) {
  const keyToken = `"${key}"`;
  const keyPos = source.indexOf(keyToken);
  if (keyPos === -1) {
    return null;
  }

  const colonPos = source.indexOf(":", keyPos + keyToken.length);
  if (colonPos === -1) {
    return null;
  }

  let quotePos = colonPos + 1;
  while (quotePos < source.length && source[quotePos] !== '"') {
    quotePos += 1;
  }

  if (quotePos >= source.length) {
    return null;
  }

  let i = quotePos + 1;
  let value = "";

  while (i < source.length) {
    const ch = source[i];
    if (ch === "\\") {
      if (i + 1 < source.length) {
        value += source.slice(i, i + 2);
        i += 2;
        continue;
      }

      value += "\\\\";
      i += 1;
      continue;
    }

    if (ch === '"') {
      return { value, truncated: false };
    }

    value += ch;
    i += 1;
  }

  return { value, truncated: true };
}

function decodePossiblyTruncatedJsonString(raw) {
  if (typeof raw !== "string") {
    return "";
  }

  const normalized = raw.replace(/\r?\n/g, "\\n");
  try {
    return JSON.parse(`"${normalized}"`);
  } catch {
    return raw
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "\r")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
}

function repairComponentPayloadFromText(textContent) {
  const componentNameField = extractJsonStringField(textContent, "componentName");
  const jsxField = extractJsonStringField(textContent, "jsx");
  const cssField = extractJsonStringField(textContent, "css");
  const notesField = extractJsonStringField(textContent, "notes");

  if (!jsxField) {
    return null;
  }

  const componentName = componentNameField
    ? decodePossiblyTruncatedJsonString(componentNameField.value)
    : "GeneratedComponent";
  const jsx = decodePossiblyTruncatedJsonString(jsxField.value);
  const css = cssField
    ? decodePossiblyTruncatedJsonString(cssField.value)
    : "";
  const notes = notesField
    ? decodePossiblyTruncatedJsonString(notesField.value)
    : "Recovered from a truncated model response.";

  if (!jsx.trim()) {
    return null;
  }

  return {
    componentName: componentName || "GeneratedComponent",
    jsx,
    css: sanitizeCss(css, Boolean(cssField?.truncated)),
    notes,
  };
}

// ===== ROUTES =====

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  try {
    const metrics = await register.metrics();
    res.set("Content-Type", register.contentType);
    res.end(metrics);
  } catch (error) {
    console.error("❌ Failed to collect metrics:", error.message);
    res.status(500).send("Failed to collect metrics");
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  res.json({
    status: "healthy",
    uptime,
    memory: {
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024), // MB
    },
  });
});

// API endpoint - forwards request to Gemini
app.post("/api/generate", async (req, res) => {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 40000);
  
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY not set");
      clearTimeout(timeout);
      apiRequestsTotal.labels("POST", "/api/generate", "400").inc();
      apiRequestDuration.labels("POST", "/api/generate", "400").observe((Date.now() - startTime) / 1000);
      return res.status(400).json({ error: "GEMINI_API_KEY environment variable is not set" });
    }

    console.log("📤 Forwarding request to Gemini API...");
    const geminiStartTime = Date.now();
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);
    const geminiDuration = (Date.now() - geminiStartTime) / 1000;
    geminiApiDuration.labels(response.ok ? "success" : "error").observe(geminiDuration);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini API error (${response.status}):`, errorText);
      geminiApiCalls.labels("error").inc();
      apiRequestsTotal.labels("POST", "/api/generate", response.status.toString()).inc();
      apiRequestDuration.labels("POST", "/api/generate", response.status.toString()).observe((Date.now() - startTime) / 1000);
      return res.status(response.status).json({ error: `Gemini API error: ${errorText}` });
    }

    const data = await response.json();
    console.log("✅ Response received from Gemini API");

    // Extract text content from Gemini response
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const textContent = data.candidates[0].content.parts[0].text;
      
      try {
        const parsedContent = JSON.parse(textContent);
        const jsonContent = {
          componentName: parsedContent.componentName || "GeneratedComponent",
          jsx: parsedContent.jsx || "",
          css: sanitizeCss(parsedContent.css || ""),
          notes: parsedContent.notes || "",
        };

        if (!jsonContent.jsx.trim()) {
          throw new Error("Parsed JSON missing jsx field");
        }

        console.log("✅ Parsed JSON content successfully");

        generatedComponentsTotal.inc();
        geminiApiCalls.labels("success").inc();
        apiRequestsTotal.labels("POST", "/api/generate", "200").inc();
        apiRequestDuration.labels("POST", "/api/generate", "200").observe((Date.now() - startTime) / 1000);
        return res.json(jsonContent);
      } catch (parseError) {
        console.warn("⚠️  JSON parse failed, attempting structured recovery");
        const repairedContent = repairComponentPayloadFromText(textContent);

        if (repairedContent) {
          console.log("✅ Recovered component payload from truncated JSON response");
          generatedComponentsTotal.inc();
          geminiApiCalls.labels("success").inc();
          apiRequestsTotal.labels("POST", "/api/generate", "200").inc();
          apiRequestDuration.labels("POST", "/api/generate", "200").observe((Date.now() - startTime) / 1000);
          return res.json(repairedContent);
        }

        geminiApiCalls.labels("error").inc();
        apiRequestsTotal.labels("POST", "/api/generate", "502").inc();
        apiRequestDuration.labels("POST", "/api/generate", "502").observe((Date.now() - startTime) / 1000);
        return res.status(502).json({
          error: "Model returned malformed JSON. Please try again with a shorter prompt.",
        });
      }
    }

    console.warn("⚠️  Empty or unexpected response structure");
    geminiApiCalls.labels("error").inc();
    apiRequestsTotal.labels("POST", "/api/generate", "500").inc();
    apiRequestDuration.labels("POST", "/api/generate", "500").observe((Date.now() - startTime) / 1000);
    return res.status(500).json({ error: "Empty response from Gemini API" });
  } catch (error) {
    clearTimeout(timeout);
    
    if (error.name === 'AbortError') {
      console.error("❌ Request timeout (40s exceeded)");
      geminiApiCalls.labels("timeout").inc();
      apiRequestsTotal.labels("POST", "/api/generate", "504").inc();
      apiRequestDuration.labels("POST", "/api/generate", "504").observe((Date.now() - startTime) / 1000);
      return res.status(504).json({ error: "Request timeout - Gemini API is slow. Please try again." });
    }
    
    console.error("❌ Backend error:", error.message);
    geminiApiCalls.labels("error").inc();
    apiRequestsTotal.labels("POST", "/api/generate", "500").inc();
    apiRequestDuration.labels("POST", "/api/generate", "500").observe((Date.now() - startTime) / 1000);
    return res.status(500).json({ error: `Failed to call Gemini API: ${error.message}` });
  }
});

// Serve static frontend
app.use(express.static(path.join(__dirname, "../dist")));

// SPA fallback - serve index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 5006;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n✅ React Component Generator is running!`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🚀 Backend API: http://localhost:${PORT}/api/generate`);
  console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`🔑 GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Not set'}\n`);
});

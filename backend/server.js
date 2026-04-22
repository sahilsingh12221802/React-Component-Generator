import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../dist")));

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

app.post("/api/generate", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY not set");
      return res.status(400).json({ error: "GEMINI_API_KEY environment variable is not set" });
    }

    console.log("📤 Forwarding request to Gemini API...");
    console.log("📋 Request body:", JSON.stringify(req.body).substring(0, 200));
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini API error (${response.status}):`, errorText);
      return res.status(response.status).json({ error: `Gemini API error: ${errorText}` });
    }

    const data = await response.json();
    console.log("✅ Response received from Gemini API");
    console.log("📊 Response structure:", JSON.stringify(data, null, 2).substring(0, 500));

    // Extract text content from Gemini response
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      console.log("📝 Candidate found");
      
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const textContent = candidate.content.parts[0].text;
        console.log("✏️  Text content length:", textContent?.length || 0);
        
        if (!textContent) {
          console.warn("⚠️  Text content is empty!");
          return res.json({
            componentName: "GeneratedComponent",
            jsx: "/* Empty response from API */",
            css: "",
            notes: "Error: Empty response from Gemini API"
          });
        }
        
        // Try to parse as JSON if it's supposed to be JSON
        try {
          const jsonContent = JSON.parse(textContent);
          console.log("✅ Parsed JSON content successfully");
          return res.json(jsonContent);
        } catch (parseError) {
          console.log("⚠️  Content is not JSON, returning as text");
          return res.json({
            componentName: "GeneratedComponent",
            jsx: textContent,
            css: "",
            notes: "Note: Response was not valid JSON"
          });
        }
      }
    }

    // Fallback: return raw data if structure is different
    console.log("⚠️  Unexpected response structure");
    console.log("📊 Full response:", JSON.stringify(data, null, 2));
    res.json({
      componentName: "GeneratedComponent",
      jsx: "/* Unexpected response structure - check logs */",
      css: "",
      notes: "Error: Unexpected API response structure"
    });
  } catch (error) {
    console.error("❌ Backend error:", error.message);
    console.error("📋 Error stack:", error.stack);
    res.status(500).json({ error: `Failed to call Gemini API: ${error.message}` });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => {
  console.log(`\n✅ React Component Generator is running!`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🚀 Backend API: http://localhost:${PORT}/api/generate`);
  console.log(`🔑 GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Not set'}\n`);
});
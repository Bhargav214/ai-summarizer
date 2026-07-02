// pages/api/summarize.js - simplified: use direct fetch to GROQ API
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });  
const SYSTEM_PROMPT = `You are an expert AI Summarizer specialized in extracting and condensing information from any format (articles, research papers, PDFs, transcripts, code, documentation, videos).`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { content, inputType = "article" } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Content is required" });
    }

    if (content.length > 100000) {
      return res.status(400).json({ error: "Content exceeds 100,000 characters" });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GROQ_API_KEY in environment" });
    }

    const userMessage = `INPUT TYPE: ${inputType}

CONTENT TO SUMMARIZE:
${content}

Please provide a comprehensive bullet-point summary following all guidelines.`;

    const payload = {
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage }
      ],
      max_tokens: 4096,
    };

    const apiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      throw new Error(data?.error?.message || JSON.stringify(data));
    }

    const summary = data.choices?.[0]?.message?.content || "";

    res.status(200).json({
      success: true,
      summary,
      inputLength: content.length,
      inputType,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Summarization error:", error);

    if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
      return res.status(401).json({
        error: "Invalid API key. Check GROQ_API_KEY in environment variables."
      });
    }

    if (error.message?.includes("429")) {
      return res.status(429).json({
        error: "Rate limit hit. Please wait a moment and retry."
      });
    }

    res.status(500).json({
      error: error.message || "Failed to generate summary"
    });
  }
}
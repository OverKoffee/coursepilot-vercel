import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import {
  transcriptAnalysisPrompt,
  transcriptAnalysisSchema,
} from "./openaiPrompts";

interface AnalyzeTranscriptRequestBody {
  fileBase64?: string;
  fileName?: string;
  major?: string;
  minor?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("API 1: request received");

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const { fileBase64, fileName, major, minor } =
      req.body as AnalyzeTranscriptRequestBody;

    if (!fileBase64 || !fileName) {
      return res.status(400).json({
        error: "Missing fileBase64 or fileName.",
      });
    }

    console.log("API upload file:", fileName);
    console.log("API upload base64 length:", fileBase64.length);
    console.log("API selected major:", major);
    console.log("API selected minor:", minor || "None");

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log("API 2: calling OpenAI with uploaded PDF");

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_file",
              filename: fileName,
              file_data: `data:application/pdf;base64,${fileBase64}`,
            },
            {
              type: "input_text",
              text: transcriptAnalysisPrompt,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "transcript_courses",
          strict: true,
          schema: transcriptAnalysisSchema,
        },
      },
    });

    console.log("API 3: OpenAI responded");
    console.log("OPENAI OUTPUT TEXT:");
    console.log(response.output_text);

    return res.status(200).json(JSON.parse(response.output_text));
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({
      error: "Failed to analyze transcript",
    });
  }
}
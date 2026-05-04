import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import {
  scheduleGenerationPrompt,
  scheduleGenerationSchema,
} from "./openaiPrompts";
import { courseCatalog } from "../src/data/courseRequirements";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("SCHEDULE API 1: request received");

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const { session_id, preferences, audit_context } = req.body;

    if (!session_id || !preferences || !audit_context) {
      return res.status(400).json({
        error: "Missing session_id, preferences, or audit_context.",
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const planningPayload = {
      session_id,
      preferences,
      audit_context,
      course_catalog: courseCatalog,
    };

    console.log("SCHEDULE API 2: calling OpenAI");
    console.log("Planning payload:", JSON.stringify(planningPayload, null, 2));

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `${scheduleGenerationPrompt}

Planning data:
${JSON.stringify(planningPayload, null, 2)}
`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "schedule_generation",
          strict: true,
          schema: scheduleGenerationSchema,
        },
      },
    });

    console.log("SCHEDULE API 3: OpenAI responded");
    console.log("SCHEDULE OUTPUT TEXT:");
    console.log(response.output_text);

    return res.status(200).json(JSON.parse(response.output_text));
  } catch (err) {
    console.error("SCHEDULE API ERROR:", err);

    return res.status(500).json({
      error: "Failed to generate schedule",
    });
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("API 1: request received");

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log("API 2: calling OpenAI");

    const transcriptText = `
CMSC 150 Introduction to Programming 3 A
BIO 201 Biology I 4 B
STAT 200 Introduction to Statistics 3 A
`;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: "Extract courses from transcript text.",
        },
        {
          role: "user",
          content: transcriptText,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "courses",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              courses: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    course_code: { type: "string" },
                    course_name: { type: "string" },
                    credits: { type: "number" },
                    grade: { type: "string" },
                  },
                  required: ["course_code", "course_name", "credits", "grade"],
                },
              },
            },
            required: ["courses"],
          },
        },
      },
    });

    console.log("API 3: OpenAI responded");

    return res.status(200).json(JSON.parse(response.output_text));
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ error: "Failed to analyze transcript" });
  }
}

import { PDFParse } from "pdf-parse";
import OpenAI from "openai";

interface ParsedCourse {
  course_code: string;
  course_name: string;
  credits: number;
  grade: string;
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();

    const fileBase64 = body.fileBase64 as string | undefined;
    const fileName = body.fileName as string | undefined;

    if (!fileBase64 || !fileName) {
      return Response.json(
        { error: "Missing PDF file data." },
        { status: 400 },
      );
    }

    const pdfBuffer = Buffer.from(fileBase64, "base64");

    const parser = new PDFParse({ data: pdfBuffer });
    const parsedPdf = await parser.getText();
    const transcriptText = parsedPdf.text;
    await parser.destroy();

    if (!transcriptText.trim()) {
      return Response.json(
        { error: "No readable text found in the PDF." },
        { status: 400 },
      );
    }

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content:
            "You extract completed college courses from transcript text. Return only courses that appear on the transcript. Do not invent courses.",
        },
        {
          role: "user",
          content: `Extract course_code, course_name, credits, and grade from this transcript text:\n\n${transcriptText}`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "transcript_courses",
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

    const parsed = JSON.parse(response.output_text) as {
      courses: ParsedCourse[];
    };

    return Response.json({
      fileName,
      extractedTextPreview: transcriptText.slice(0, 1000),
      courses: parsed.courses,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze transcript.",
      },
      { status: 500 },
    );
  }
}

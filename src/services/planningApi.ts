import { supabase } from "../lib/supabase";
import {
  courseCatalog,
  getEligibleCourses,
  getRemainingRequirements,
} from "../data/courseRequirements";
import type {
  AuditResultsResponse,
  CourseCard,
  SchedulePreferences,
  ScheduleResultsResponse,
} from "../types/planning";

export interface AnalyzeTranscriptParams {
  file: File;
  major: string;
  minor?: string;
}

export interface GenerateScheduleOptionsParams {
  sessionId: string;
  preferences: SchedulePreferences;
}

interface ParsedCourse {
  course_code: string;
  course_name: string;
  credits: number;
  grade: string;
}

const USE_MOCK_TRANSCRIPT_ANALYSIS = false;
const USE_MOCK_SCHEDULE_GENERATION = false;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

function normalizeCourseCode(courseCode: string): string {
  return courseCode.trim().toUpperCase().replace(/\s+/g, " ");
}

function normalizeTranscriptAnalysisResponse(courses: ParsedCourse[]) {
  const uniqueCourses = new Map<string, ParsedCourse>();

  for (const course of courses) {
    const courseCode = normalizeCourseCode(course.course_code);

    if (!courseCode) {
      continue;
    }

    uniqueCourses.set(courseCode, {
      course_code: courseCode,
      course_name: course.course_name || courseCatalog[courseCode]?.title || "",
      credits: course.credits || courseCatalog[courseCode]?.credits || 3,
      grade: course.grade || "T",
    });
  }

  return Array.from(uniqueCourses.values());
}

function toCourseCard(courseCode: string): CourseCard {
  return {
    course_code: courseCode,
    course_name: courseCatalog[courseCode]?.title ?? "",
    credits: courseCatalog[courseCode]?.credits ?? 3,
  };
}

function getMockTranscriptCourses(): ParsedCourse[] {
  return [
    {
      course_code: "CMSC 495",
      course_name: "Capstone in Computer Science",
      credits: 3,
      grade: "A",
    },
    {
      course_code: "CMSC 451",
      course_name: "Design and Analysis of Algorithms",
      credits: 3,
      grade: "A",
    },
    {
      course_code: "CMSC 335",
      course_name: "Object-Oriented and Concurrent Programming",
      credits: 3,
      grade: "A",
    },
    {
      course_code: "CMSC 405",
      course_name: "Computer Graphics",
      credits: 3,
      grade: "A",
    },
  ];
}

function getMockScheduleResultsResponse(
  sessionId: string,
  preferences: SchedulePreferences,
): ScheduleResultsResponse {
  return {
    session_id: sessionId,
    recommended_plan: {
      title: "Recommended Plan",
      recommended: true,
      semesters: [
        {
          term_label: "Fall 2026",
          courses: ["CMSC 105", "CMSC 115"],
        },
        {
          term_label: "Spring 2027",
          courses: ["CMSC 215", "CMSC 255"],
        },
        {
          term_label: "Fall 2027",
          courses: ["CMSC 315", "CMSC 412"],
        },
        {
          term_label: "Spring 2028",
          courses: ["CMSC 430", "CMSC 325"],
        },
      ],
    },
    alternate_plans: [
      "Take one lighter semester first, then increase pace after completing the programming sequence.",
      "Front-load prerequisite-heavy courses first so upper-level requirements unlock sooner.",
    ],
    course_breakdown: [
      `Enrollment pace: ${preferences.enrollment_pace}`,
      `Outside commitments: ${preferences.outside_commitments}`,
      `Course intensity: ${preferences.course_intensity}`,
      `Target graduation: ${preferences.target_graduation}`,
    ],
  };
}

function normalizeGrade(grade: string): string {
  return grade.trim().toUpperCase();
}

function isPassingForDegree(grade: string): boolean {
  const normalizedGrade = normalizeGrade(grade);

  const validGrades = [
    "A",
    "A-",
    "B+",
    "B",
    "B-",
    "C+",
    "C",
    "T",
    "TR",
    "TA",
    "TRANSFER",
  ];

  return validGrades.includes(normalizedGrade);
}

function needsManualReview(grade: string): boolean {
  const normalizedGrade = normalizeGrade(grade);

  return (
    normalizedGrade === "C-" ||
    normalizedGrade === "D+" ||
    normalizedGrade === "D" ||
    normalizedGrade === "D-" ||
    normalizedGrade === "F"
  );
}

export async function analyzeTranscript({
  file,
  major,
  minor,
}: AnalyzeTranscriptParams): Promise<AuditResultsResponse> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    throw new Error("User not authenticated.");
  }

  let parsedCourses: ParsedCourse[];

  if (USE_MOCK_TRANSCRIPT_ANALYSIS) {
    parsedCourses = getMockTranscriptCourses();
  } else {
    const fileBuffer = await file.arrayBuffer();
    const fileBase64 = arrayBufferToBase64(fileBuffer);
    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 60000);

    const aiResponse = await fetch("/api/analyze-transcript", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        fileBase64,
        fileName: file.name,
        major,
        minor,
      }),
    });

    window.clearTimeout(timeoutId);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();

      try {
        const errorData = JSON.parse(errorText) as { error?: string };
        throw new Error(errorData.error ?? "Transcript analysis failed.");
      } catch {
        throw new Error(
          `Transcript analysis failed with status ${aiResponse.status}: ${errorText}`,
        );
      }
    }

    const analyzedTranscript = (await aiResponse.json()) as {
      courses: ParsedCourse[];
    };

    parsedCourses = normalizeTranscriptAnalysisResponse(
      analyzedTranscript.courses,
    );
  }

  const sessionId = crypto.randomUUID();

  const validDegreeCourses = parsedCourses.filter((course) =>
    isPassingForDegree(course.grade),
  );

  const reviewCourses = parsedCourses.filter((course) =>
    needsManualReview(course.grade),
  );

  const completedCourseCodes = validDegreeCourses.map(
    (course) => course.course_code,
  );

  const remainingRequirementCodes = getRemainingRequirements(
    major,
    completedCourseCodes,
  );
  const eligibleCourseCodes = getEligibleCourses(remainingRequirementCodes);

  const completedCourseCards: CourseCard[] = validDegreeCourses.map(
    (course) => ({
      course_code: course.course_code,
      course_name: course.course_name,
      credits: course.credits,
      grade: course.grade,
    }),
  );

  const needsReviewCourseCards: CourseCard[] = reviewCourses.map((course) => ({
    course_code: course.course_code,
    course_name: course.course_name,
    credits: course.credits,
    grade: course.grade,
  }));

  const remainingRequirementCards = remainingRequirementCodes.map(toCourseCard);

  const eligibleCourseCards = eligibleCourseCodes.map(toCourseCard);

  const totalCompletedCredits = completedCourseCards.reduce(
    (sum, course) => sum + course.credits,
    0,
  );

  const creditsRemaining = remainingRequirementCards.reduce(
    (sum, course) => sum + course.credits,
    0,
  );

  const { error: uploadError } = await supabase
    .from("transcript_uploads")
    .insert({
      user_id: user.id,
      file_name: file.name,
      parsed_text: `AI parsed ${parsedCourses.length} courses from ${file.name}.`,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: courseError } = await supabase
    .from("completed_courses")
    .insert(
      parsedCourses.map((course) => ({
        user_id: user.id,
        course_code: course.course_code,
        course_name: course.course_name,
        credits: course.credits,
        grade: course.grade,
      })),
    );

  if (courseError) {
    throw new Error(courseError.message);
  }

  const auditContext: AuditResultsResponse = {
    session_id: sessionId,
    major,
    minor,
    completed_courses: completedCourseCards,
    total_completed_credits: totalCompletedCredits,
    credits_remaining: creditsRemaining,
    eligible_courses: eligibleCourseCards,
    remaining_requirements: remainingRequirementCards,
    needs_review_courses: needsReviewCourseCards,
  };

  sessionStorage.setItem(
    "coursepilot_audit_context",
    JSON.stringify(auditContext),
  );

  return auditContext;
}

export async function generateScheduleOptions({
  sessionId,
  preferences,
}: GenerateScheduleOptionsParams): Promise<ScheduleResultsResponse> {
  if (USE_MOCK_SCHEDULE_GENERATION) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return getMockScheduleResultsResponse(sessionId, preferences);
  }

  const auditContext = sessionStorage.getItem("coursepilot_audit_context");

  const response = await fetch("/api/generate-schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      preferences,
      planning_date: new Date().toISOString(),
      audit_context: auditContext ? JSON.parse(auditContext) : null,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Schedule generation failed with status ${response.status}`,
    );
  }

  return (await response.json()) as ScheduleResultsResponse;
}

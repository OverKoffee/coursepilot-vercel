export interface CourseCard {
  course_code: string;
  course_name: string;
  credits: number;
  grade?: string;
}

export interface AuditResultsResponse {
  session_id: string;
  major: string;
  minor?: string;
  completed_courses: CourseCard[];
  total_completed_credits: number;
  credits_remaining: number;
  eligible_courses: CourseCard[];
  remaining_requirements: CourseCard[];
  needs_review_courses: CourseCard[];
}

export interface SchedulePreferences {
  enrollment_pace: "light" | "moderate" | "heavy";
  outside_commitments: "school_only" | "work_family" | "major_obligations";
  course_intensity: "lighter_load" | "balanced" | "intensive";
  target_graduation: string;
}

export interface PlannedSemester {
  term_label: string;
  courses: string[];
}

export interface SchedulePlan {
  title: string;
  recommended: boolean;
  semesters: PlannedSemester[];
}

export interface ScheduleResultsResponse {
  session_id: string;
  recommended_plan: SchedulePlan;
  alternate_plans: string[];
  course_breakdown: string[];
}
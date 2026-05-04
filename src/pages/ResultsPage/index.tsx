import { Link, Navigate, useLocation } from "react-router-dom";
import type {
  AuditResultsResponse,
  SchedulePreferences,
  ScheduleResultsResponse,
} from "../../types/planning";
import styles from "./ResultsPage.module.css";

interface LocationState {
  scheduleResults?: ScheduleResultsResponse;
}

function readAuditResults(): AuditResultsResponse | null {
  const storedAuditResults =
    localStorage.getItem("audit_results") ??
    sessionStorage.getItem("coursepilot_audit_context");

  return storedAuditResults
    ? (JSON.parse(storedAuditResults) as AuditResultsResponse)
    : null;
}

function readPreferences(): SchedulePreferences | null {
  const storedPreferences = localStorage.getItem("schedule_preferences");

  return storedPreferences
    ? (JSON.parse(storedPreferences) as SchedulePreferences)
    : null;
}

export default function ResultsPage() {
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? null;

  const storedScheduleResults = localStorage.getItem("schedule_results");
  const parsedStoredScheduleResults = storedScheduleResults
    ? (JSON.parse(storedScheduleResults) as ScheduleResultsResponse)
    : null;

  const scheduleResults = state?.scheduleResults ?? parsedStoredScheduleResults;
  const auditResults = readAuditResults();
  const preferences = readPreferences();

  if (!scheduleResults) {
    return <Navigate to="/preferences" replace />;
  }

  const coursesInPlan = scheduleResults.recommended_plan.semesters.reduce(
    (total, semester) => total + semester.courses.length,
    0,
  );

  return (
    <section className={`page ${styles.page}`}>
      <div className={`card ${styles.card}`}>
        <div className={styles.brandRow}>
          <img
            src="/Course_Pilot_Logo.png"
            alt="CoursePilot Logo"
            className={styles.logo}
          />
          <span className={styles.brandText}>CoursePilot</span>
        </div>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Schedule options</h1>
            <p className={styles.subtitle}>
              Here is the recommended path based on your transcript and
              preferences.
            </p>
          </div>

          <span className={styles.sessionBadge}>
            Session {scheduleResults.session_id}
          </span>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricValue}>
              {auditResults?.credits_remaining ?? 0}
            </span>
            <span className={styles.metricLabel}>credits remaining</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricValue}>{coursesInPlan}</span>
            <span className={styles.metricLabel}>courses in this plan</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricValue}>
              {preferences?.target_graduation ?? "Not set"}
            </span>
            <span className={styles.metricLabel}>target graduation</span>
          </div>
        </div>

        {preferences ? (
          <div className={styles.preferencePills}>
            <span className={styles.preferencePill}>
              Pace: {preferences.enrollment_pace}
            </span>
            <span className={styles.preferencePill}>
              Commitments: {preferences.outside_commitments}
            </span>
            <span className={styles.preferencePill}>
              Intensity: {preferences.course_intensity}
            </span>
          </div>
        ) : null}

        <div className={styles.recommendedCard}>
          <div className={styles.recommendedHeader}>
            <h2 className={styles.sectionTitle}>
              {scheduleResults.recommended_plan.title}
            </h2>

            {scheduleResults.recommended_plan.recommended ? (
              <span className={styles.recommendedBadge}>Recommended</span>
            ) : null}
          </div>

          <div className={styles.semesterGrid}>
            {scheduleResults.recommended_plan.semesters.map((semester) => (
              <article
                key={semester.term_label}
                className={styles.semesterCard}
              >
                <div className={styles.semesterHeader}>
                  <h3 className={styles.semesterTitle}>
                    {semester.term_label}
                  </h3>
                  <span className={styles.courseCountBadge}>
                    {semester.courses.length} courses
                  </span>
                </div>

                <ul className={styles.list}>
                  {semester.courses.map((course) => (
                    <li key={course} className={styles.listItem}>
                      {course}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.bottomGrid}>
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Alternate Plans</h3>
            <ul className={styles.list}>
              {scheduleResults.alternate_plans.map((plan) => (
                <li key={plan} className={styles.listItem}>
                  {plan}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Course Breakdown</h3>
            <ul className={styles.list}>
              {scheduleResults.course_breakdown.map((item) => (
                <li key={item} className={styles.listItem}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.actions}>
          <Link
            to="/preferences"
            className={`btn btn-secondary ${styles.actionButton}`}
          >
            Back
          </Link>

          <button
            type="button"
            className={`btn btn-primary ${styles.actionButton}`}
            disabled
          >
            Save plan
          </button>
        </div>
      </div>
    </section>
  );
}

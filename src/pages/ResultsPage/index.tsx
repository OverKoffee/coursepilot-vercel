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

  const enrollmentPaceLabel = (pace?: string) => {
    switch (pace) {
      case "heavy":
        return "Full time";
      case "moderate":
        return "Half time";
      case "light":
      default:
        return "Part time";
    }
  };

  const outsideCommitmentsLabel = (commitment?: string) => {
    switch (commitment) {
      case "school_only":
        return "Low";
      case "work_family":
        return "Medium";
      case "major_obligations":
      default:
        return "High";
    }
  };

  const courseIntensityLabel = (intensity?: string) => {
    switch (intensity) {
      case "lighter_load":
        return "Lighter load";
      case "balanced":
        return "Balanced";
      case "intensive":
      default:
        return "Intensive";
    }
  };

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
            <h1 className={styles.title}>Your schedule options</h1>
            <p className={styles.subtitle}>
              Here is the recommended plan based on your transcript progress and
              schedule preferences.
            </p>
          </div>

          {/*
            Session ID shown here was removed from the UI to avoid
            exposing internal session identifiers in the frontend.
            If you need to display or debug the session id, re-enable
            the element below with caution.

          <span className={styles.sessionBadge}>
            Session {scheduleResults.session_id}
          </span>
          */}
        </div>

        <div className={styles.contextGrid}>
          <div className={styles.contextCard}>
            <span className={styles.contextValue}>
              {auditResults?.credits_remaining ?? 0}
            </span>
            <span className={styles.contextLabel}>credits remaining</span>
          </div>

          <div className={styles.contextCard}>
            <span className={styles.contextValue}>{coursesInPlan}</span>
            <span className={styles.contextLabel}>courses in this plan</span>
          </div>

          <div className={styles.contextCard}>
            <span className={styles.contextValue}>
              {preferences?.target_graduation ?? "Not set"}
            </span>
            <span className={styles.contextLabel}>target graduation</span>
          </div>
        </div>

        {preferences ? (
          <div className={styles.preferenceStrip}>
            <span className={styles.preferencePill}>
              Pace: {enrollmentPaceLabel(preferences?.enrollment_pace)}
            </span>
            <span className={styles.preferencePill}>
              Commitments:{" "}
              {outsideCommitmentsLabel(preferences?.outside_commitments)}
            </span>
            <span className={styles.preferencePill}>
              Intensity: {courseIntensityLabel(preferences?.course_intensity)}
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
            {scheduleResults.recommended_plan.semesters.map(
              (semester, semesterIndex) => (
                <article
                  key={`${semester.term_label}-${semesterIndex}`}
                  className={styles.semesterCard}
                >
                  <div className={styles.semesterHeader}>
                    <h3 className={styles.semesterTitle}>
                      {semester.term_label}
                    </h3>

                    <span className={styles.semesterCount}>
                      {semester.courses.length} courses
                    </span>
                  </div>

                  <ul className={styles.list}>
                    {semester.courses.map((course, courseIndex) => (
                      <li
                        key={`${course}-${courseIndex}`}
                        className={styles.listItem}
                      >
                        {course}
                      </li>
                    ))}
                  </ul>
                </article>
              ),
            )}
          </div>
        </div>

        <div className={styles.bottomGrid}>
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Alternate plans</h3>
            {scheduleResults.alternate_plans.length > 0 ? (
              <ul className={styles.list}>
                {scheduleResults.alternate_plans.map((plan) => (
                  <li key={plan} className={styles.listItem}>
                    {plan}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.listEmpty}>
                No alternate plans were returned for this schedule.
              </p>
            )}
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Plan details</h3>
            {scheduleResults.course_breakdown.length > 0 ? (
              <ul className={styles.list}>
                {scheduleResults.course_breakdown.map((item) => (
                  <li key={item} className={styles.listItem}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.listEmpty}>
                No additional planning notes were returned for this schedule.
              </p>
            )}
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

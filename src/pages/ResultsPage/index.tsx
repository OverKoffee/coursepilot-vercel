import { Link, Navigate, useLocation } from "react-router-dom";
import type { ScheduleResultsResponse } from "../../types/planning";
import styles from "./ResultsPage.module.css";

interface LocationState {
  scheduleResults?: ScheduleResultsResponse;
}

export default function ResultsPage() {
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? null;

  const storedScheduleResults = localStorage.getItem("schedule_results");
  const parsedStoredScheduleResults = storedScheduleResults
    ? (JSON.parse(storedScheduleResults) as ScheduleResultsResponse)
    : null;

  const scheduleResults = state?.scheduleResults ?? parsedStoredScheduleResults;

  if (!scheduleResults) {
    return <Navigate to="/preferences" replace />;
  }

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
          <h1 className={styles.title}>Schedule options</h1>
          <p className={styles.subtitle}>
            Here is the recommended path based on your transcript and preferences.
          </p>
        </div>

        <div className={styles.recommendedCard}>
          <div className={styles.recommendedHeader}>
            <h2 className={styles.sectionTitle}>
              {scheduleResults.recommended_plan.title}
            </h2>
            <span className={styles.recommendedBadge}>Recommended</span>
          </div>

          <div className={styles.semesterGrid}>
            {scheduleResults.recommended_plan.semesters.map((semester) => (
              <div key={semester.term_label} className={styles.semesterCard}>
                <h3 className={styles.semesterTitle}>{semester.term_label}</h3>
                <ul className={styles.list}>
                  {semester.courses.map((course) => (
                    <li key={course} className={styles.listItem}>
                      {course}
                    </li>
                  ))}
                </ul>
              </div>
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
import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

export default function HomePage() {
  return (
    <div className={styles.homepageContainer}>
      <section className={styles.hero}>
        <div className="page">
          <h1>Plan your next semester with confidence.</h1>
          <p>
            CoursePilot turns your transcript into clear next-step course
            recommendations so you can stay on track.
          </p>
          <Link to="/upload" className="btn btn-primary">
            Upload Transcript
          </Link>
        </div>
      </section>

      <section className="page">
        <div className={styles.sectionHeader}>
          <h2>How it works</h2>
          <p>
            A simple 3-step flow to move from transcript data to a semester
            plan.
          </p>
        </div>

        <div className={styles.gridThree}>
          <article className="card">
            <span className={styles.stepNumber}>01</span>
            <h3>Upload Transcript</h3>
            <p>Submit your latest PDF transcript to start the planning flow.</p>
            <Link to="/upload" className="btn btn-muted">
              Go to Upload
            </Link>
          </article>

          <article className="card">
            <span className={styles.stepNumber}>02</span>
            <h3>Analyze Degree</h3>
            <p>
              We map completed credits against degree requirements and gaps.
            </p>
          </article>

          <article className="card">
            <span className={styles.stepNumber}>03</span>
            <h3>Build Schedule</h3>
            <p>
              Get a practical course sequence for upcoming terms based on your
              progress.
            </p>
          </article>
        </div>
      </section>

      <section className="page">
        <div className={styles.sectionHeader}>
          <h2>Testimonies</h2>
          <p>
            Students use CoursePilot to simplify planning and avoid missing key
            requirements.
          </p>
        </div>

        <div className={styles.gridThree}>
          <article className="card">
            <p>
              “I finally understood exactly which prerequisites I needed next.
              CoursePilot saved me from guessing.”
            </p>
            <span className={styles.author}>— Maya, CS Junior</span>
          </article>

          <article className="card">
            <p>
              “The upload and recommendation flow is super straightforward. I
              had a full plan in minutes.”
            </p>
            <span className={styles.author}>— Daniel, IT Sophomore</span>
          </article>

          <article className="card">
            <p>
              “This made advising meetings way more productive because I showed
              up with a concrete schedule draft.”
            </p>
            <span className={styles.author}>— Priya, Data Science Senior</span>
          </article>
        </div>
      </section>
    </div>
  );
}

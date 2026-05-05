import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

export default function HomePage() {
  return (
    <div className={styles.homepageContainer}>
      <section className={styles.hero}>
        <div className="page">
          <h1>Plan your next semester with confidence.</h1>
          <p>
            Upload your transcript, review your remaining requirements, and
            build a schedule that fits your pace.
          </p>
          <Link to="/upload" className="btn btn-primary">
            Start with your transcript
          </Link>
        </div>
      </section>

      <section className="page">
        <div className={styles.sectionHeader}>
          <h2>How it works</h2>
          <p>
            A straightforward three-step flow from transcript upload to a
            realistic course plan.
          </p>
        </div>

        <div className={styles.gridThree}>
          <article className="card">
            <span className={styles.stepNumber}>01</span>
            <h3>Upload your transcript</h3>
            <p>Submit your latest PDF so we can review completed coursework.</p>
            <Link to="/upload" className="btn btn-muted">
              Go to Upload
            </Link>
          </article>

          <article className="card">
            <span className={styles.stepNumber}>02</span>
            <h3>Review your degree audit</h3>
            <p>
              See what is complete, what is still remaining, and what you can
              take next.
            </p>
          </article>

          <article className="card">
            <span className={styles.stepNumber}>03</span>
            <h3>Generate schedule options</h3>
            <p>
              Turn your progress and preferences into a practical upcoming plan.
            </p>
          </article>
        </div>
      </section>

      <section className="page">
        <div className={styles.sectionHeader}>
          <h2>What students are saying</h2>
          <p>
            CoursePilot helps students make sense of prerequisites, remaining
            credits, and next-step planning.
          </p>
        </div>

        <div className={styles.gridThree}>
          <article className="card">
            <p>
              "I finally understood exactly which prerequisites I needed next.
              CoursePilot saved me from guessing."
            </p>
            <span className={styles.author}>Maya, CS junior</span>
          </article>

          <article className="card">
            <p>
              "The upload and recommendation flow is super straightforward. I
              had a full plan in minutes."
            </p>
            <span className={styles.author}>Daniel, IT sophomore</span>
          </article>

          <article className="card">
            <p>
              "This made advising meetings way more productive because I showed
              up with a concrete schedule draft."
            </p>
            <span className={styles.author}>Priya, Data Science senior</span>
          </article>
        </div>
      </section>
    </div>
  );
}

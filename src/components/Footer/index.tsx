import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        {/* !TODO: Add footer links and information */}

        <p>© {new Date().getFullYear()} CoursePilot. Plan smarter semesters.</p>
      </div>
    </footer>
  );
}

import { Link, NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.header}>
      <div className="container-row">
        <Link to="/" className={styles.brand}>
          CoursePilot
        </Link>

        <nav className={styles.navLinks} aria-label="Main navigation">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            Login
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            Upload
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

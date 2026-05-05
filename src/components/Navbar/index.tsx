import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (isMounted) {
        setSession(data.session);
      }
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("session_id");
    localStorage.removeItem("audit_results");
    localStorage.removeItem("schedule_preferences");
    localStorage.removeItem("schedule_results");
    sessionStorage.removeItem("coursepilot_audit_context");
  };

  const userEmail = session?.user.email;

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
          {session ? (
            <>
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ""}`
                }
              >
                Upload
              </NavLink>

              <div className={styles.userActions}>
                {userEmail ? (
                  <span className={styles.userBadge} title={userEmail}>
                    Signed in as {userEmail}
                  </span>
                ) : null}

                <button
                  type="button"
                  onClick={handleSignOut}
                  className={styles.signOutButton}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
            >
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

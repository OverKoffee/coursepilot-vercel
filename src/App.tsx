import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import UploadTranscriptPage from "./pages/UploadTranscriptPage";
import AuditResultsPage from "./pages/AuditResultsPage";
import PreferencesPage from "./pages/PreferencesPage";
import ResultsPage from "./pages/ResultsPage";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./services/ProtectedRoute";
import styles from "./App.module.css";

function App() {
  return (
    <div className={styles.appShell}>
      <Navbar />

      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/upload" element={<UploadTranscriptPage />} />
            <Route path="/audit-results" element={<AuditResultsPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/results" element={<ResultsPage />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
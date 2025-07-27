import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SWRConfig } from "swr";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Contexts
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";

// Components
import { StagewiseToolbar } from "@stagewise/toolbar-react";
import { ReactPlugin } from "@stagewise-plugins/react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import { LandingPage } from "./components/pages/LandingPage";
import { AuthForm } from "./components/pages/AuthForm";
import { DocumentLibrary } from "./components/pages/DocumentLibrary";
import { IeltsCenter } from "./components/pages/IeltsCenter";
import { OnlineQuizzes } from "./components/pages/OnlineQuizzes";
import { QuizManagement } from "./components/pages/QuizManagement";
import { QuizDashboardPage } from "./components/pages/QuizDashboardPage";
import { QuizSubmissionView } from "./components/pages/QuizSubmissionView";
import { WritingGrader } from "./components/pages/WritingGrader";
import { ExerciseEditor } from "./components/pages/ExerciseEditor";
import { IeltsTestPlayer } from "./components/pages/IeltsTestPlayer";
import { IeltsResultPage } from "./components/pages/IeltsResultPage";
import { Role } from "./types/api";

const RoleBasedRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  const isTeacher = user?.role === Role.TEACHER;

  console.log("RoleBasedRedirect:", {
    isAuthenticated,
    isTeacher,
    user,
    redirectTo: isTeacher ? "/quiz" : "/quizzes",
  });

  return <Navigate to={isTeacher ? "/quiz" : "/quizzes"} replace />;
};

function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stagewise Toolbar - only in development */}
      <StagewiseToolbar
        config={{
          plugins: [ReactPlugin],
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <LandingPage />
              </main>
              <Footer />
            </>
          }
        />

        <Route
          path="/login"
          element={
            <>
              <AuthForm mode="login" />
            </>
          }
        />

        <Route
          path="/signup"
          element={
            <>
              <AuthForm mode="signup" />
            </>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <>
              <AuthForm mode="forgot-password" />
            </>
          }
        />

        {/* Protected Profile Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <AuthForm mode="profile" />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <AuthForm mode="change-password" />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Redirect dashboard to role-based page */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedRedirect />
            </ProtectedRoute>
          }
        />

        {/* Exercise Routes */}
        <Route
          path="/exercises"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <ExerciseEditor />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Quiz Routes */}
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <OnlineQuizzes />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Quiz Management/Dashboard Route */}
        <Route
          path="/quiz"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <QuizManagement />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Individual Quiz Dashboard Route */}
        <Route
          path="/quiz/dashboard/:quizId"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <QuizDashboardPage />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Quiz Submission View Route */}
        <Route
          path="/quiz/submission/:submissionId"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <QuizSubmissionView />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz/:quizId/play"
          element={
            <ProtectedRoute>
              <main>
                <OnlineQuizzes />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz/:quizId"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <OnlineQuizzes />
              </main>
            </ProtectedRoute>
          }
        />

        {/* IELTS Routes */}
        <Route
          path="/ielts"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <IeltsCenter />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ielts-test/:testId/play"
          element={
            <ProtectedRoute>
              <main>
                <IeltsTestPlayer />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ielts/result/:submissionId"
          element={
            <ProtectedRoute>
              <main>
                <IeltsResultPage />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Document Library Routes */}
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <DocumentLibrary />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Writing Routes */}
        <Route
          path="/writing"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <WritingGrader />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Legacy Management Routes - Redirect to new structure */}
        <Route
          path="/management/exercises"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Navigate to="/exercises" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/management/quizzes"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Navigate to="/quiz" replace />
            </ProtectedRoute>
          }
        />

        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <SWRConfig
      value={{
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        dedupingInterval: 2000,
        focusThrottleInterval: 5000,
      }}
    >
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <AppContent />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </SWRConfig>
  );
}

export default App;

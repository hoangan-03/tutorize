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
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";

import { Header } from "./components/layout/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LandingOrRedirect } from "./components/LandingOrRedirect";
import { Modal } from "./components/ui";

// Context and Hooks
import { ModalProvider, useModal } from "./contexts/ModalContext";

// Pages
import { AuthForm } from "./pages/AuthForm";
import { ProfilePage } from "./pages/ProfilePage";
import { DocumentLibrary } from "./pages/DocumentLibrary";
import { IeltsView } from "./pages/IeltsView";
import { IeltsReadingSubmissionsList } from "./pages/IeltsReadingSubmissionsList";
import { IeltsReadingSubmissionDetail } from "./pages/IeltsReadingSubmissionDetail";
import { QuizListStudentView } from "./pages/QuizListStudentView";
import { QuizManagementTeacherView } from "./pages/QuizManagementTeacherView";
import { QuizDashboardTeacherView } from "./pages/QuizDashboardTeacherView";
import { QuizSubmissionsTeacherView } from "./pages/QuizSubmissionsTeacherView";
import { WritingGrader } from "./pages/WritingGrader";
import { ExerciseListTeacherView } from "./pages/ExerciseListTeacherView";
import { ExerciseDetailStudentView } from "./pages/ExerciseDetailStudentView";
import { ExerciseSubmissionListTeacherView } from "./pages/ExerciseSubmissionListTeacherView";
import { TeacherSubmissionView } from "./pages/ExerciseSubmissionDetailTeacherView";
import { QuizStudentReview } from "./pages/QuizReviewStudentView";
import { IeltsTestPlayer } from "./pages/IeltsTestPlayer";
import { IeltsWritingResultPage } from "./pages/IeltsWritingResultPage";
import { IeltsWritingSubmissionsList } from "./pages/IeltsWritingSubmissionsList";
import { IeltsWritingSubmissionDetail } from "./pages/IeltsWritingSubmissionDetail";
import { IeltsResultStudentView } from "./pages/IeltsResultStudentView";

function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { modal, closeModal } = useModal();

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <LandingOrRedirect
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
            />
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
              <ProfilePage />
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

        {/* Exercise Routes */}
        {/* Exercise Management Route (for teachers) */}
        <Route
          path="/exercises"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <ExerciseListTeacherView />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Individual Exercise Detail Route */}
        <Route
          path="/exercise/:exerciseId"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <ExerciseDetailStudentView />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Exercise Submissions List Route */}
        <Route
          path="/exercises/submissions"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <ExerciseSubmissionListTeacherView />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Teacher Submission Detail Route */}
        <Route
          path="/teacher/submissions/:submissionId"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <TeacherSubmissionView />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Student Submission Detail Route */}
        <Route
          path="/submissions/:submissionId"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <QuizSubmissionsTeacherView />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Alternative route format for consistency */}
        <Route
          path="/exercises/submissions/:submissionId"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <TeacherSubmissionView />
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
                <QuizListStudentView />
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
                <QuizManagementTeacherView />
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
                <QuizDashboardTeacherView />
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
                <QuizSubmissionsTeacherView />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Student Quiz Review Route */}
        <Route
          path="/quiz/submission/review/:quizId/:submissionId"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <QuizStudentReview />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz/:quizId/play"
          element={
            <ProtectedRoute>
              <main>
                <QuizListStudentView />
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
                <QuizListStudentView />
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
                <IeltsView />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ielts/submissions"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <IeltsReadingSubmissionsList />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ielts/submission/:id"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <IeltsReadingSubmissionDetail />
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
                <IeltsResultStudentView />
              </main>
            </ProtectedRoute>
          }
        />

        {/* IELTS Writing Routes */}
        <Route
          path="/ielts-writing/result/:submissionId"
          element={
            <ProtectedRoute>
              <main>
                <IeltsWritingResultPage />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ielts-writing/submissions"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <IeltsWritingSubmissionsList />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ielts-writing/submission/:submissionId"
          element={
            <ProtectedRoute>
              <Header
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
              <main>
                <IeltsWritingSubmissionDetail />
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
          path="/exercises/manage"
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

      {/* Global Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        autoClose={modal.autoClose}
        autoCloseDelay={modal.autoCloseDelay}
      />
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
          <ModalProvider>
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
          </ModalProvider>
        </AuthProvider>
      </LanguageProvider>
    </SWRConfig>
  );
}

export default App;

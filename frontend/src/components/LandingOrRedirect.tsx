import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Header } from "./layout/Header";
import { Footer } from "./layout/Footer";
import { LandingPage } from "../pages/LandingPage";

interface LandingOrRedirectProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const LandingOrRedirect: React.FC<LandingOrRedirectProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { isAuthenticated } = useAuth();

  // If user is authenticated, redirect to /exercises
  if (isAuthenticated) {
    return <Navigate to="/exercises" replace />;
  }

  // Otherwise, show the landing page
  return (
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
  );
};

import React from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useIeltsReadingSubmissionDetails } from "../hooks";
import { IeltsResultTeacherView } from "./IeltsResultTeacherView";
import { ActionButton, LoadingSpinner, ErrorDisplay } from "../components/ui";
import { ArrowLeft } from "lucide-react";

export const IeltsReadingSubmissionDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const submissionId = id ? parseInt(id, 10) : null;

  const {
    submission,
    isLoading: loading,
    error,
  } = useIeltsReadingSubmissionDetails(submissionId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        title={t("common.error")}
        message={error}
        onBack={() => navigate("/ielts/submissions")}
        backText={t("common.back")}
      />
    );
  }

  if (!submission) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 mb-4">{t("ielts.submissions.notFound")}</p>
        <ActionButton
          onClick={() => navigate("/ielts/submissions")}
          colorTheme="gray"
          hasIcon={true}
          icon={ArrowLeft}
          text={t("common.back")}
          size="md"
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        {submissionId && (
          <IeltsResultTeacherView
            submissionId={submissionId}
            onBack={() => navigate("/ielts/submissions")}
          />
        )}
      </div>
    </div>
  );
};

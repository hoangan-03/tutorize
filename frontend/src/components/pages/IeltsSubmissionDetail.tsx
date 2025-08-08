import React from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useIeltsReadingSubmissionDetails } from "../../hooks/useIeltsReading";
import { IeltsTestResult } from "./IeltsTestResult";

export const IeltsSubmissionDetail: React.FC = () => {
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl text-red-600 mb-4">{t("common.error")}</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate("/ielts/submissions")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          {t("common.back")}
        </button>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 mb-4">{t("ielts.submissions.notFound")}</p>
        <button
          onClick={() => navigate("/ielts/submissions")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        {submissionId && (
          <IeltsTestResult
            submissionId={submissionId}
            onBack={() => navigate("/ielts/submissions")}
          />
        )}
      </div>
    </div>
  );
};

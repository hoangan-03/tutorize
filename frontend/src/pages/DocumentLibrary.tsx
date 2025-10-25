import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Download, Eye, BookOpen } from "lucide-react";
import { useDocuments } from "../hooks/useDocuments";
import { Badge, LoadingSpinner } from "../components/ui";

export const DocumentLibrary: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedGrade, setSelectedGrade] = useState("All");

  // Build filter params
  const params = {
    ...(searchTerm && { search: searchTerm }),
    ...(selectedSubject &&
      selectedSubject !== "All" && { subject: selectedSubject }),
    ...(selectedGrade &&
      selectedGrade !== "All" && { grade: parseInt(selectedGrade) }),
  };

  // Use hook for data fetching
  const { documents, isLoading: loading } = useDocuments(params);

  const subjects = [
    "All",
    "Mathematics",
    "Science",
    "English",
    "History",
    "Geography",
  ];
  const grades = ["All", 6, 7, 8, 9, 10, 11, 12];

  const filteredDocuments = documents;

  return (
    <div className="max-w-8xl mx-auto">
      <div className="mb-8">
        <h1 className="text-base md:text-xl lg:text-3xl font-bold text-gray-900">
          {t("documents.title")}
        </h1>
        <p className="text-gray-600 mt-2">{t("documents.description")}</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("documents.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              aria-label={t("documents.allSubjects")}
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject === "All"
                    ? t("documents.allSubjects")
                    : t(`subjects.${subject.toLowerCase()}`)}
                </option>
              ))}
            </select>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              aria-label={t("documents.selectGrade")}
            >
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade === "All"
                    ? t("documents.allGrades")
                    : `${t("documents.grade")} ${grade}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {t("documents.showing")} {filteredDocuments.length}{" "}
          {t("documents.title").toLowerCase()}
        </p>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="sm" color="border-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  {/* <div className="flex space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-gray-300" />
                    </div> */}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {doc.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4">{doc.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <Badge variant="grade" className="px-2 py-1 text-sm">
                      {t("documents.grade")} {doc.grade}
                    </Badge>
                    <Badge variant="subject" className="px-2 py-1 text-sm">
                      {t(`subjects.${doc.subject.toLowerCase()}`)}
                    </Badge>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <Eye className="h-4 w-4 mr-2" />
                    {t("common.view")}
                  </button>
                  <button
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    aria-label={t("documents.downloadDocument")}
                    title={t("documents.download")}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredDocuments.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("documents.notFound")}
          </h3>
          <p className="text-gray-600">{t("documents.tryDifferentCriteria")}</p>
        </div>
      )}
    </div>
  );
};

import React, { useRef } from "react";
import {
  Edit,
  Download,
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  Type,
} from "lucide-react";
import { Exercise } from "../types/api";
import { generateExercisePDF, formatDate } from "../components/utils";
import { FontList } from "../components/constant";
import { useTranslation } from "react-i18next";
import { ActionButton, PDFViewer } from "../components/ui";

interface ExercisePreviewProps {
  exercise: Exercise;
  onBack: () => void;
  onEdit?: () => void;
  isReadOnly?: boolean;
}

export const ExercisePreview: React.FC<ExercisePreviewProps> = ({
  exercise,
  onBack,
  onEdit,
  isReadOnly = false,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const [selectedFont, setSelectedFont] = React.useState<string>(
    FontList[0].name
  );

  const { t } = useTranslation();

  const downloadAsPDF = async () => {
    try {
      const fontValue = getCurrentFontFamily();
      console.log(
        "Generating PDF with font:",
        selectedFont,
        "CSS value:",
        fontValue
      );
      await generateExercisePDF(exercise, {
        selectedFont: fontValue, // Use CSS font family value instead of display name
        showHeader: false,
      });
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Unable to generate PDF.");
    }
  };

  // Get the current font family value for preview
  const getCurrentFontFamily = () => {
    const font = FontList.find((font) => font.name === selectedFont);
    return font?.value || '"Cambria Math", Cambria, "Times New Roman", serif';
  };

  return (
    <div className="max-w-8xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center flex-row gap-4">
          <ActionButton
            onClick={onBack}
            colorTheme="white"
            textColor="text-red-700"
            hasIcon={true}
            icon={ArrowLeft}
            text={t("exerciseEditorUI.back")}
            size="sm"
          />
          <h1 className="text-base md:text-xl lg:text-3xl font-bold text-gray-900">
            {t("exerciseEditorUI.viewExercise")}
          </h1>
        </div>

        <div className="flex space-x-3">
          <ActionButton
            onClick={downloadAsPDF}
            colorTheme="green"
            hasIcon={true}
            icon={Download}
            text={t("exerciseEditorUI.downloadPDF")}
            size="sm"
          />
          {!isReadOnly && onEdit && (
            <ActionButton
              onClick={onEdit}
              colorTheme="blue"
              hasIcon={true}
              icon={Edit}
              text={t("exerciseEditorUI.editExercise")}
              size="sm"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-100">
              {t("exerciseEditorUI.exerciseInfo")}
            </h2>

            <div className="space-y-5">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center mb-2">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {t("exerciseEditorUI.exerciseSubject")}
                  </span>
                </div>
                <div className="font-semibold text-blue-800 text-base">
                  {exercise.subject}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center mb-2">
                  <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    {t("exerciseEditorUI.exerciseGrade")}
                  </span>
                </div>
                <div className="font-semibold text-green-800 text-base">
                  {t("exerciseEditorUI.exerciseGrade")} {exercise.grade}
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 mr-2 text-red-600" />
                  <span className="text-sm font-medium text-red-900">
                    {t("exerciseEditorUI.exerciseDeadline")}
                  </span>
                </div>
                <div className="font-semibold text-red-800 text-base">
                  {formatDate(exercise.deadline)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 mr-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {t("exerciseEditorUI.exerciseTeacher")}
                  </span>
                </div>
                <div className="font-semibold text-gray-800 text-base">
                  {exercise.createdBy}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                  <div className="text-xs font-medium text-purple-900 mb-1">
                    {t("exerciseEditorUI.exerciseCreatedAt")}
                  </div>
                  <div className="font-semibold text-purple-800 text-sm">
                    {formatDate(exercise.createdAt)}
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                  <div className="text-xs font-medium text-indigo-900 mb-1">
                    {t("exerciseEditorUI.exerciseSubmissions")}
                  </div>
                  <div className="font-semibold text-indigo-800 text-sm">
                    {exercise.submissions}
                  </div>
                </div>
              </div>
            </div>

            {exercise.note && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-sm font-medium text-amber-900 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  Ghi chú
                </div>
                <div className="text-sm text-amber-800 leading-relaxed">
                  {exercise.note}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {exercise.name}
                </h2>
                <div className="flex items-center space-x-2">
                  <Type className="h-4 w-4 text-gray-500" />
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    aria-label="Chọn font chữ"
                    className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {FontList.map((font) => (
                      <option key={font.name} value={font.name}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div ref={contentRef} className="p-6">
              <div className="max-w-none">
                <div className="reading-mode-content bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                  <div className="bg-white rounded-lg p-8 shadow-sm">
                    {exercise.fileUrl ? (
                      // Display PDF file if fileUrl exists
                      <div className="w-full">
                        <PDFViewer
                          fileUrl={exercise.fileUrl}
                          fileName={exercise.fileName || "Exercise File"}
                          exerciseId={exercise.id}
                        />
                      </div>
                    ) : exercise.content ? (
                      // Display text content if content exists
                      <div
                        className="prose prose-lg max-w-none text-start prose-headings:text-gray-800 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900"
                        style={{ fontFamily: getCurrentFontFamily() }}
                      >
                        <div
                          className="content-text text-lg leading-loose"
                          style={{
                            fontFamily: getCurrentFontFamily(),
                            lineHeight: "1.8",
                            fontSize: "18px",
                            color: "#374151",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: exercise.content
                              .replace(
                                /<h1/g,
                                `<h1 style="font-family: ${getCurrentFontFamily()};" class="text-base md:text-xl lg:text-3xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4"`
                              )
                              .replace(
                                /<h2/g,
                                `<h2 style="font-family: ${getCurrentFontFamily()};" class="text-2xl font-semibold mb-4 mt-8 text-gray-800"`
                              )
                              .replace(
                                /<h3/g,
                                `<h3 style="font-family: ${getCurrentFontFamily()};" class="text-xl font-medium mb-3 mt-6 text-gray-800"`
                              )
                              .replace(
                                /<p/g,
                                `<p style="font-family: ${getCurrentFontFamily()};" class="mb-4 text-gray-700 leading-relaxed"`
                              )
                              .replace(
                                /<ul/g,
                                `<ul style="font-family: ${getCurrentFontFamily()};" class="mb-4 pl-6 space-y-2"`
                              )
                              .replace(
                                /<ol/g,
                                `<ol style="font-family: ${getCurrentFontFamily()};" class="mb-4 pl-6 space-y-2"`
                              )
                              .replace(
                                /<li/g,
                                `<li style="font-family: ${getCurrentFontFamily()};" class="text-gray-700"`
                              )
                              .replace(
                                /<strong/g,
                                `<strong style="font-family: ${getCurrentFontFamily()};" class="font-semibold text-gray-900"`
                              )
                              .replace(
                                /<em/g,
                                `<em style="font-family: ${getCurrentFontFamily()};" class="italic text-gray-800"`
                              )
                              .replace(
                                /<blockquote/g,
                                `<blockquote style="font-family: ${getCurrentFontFamily()};" class="border-l-4 border-blue-300 pl-4 py-2 mb-4 bg-blue-50 italic text-gray-700"`
                              )
                              .replace(
                                /<code/g,
                                '<code class="bg-gray-100 px-2 py-1 text-sm font-mono text-gray-800"'
                              )
                              .replace(
                                /<pre/g,
                                '<pre class="bg-gray-100 p-8 rounded-lg mb-4 overflow-x-auto"'
                              ),
                          }}
                        />
                      </div>
                    ) : (
                      // Display empty state if neither content nor file exists
                      <div className="text-center py-12 text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Bài tập chưa có nội dung</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

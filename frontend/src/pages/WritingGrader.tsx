/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  PenTool,
  Send,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Book,
  Target,
} from "lucide-react";
import { ActionButton } from "../components/ui/ActionButton";

export const WritingGrader: React.FC = () => {
  const [essay, setEssay] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const analyzeEssay = async () => {
    if (!essay.trim()) return;

    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      const wordCount = essay.trim().split(/\s+/).length;
      const result = {
        overallBand: 7.0,
        criteria: {
          taskResponse: 7.0,
          coherenceCohesion: 6.5,
          lexicalResource: 7.5,
          grammaticalRange: 6.5,
        },
        wordCount,
        strengths: [
          "Bài viết đáp ứng tốt yêu cầu đề bài",
          "Sử dụng từ vựng đa dạng và phù hợp",
          "Có ví dụ cụ thể và thuyết phục",
        ],
        improvements: [
          "Cần cải thiện liên kết giữa các đoạn văn",
          "Một số lỗi ngữ pháp nhỏ",
          "Kết luận có thể mạnh mẽ hơn",
        ],
        feedback:
          "Bài viết của bạn có nội dung tốt và từ vựng phong phú. Hãy chú ý hơn đến cách liên kết các ý tưởng và kiểm tra lại ngữ pháp để đạt điểm cao hơn.",
      };

      setAnalysisResult(result);
      setIsAnalyzing(false);
    }, 3000);
  };

  const resetAnalysis = () => {
    setEssay("");
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-8xl mx-auto">
      <div className="mb-8">
        <h1 className="text-base md:text-xl lg:text-3xl font-bold text-gray-900">
          AI Writing Grader
        </h1>
        <p className="text-gray-600 mt-2">
          Nhận phản hồi chi tiết và điểm số IELTS cho bài viết của bạn từ AI
          thông minh
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Writing Input */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <PenTool className="h-6 w-6 mr-2 text-blue-600" />
              Viết bài của bạn
            </h2>
            <div className="text-sm text-gray-500">
              {
                essay
                  .trim()
                  .split(/\s+/)
                  .filter((word) => word.length > 0).length
              }{" "}
              từ
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đề bài mẫu:
            </label>
            <div className="p-8 bg-blue-50 rounded-lg text-sm text-gray-700">
              <strong>IELTS Writing Task 2:</strong> Some people think that
              universities should provide graduates with the knowledge and
              skills needed in the workplace. Others think that the true
              function of a university should be to give access to knowledge for
              its own sake, regardless of whether the course is useful to an
              employer. What, in your opinion, should be the main function of a
              university?
            </div>
          </div>

          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Nhập bài viết của bạn ở đây..."
            rows={15}
            className="w-full p-8 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
          />

          <div className="flex justify-between mt-4">
            <ActionButton
              onClick={resetAnalysis}
              colorTheme="transparent"
              textColor="text-gray-700"
              hasIcon={true}
              icon={RefreshCw}
              text="Làm mới"
              size="md"
              className="border border-gray-300 hover:bg-gray-50"
            />

            <ActionButton
              onClick={analyzeEssay}
              disabled={!essay.trim() || isAnalyzing}
              colorTheme={!essay.trim() || isAnalyzing ? "gray" : "blue"}
              hasIcon={true}
              icon={isAnalyzing ? RefreshCw : Send}
              text={
                isAnalyzing ? (
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Đang phân tích...
                  </div>
                ) : (
                  "Phân tích bài viết"
                )
              }
              size="md"
              className={isAnalyzing ? "animate-pulse" : ""}
            />
          </div>
        </div>

        {/* Analysis Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
            Kết quả phân tích
          </h2>

          {!analysisResult && !isAnalyzing && (
            <div className="text-center py-12">
              <PenTool className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có kết quả phân tích
              </h3>
              <p className="text-gray-600">
                Viết bài và nhấn "Phân tích bài viết" để nhận phản hồi từ AI
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-12">
              <RefreshCw className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Đang phân tích bài viết
              </h3>
              <p className="text-gray-600">
                AI đang đánh giá bài viết của bạn, vui lòng đợi...
              </p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-6">
              {/* Overall Band Score */}
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-base md:text-xl lg:text-3xl font-bold text-blue-600 mb-2">
                  {analysisResult.overallBand}
                </div>
                <div className="text-gray-600">Điểm tổng IELTS Writing</div>
              </div>

              {/* Criteria Breakdown */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">
                  Chi tiết theo tiêu chí:
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-8 border border-gray-200 rounded-lg">
                    <div className="font-medium text-gray-900">
                      Task Response
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResult.criteria.taskResponse}
                    </div>
                  </div>

                  <div className="p-8 border border-gray-200 rounded-lg">
                    <div className="font-medium text-gray-900">
                      Coherence & Cohesion
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResult.criteria.coherenceCohesion}
                    </div>
                  </div>

                  <div className="p-8 border border-gray-200 rounded-lg">
                    <div className="font-medium text-gray-900">
                      Lexical Resource
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResult.criteria.lexicalResource}
                    </div>
                  </div>

                  <div className="p-8 border border-gray-200 rounded-lg">
                    <div className="font-medium text-gray-900">Grammar</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResult.criteria.grammaticalRange}
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Điểm mạnh
                </h3>
                <ul className="space-y-2">
                  {analysisResult.strengths.map(
                    (strength: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Improvements */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="h-5 w-5 text-orange-600 mr-2" />
                  Cần cải thiện
                </h3>
                <ul className="space-y-2">
                  {analysisResult.improvements.map(
                    (improvement: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{improvement}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Overall Feedback */}
              <div className="p-8 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Book className="h-5 w-5 text-blue-600 mr-2" />
                  Nhận xét tổng quan
                </h3>
                <p className="text-gray-700">{analysisResult.feedback}</p>
              </div>

              {/* Word Count */}
              <div className="text-center text-sm text-gray-600">
                Số từ: {analysisResult.wordCount} • Khuyến nghị: 250-300 từ
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

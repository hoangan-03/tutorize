import React, { useState } from "react";
import { Search, Download, Eye, BookOpen, Star } from "lucide-react";
import { documentsData } from "../../data/sampleData";

export const DocumentLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedGrade, setSelectedGrade] = useState("All");

  const subjects = [
    "All",
    "Mathematics",
    "Science",
    "English",
    "History",
    "Geography",
  ];
  const grades = ["All", 6, 7, 8, 9, 10, 11, 12];

  const filteredDocuments = documentsData.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      selectedSubject === "All" || doc.subject === selectedSubject;
    const matchesGrade = selectedGrade === "All" || doc.grade === selectedGrade;
    return matchesSearch && matchesSubject && matchesGrade;
  });

  return (
    <div className="p-4">
      <div className="max-w-8xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Thư viện tài liệu
          </h1>
          <p className="text-gray-600 mt-2">
            Khám phá hàng nghìn tài liệu học tập được phân loại theo môn học và
            lớp
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tài liệu..."
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
                aria-label="Chọn môn học"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject === "All" ? "Tất cả môn học" : subject}
                  </option>
                ))}
              </select>

              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                aria-label="Chọn lớp"
              >
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade === "All" ? "Tất cả lớp" : `Lớp ${grade}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Hiển thị {filteredDocuments.length} tài liệu
          </p>
        </div>

        {/* Documents Grid */}
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
                  <div className="flex space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-gray-300" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {doc.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4">{doc.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Lớp {doc.grade}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {doc.subject}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <Eye className="h-4 w-4 mr-2" />
                    Xem
                  </button>
                  <button
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    aria-label="Tải xuống tài liệu"
                    title="Tải xuống"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy tài liệu
            </h3>
            <p className="text-gray-600">
              Thử thay đổi tiêu chí tìm kiếm hoặc bộ lọc của bạn
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

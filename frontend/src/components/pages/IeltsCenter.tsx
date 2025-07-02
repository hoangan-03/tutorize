import React, { useState } from "react";
import {
  BookOpen,
  PenTool,
  Headphones,
  Mic,
  Clock,
  Star,
  PlayCircle,
  Download,
} from "lucide-react";
import { ieltsResources } from "../../data/sampleData";

export const IeltsCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "Reading" | "Writing" | "Listening" | "Speaking"
  >("Reading");

  const tabConfig = {
    Reading: {
      icon: BookOpen,
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    Writing: {
      icon: PenTool,
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    Listening: {
      icon: Headphones,
      color: "purple",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    Speaking: {
      icon: Mic,
      color: "orange",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  };

  return (
    <div className="p-4">
      <div className="max-w-8xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">IELTS Center</h1>
          <p className="text-gray-600 mt-2">
            Luyện thi IELTS với tài liệu chất lượng cao và mô phỏng đề thi thật
          </p>
        </div>

        {/* Skill Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {(Object.keys(tabConfig) as Array<keyof typeof tabConfig>).map(
                (skill) => {
                  const config = tabConfig[skill];
                  const IconComponent = config.icon;
                  const isActive = activeTab === skill;

                  return (
                    <button
                      key={skill}
                      onClick={() => setActiveTab(skill)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                        isActive
                          ? `border-${config.color}-500 ${config.textColor}`
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <IconComponent className="h-5 w-5 mr-2" />
                        {skill}
                      </div>
                    </button>
                  );
                }
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ieltsResources[activeTab].map((resource) => {
                const config = tabConfig[activeTab];
                const IconComponent = config.icon;

                return (
                  <div
                    key={resource.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 ${config.bgColor} rounded-lg`}>
                        <IconComponent
                          className={`h-6 w-6 ${config.textColor}`}
                        />
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
                      {resource.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4">
                      {resource.description}
                    </p>

                    <div className="flex items-center mb-4 text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>45-60 phút</span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        onClick={() => {
                          if (resource.skill === "Writing") {
                            setCurrentPage("writing");
                          }
                        }}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Bắt đầu
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
                );
              })}
            </div>
          </div>
        </div>

        {/* Statistics and Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reading</p>
                <p className="text-2xl font-semibold text-gray-900">7.0</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <PenTool className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Writing</p>
                <p className="text-2xl font-semibold text-gray-900">6.5</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Headphones className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Listening</p>
                <p className="text-2xl font-semibold text-gray-900">7.5</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Mic className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Speaking</p>
                <p className="text-2xl font-semibold text-gray-900">6.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Study Plan */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Kế hoạch học tập IELTS
          </h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  Reading Practice - Academic
                </h3>
                <p className="text-sm text-gray-600">Hôm nay • 9:00 - 10:30</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Bắt đầu
              </button>
            </div>

            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <PenTool className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  Writing Task 2 Practice
                </h3>
                <p className="text-sm text-gray-600">
                  Ngày mai • 14:00 - 15:30
                </p>
              </div>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Xem chi tiết
              </button>
            </div>

            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <Headphones className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  Listening Mock Test
                </h3>
                <p className="text-sm text-gray-600">Thứ 6 • 10:00 - 11:00</p>
              </div>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

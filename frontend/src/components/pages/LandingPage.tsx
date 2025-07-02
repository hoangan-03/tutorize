import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  FileText,
  Award,
  PenTool,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Target,
  Play,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-8xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <main className="pt-10 mx-auto max-w-8xl px-4 sm:pt-12 sm:px-6 md:pt-16 lg:pt-20 lg:px-8 xl:pt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Học tập thông minh</span>{" "}
                  <span className="block text-blue-600 xl:inline">
                    với AI hiện đại
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Nền tảng giáo dục toàn diện từ lớp 6-12 đến IELTS. Với thư
                  viện tài liệu phong phú, bài kiểm tra tương tác và AI chấm bài
                  viết thông minh.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <button
                      onClick={() => navigate("/signup")}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                    >
                      Bắt đầu miễn phí
                    </button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                    >
                      Đăng nhập
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-r from-blue-500 to-purple-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-white text-center">
              <BookOpen className="h-32 w-32 mx-auto mb-4" />
              <h3 className="text-2xl font-bold">Học mọi lúc, mọi nơi</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Tính năng
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Tất cả những gì bạn cần để thành công
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Từ tài liệu học tập đến AI chấm bài, chúng tôi cung cấp công cụ
              toàn diện cho hành trình học tập của bạn.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Thư viện tài liệu
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Hàng nghìn tài liệu học tập được phân loại theo môn học và lớp
                  từ 6-12, cập nhật liên tục theo chương trình giáo dục mới
                  nhất.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Bài kiểm tra tương tác
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Bài kiểm tra trắc nghiệm thông minh với nhiều mức độ khó, kết
                  quả chi tiết và gợi ý cải thiện cá nhân hóa.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Award className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Luyện thi IELTS
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Trung tâm IELTS chuyên nghiệp với tài liệu 4 kỹ năng: Reading,
                  Writing, Listening, Speaking. Mô phỏng đề thi thật.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <PenTool className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  AI chấm bài viết
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Công nghệ AI tiên tiến phân tích và chấm điểm bài viết IELTS,
                  đưa ra nhận xét chi tiết và hướng dẫn cải thiện cụ thể.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600">
        <div className="max-w-8xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Được tin tưởng bởi hàng nghìn học sinh
            </h2>
            <p className="mt-3 text-xl text-blue-200 sm:mt-4">
              Kết quả ấn tượng từ cộng đồng học tập của chúng tôi
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                Học sinh
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                10,000+
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                Tài liệu
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                5,000+
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                Điểm IELTS trung bình
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                7.5
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-16 lg:py-24">
        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <blockquote className="mt-10">
              <div className="max-w-3xl mx-auto text-center text-2xl leading-9 font-medium text-gray-900">
                <p>
                  "Tutorize đã thay đổi cách tôi học tập. AI chấm bài viết rất
                  chính xác và thư viện tài liệu phong phú giúp tôi chuẩn bị tốt
                  cho kỳ thi IELTS."
                </p>
              </div>
              <footer className="mt-8">
                <div className="md:flex md:items-center md:justify-center">
                  <div className="md:flex-shrink-0">
                    <div className="mx-auto h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-semibold">LH</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center md:mt-0 md:ml-4 md:flex md:items-center">
                    <div className="text-base font-medium text-gray-900">
                      Lê Hoàng
                    </div>
                    <svg
                      className="hidden md:block mx-1 h-5 w-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M11 0h3L9 20H6l5-20z" />
                    </svg>
                    <div className="text-base font-medium text-gray-500">
                      Học sinh lớp 12, IELTS 8.0
                    </div>
                  </div>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50">
        <div className="max-w-8xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Sẵn sàng bắt đầu?</span>
            <span className="block text-blue-600">
              Đăng ký miễn phí ngay hôm nay.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={() => navigate("/signup")}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Bắt đầu ngay
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
              >
                Tìm hiểu thêm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

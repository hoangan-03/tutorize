import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, FileText, Award, ChevronRight } from "lucide-react";
import { ActionButton } from "../components/ui";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="pt-10 mx-auto max-w-7xl px-4 sm:pt-12 sm:px-6 md:pt-16 lg:pt-20 lg:px-8 xl:pt-28">
              <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                  <div>
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg mb-4">
                      <Award className="h-4 w-4 mr-2" />
                      {t("landing.featuresTitle")}
                    </span>
                  </div>
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                    <span className="block mb-2">{t("landing.heroTitle")}</span>
                    <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {t("landing.learnAnywhere")}
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-xl sm:max-w-xl sm:mx-auto md:mt-5 lg:mx-0">
                    {t("landing.heroSubtitle")}
                  </p>
                  <div className="mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                    <ActionButton
                      onClick={() => navigate("/signup")}
                      colorTheme="blue"
                      hasIcon={true}
                      icon={ChevronRight}
                      text={t("landing.getStarted")}
                      size="lg"
                      className="w-full sm:w-auto shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200"
                    />
                    <ActionButton
                      onClick={() => navigate("/login")}
                      colorTheme="transparent"
                      textColor="text-blue-700"
                      hasIcon={false}
                      text={t("navigation.login")}
                      size="lg"
                      className="w-full sm:w-auto mt-3 sm:mt-0 bg-white hover:bg-gray-50 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200"
                    />
                  </div>

                  {/* Trust indicators */}
                  <div className="mt-8 sm:mt-12">
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-gray-500">
                      <div className="flex items-center">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 border-2 border-white"></div>
                        </div>
                        <span className="ml-3 text-sm font-medium">
                          10,000+ {t("landing.students")}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="text-sm font-medium">
                          7.5 {t("landing.avgIeltsScore")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 relative lg:mt-0 lg:col-span-6">
                  <div className="relative mx-auto w-full lg:max-w-md">
                    {/* Floating card effect */}
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
                      <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-2xl"></div>
                      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full opacity-20 blur-2xl"></div>

                      <div className="relative">
                        <div className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6">
                          <BookOpen className="h-10 w-10 text-white" />
                        </div>

                        <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
                          {t("landing.learnAnywhere")}
                        </h3>

                        <div className="space-y-3">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100 text-blue-600">
                                <FileText className="h-5 w-5" />
                              </div>
                            </div>
                            <p className="ml-3 text-sm text-gray-600">
                              {t("landing.interactiveQuizzesTitle")}
                            </p>
                          </div>

                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-purple-100 text-purple-600">
                                <Award className="h-5 w-5" />
                              </div>
                            </div>
                            <p className="ml-3 text-sm text-gray-600">
                              {t("landing.ieltsPrepTitle")}
                            </p>
                          </div>

                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600">
                                <BookOpen className="h-5 w-5" />
                              </div>
                            </div>
                            <p className="ml-3 text-sm text-gray-600">
                              {t("landing.docLibraryTitle")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Decorative floating elements */}
                    <div className="hidden lg:block absolute top-0 -right-16 w-32 h-32 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full opacity-40 blur-xl animate-pulse"></div>
                    <div className="hidden lg:block absolute bottom-0 -left-16 w-24 h-24 bg-gradient-to-br from-pink-200 to-pink-400 rounded-full opacity-40 blur-xl animate-pulse animation-delay-2000"></div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-16">
          <div className="lg:text-center flex flex-col items-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              {t("landing.featuresTitle")}
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {t("landing.allYouNeed")}
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-36">
              {t("landing.featuresDescription")}
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900 text-start">
                  {t("landing.docLibraryTitle")}
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500 text-start">
                  {t("landing.docLibraryDescription")}
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900 text-start">
                  {t("landing.interactiveQuizzesTitle")}
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500 text-start">
                  {t("landing.interactiveQuizzesDescription")}
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Award className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900 text-start">
                  {t("landing.ieltsPrepTitle")}
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500 text-start">
                  {t("landing.ieltsPrepDescription")}
                </p>
              </div>

              {/* <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <PenTool className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900 text-start">
                  {t("landing.aiGraderTitle")}
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500 text-start">
                  {t("landing.aiGraderDescription")}
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600">
        <div className="max-w-8xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              {t("landing.statsTitle")}
            </h2>
            <p className="mt-3 text-xl text-blue-200 sm:mt-4">
              {t("landing.statsSubtitle")}
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-2 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                {t("landing.students")}
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                10,000+
              </dd>
            </div>
            {/* <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                {t("landing.documents")}
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                5,000+
              </dd>
            </div> */}
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                {t("landing.avgIeltsScore")}
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
        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-16">
          <div className="relative">
            <blockquote className="mt-10">
              <div className="max-w-3xl mx-auto text-center text-2xl leading-9 font-medium text-gray-900">
                <p>{t("landing.testimonial")}</p>
              </div>
              <footer className="mt-8">
                <div className="md:flex md:items-center md:justify-center">
                  <div className="md:flex-shrink-0">
                    <div className="mx-auto h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-semibold">AN</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center md:mt-0 md:ml-4 md:flex md:items-center">
                    <div className="text-base font-medium text-gray-900">
                      {t("landing.testimonialAuthor")}
                    </div>
                    <svg
                      className="hidden md:block mx-1 h-5 w-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M11 0h3L9 20H6l5-20z" />
                    </svg>
                    <div className="text-base font-medium text-gray-500">
                      {t("landing.testimonialAuthorInfo")}
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
        <div className="max-w-8xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-16 flex items-center lg:justify-between flex-col lg:flex-row">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">{t("landing.ctaTitle")}</span>
            <span className="block text-blue-600">
              {t("landing.ctaSubtitle")}
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <ActionButton
                onClick={() => navigate("/signup")}
                colorTheme="blue"
                hasIcon={true}
                icon={ChevronRight}
                text={t("landing.startNow")}
                size="md"
              />
            </div>
            {/* <div className="ml-3 inline-flex rounded-md shadow">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
              >
                {t("landing.learnMore")}
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

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

            <main className="pt-10 mx-auto max-w-8xl px-4 sm:pt-12 sm:px-6 md:pt-16 lg:pt-20 lg:px-16 xl:pt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">
                    {t("landing.heroTitle")}
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  {t("landing.heroSubtitle")}
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <ActionButton
                      onClick={() => navigate("/signup")}
                      colorTheme="blue"
                      hasIcon={false}
                      text={t("landing.getStarted")}
                      size="lg"
                      className="w-full"
                    />
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <ActionButton
                      onClick={() => navigate("/login")}
                      colorTheme="transparent"
                      textColor="text-blue-700"
                      hasIcon={false}
                      text={t("navigation.login")}
                      size="lg"
                      className="w-full bg-blue-100 hover:bg-blue-200"
                    />
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
              <h3 className="text-2xl font-bold">
                {t("landing.learnAnywhere")}
              </h3>
            </div>
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

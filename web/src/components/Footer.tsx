import { Component } from "solid-js";

const Footer: Component = () => {
  return (
    <footer class="relative py-20 px-6 overflow-hidden">
      {/* Background with glass effect */}
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-gray-800/50 backdrop-blur-xl"></div>
      <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

      {/* Decorative elements */}
      <div class="absolute top-10 left-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl"></div>

      <div class="container mx-auto max-w-7xl relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand section */}
          <div class="lg:col-span-2">
            <div class="flex items-center space-x-3 mb-6">
              <div class="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <svg
                  class="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <h3 class="text-2xl font-bold gradient-text">
                  iConsole+ Client
                </h3>
                <p class="text-sm text-gray-400">AI Fitness Platform</p>
              </div>
            </div>
            <p class="text-gray-300 leading-relaxed mb-6 max-w-md">
              Revolutionary AI-powered desktop application for smart bike
              training. Transform your fitness journey with personalized
              coaching and advanced analytics.
            </p>
          </div>
        </div>
        {/* Bottom section */}
        <div class="border-t border-white/10 pt-8 flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
          <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
            <p class="text-gray-400">
              © 2024 iConsole+ Client. All rights reserved.
            </p>
            <div class="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 text-gray-400 text-xs">
              <div class="flex items-center space-x-2">
                <svg
                  class="w-4 h-4 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Free & Open Source</span>
              </div>
              <div class="flex items-center space-x-2">
                <svg
                  class="w-4 h-4 text-orange-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Unofficial Third-Party Software</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap justify-center gap-6 text-sm">
            <a
              href="https://github.com/BostonLeeK/iconsole-plus-client"
              target=""
              class="text-gray-400 hover:text-white transition-colors duration-300"
            >
              Github
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

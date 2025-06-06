import { Component } from "solid-js";

const Compatibility: Component = () => {
  return (
    <section id="compatibility" class="py-24 px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div class="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl"></div>

      <div class="container mx-auto max-w-6xl relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">
            Device <span class="gradient-text">Compatibility</span>
          </h2>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            Important information about supported devices and project status
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Compatibility Info */}
          <div class="glass-card">
            <div class="flex items-center space-x-4 mb-6">
              <div class="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <svg
                  class="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-white">Supported Devices</h3>
                <p class="text-gray-400">Hardware compatibility information</p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex items-center space-x-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <svg
                  class="w-5 h-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-white font-medium">
                  iConsole+ Smart Trainers
                </span>
              </div>

              <div class="flex items-center space-x-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <svg
                  class="w-5 h-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-gray-300">
                  Other fitness equipment brands
                </span>
              </div>

              <div class="flex items-center space-x-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <svg
                  class="w-5 h-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-gray-300">Standard FTMS/ANT+ devices</span>
              </div>
            </div>

            <div class="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h4 class="text-white font-semibold mb-2">
                Technical Requirements
              </h4>
              <ul class="text-sm text-gray-300 space-y-1">
                <li>• iConsole+ device with latest firmware</li>
                <li>• Windows 10/11, macOS 10.15+, or Linux Ubuntu 20.04+</li>
                <li>• Bluetooth 4.0+ or USB connection</li>
                <li>• Minimum 4GB RAM, 100MB storage</li>
              </ul>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div class="glass-card border-orange-500/30 bg-orange-500/5">
            <div class="flex items-center space-x-4 mb-6">
              <div class="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <svg
                  class="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-orange-300">Legal Notice</h3>
                <p class="text-gray-400">
                  Important disclaimers and project status
                </p>
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <h4 class="text-white font-semibold mb-3">
                  ⚠️ Unofficial Project
                </h4>
                <p class="text-gray-300 text-sm leading-relaxed">
                  iConsole Client is an{" "}
                  <strong>independent, third-party application</strong>{" "}
                  developed for personal use. It is{" "}
                  <strong>
                    not affiliated with, endorsed by, or supported by
                  </strong>
                  the official manufacturer of iConsole+ devices.
                </p>
              </div>

              <div>
                <h4 class="text-white font-semibold mb-3">
                  🔧 Personal Project
                </h4>
                <p class="text-gray-300 text-sm leading-relaxed">
                  This software was created as a{" "}
                  <strong>personal hobby project</strong> to enhance the
                  training experience with iConsole+ devices. It's shared as-is
                  with the community for educational and personal use purposes.
                </p>
              </div>

              <div>
                <h4 class="text-white font-semibold mb-3">
                  ⚡ Use at Your Own Risk
                </h4>
                <p class="text-gray-300 text-sm leading-relaxed">
                  By using this software, you acknowledge that it's provided{" "}
                  <strong>without warranty</strong>
                  and that you use it at your own risk. The developer is not
                  responsible for any damage to your equipment or data.
                </p>
              </div>

              <div class="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p class="text-yellow-200 text-xs leading-relaxed">
                  <strong>For support or questions</strong>, please refer to the
                  project's documentation or community forums. Official
                  manufacturer support channels cannot assist with this
                  software.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Compatibility;

import { Component, onMount } from "solid-js";

const Download: Component = () => {
  let sectionRef: HTMLElement | undefined;

  onMount(() => {
    if (!sectionRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = sectionRef.querySelectorAll(".scroll-reveal");
    cards.forEach((card) => observer.observe(card));
  });

  const downloadOptions = [
    {
      platform: "Windows",
      icon: "🖥️",
      version: "v1.0.0",
      size: "~45 MB",
      requirements: "Windows 10/11 64-bit",
      downloadUrl: "#",
      recommended: true,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      platform: "macOS",
      icon: "🍎",
      version: "v1.0.0",
      size: "~50 MB",
      requirements: "macOS 10.15+",
      downloadUrl: "#",
      recommended: false,
      gradient: "from-gray-500 to-gray-700",
    },
    {
      platform: "Linux",
      icon: "🐧",
      version: "v1.0.0",
      size: "~48 MB",
      requirements: "Ubuntu 20.04+",
      downloadUrl: "#",
      recommended: false,
      gradient: "from-orange-500 to-red-600",
    },
  ];

  return (
    <section
      ref={sectionRef!}
      id="download"
      class="py-24 px-6 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>

      <div class="container mx-auto max-w-7xl relative z-10">
        <div class="text-center mb-20 scroll-reveal">
          <h2 class="text-5xl md:text-6xl font-bold mb-8">
            Download <span class="gradient-text">Free</span>
          </h2>
          <p class="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            Start your fitness transformation today. iConsole Client is
            available for all major platforms with full functionality included.
          </p>

          <div class="glass-card max-w-2xl mx-auto mb-16">
            <div class="flex items-center justify-center mb-6">
              <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4">
                <svg
                  class="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="text-left">
                <h3 class="text-2xl font-bold text-white mb-2">
                  100% Free Forever
                </h3>
                <p class="text-gray-400">
                  No hidden fees, subscriptions, or limitations
                </p>
              </div>
            </div>
            <p class="text-gray-300">
              Full functionality available immediately after installation. No
              account creation required to get started.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {downloadOptions.map((option, index) => (
            <div
              class={`scroll-reveal relative group ${
                option.recommended ? "scale-105" : ""
              }`}
              style={`animation-delay: ${index * 0.1}s`}
            >
              {option.recommended && (
                <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <span class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                    Recommended
                  </span>
                </div>
              )}

              <div
                class={`feature-card relative h-full ${
                  option.recommended ? "border-purple-500/50" : ""
                }`}
              >
                <div
                  class={`absolute inset-0 bg-gradient-to-r ${option.gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>

                <div class="relative z-10 text-center">
                  <div class="relative mb-6">
                    <div
                      class={`absolute inset-0 bg-gradient-to-r ${option.gradient} rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500`}
                    ></div>
                    <div class="relative text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {option.icon}
                    </div>
                  </div>

                  <h3 class="text-2xl font-bold text-white mb-4">
                    {option.platform}
                  </h3>
                  <p class="text-gray-400 text-sm mb-6">
                    {option.requirements}
                  </p>

                  <div class="space-y-3 mb-8 text-sm text-gray-400">
                    <div class="flex justify-between">
                      <span>Version:</span>
                      <span class="text-white font-medium">
                        {option.version}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span>Size:</span>
                      <span class="text-white font-medium">{option.size}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>License:</span>
                      <span class="text-green-400 font-medium">Free</span>
                    </div>
                  </div>

                  <button
                    class={`w-full text-lg font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform group-hover:scale-105 ${
                      option.recommended
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-purple-500/25"
                        : "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white"
                    }`}
                    onClick={() => window.open(option.downloadUrl, "_blank")}
                  >
                    ⬇️ Download Soon
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Download;

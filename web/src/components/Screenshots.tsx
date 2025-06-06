import { Component, createSignal, onMount } from "solid-js";

const Screenshots: Component = () => {
  let sectionRef: HTMLElement | undefined;
  const [activeIndex, setActiveIndex] = createSignal(0);

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

    const items = sectionRef.querySelectorAll(".scroll-reveal");
    items.forEach((item) => observer.observe(item));

    // Auto-cycle through screenshots
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % screenshots.length);
    }, 4000);

    return () => clearInterval(interval);
  });

  const screenshots = [
    {
      title: "Main Dashboard",
      description:
        "Real-time workout metrics with Bluetooth device connection and session recording",
      image: "/screenshots/screenshot1.png",
      features: ["Live Metrics", "Bluetooth Connection", "Session Recording"],
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      title: "AI Training Assistant",
      description:
        "Intelligent AI coach providing personalized guidance and resistance adjustments",
      image: "/screenshots/screenshot2.png",
      features: ["AI Coaching", "Smart Resistance", "Real-time Advice"],
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      title: "Performance Analytics",
      description:
        "Detailed workout analysis with comprehensive performance tracking",
      image: "/screenshots/screenshot3.png",
      features: ["Performance Charts", "Session History", "Data Export"],
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Training AI Analysis",
      description:
        "AI analysis of your training session",
      image: "/screenshots/screenshot4.png",
      features: ["Training Goals", "AI Settings", "Device Controls"],
      gradient: "from-orange-500 to-red-600",
    },
  ];

  return (
    <section
      ref={sectionRef!}
      id="screenshots"
      class="py-24 px-6 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div class="absolute top-1/2 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
      <div class="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>

      <div class="container mx-auto max-w-7xl relative z-10">
        <div class="text-center mb-20 scroll-reveal">
          <h2 class="text-5xl md:text-6xl font-bold mb-8">
            See <span class="gradient-text">iConsole</span> in Action
          </h2>
          <p class="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Experience the intuitive interface and powerful features that make
            every workout smarter and more engaging
          </p>
        </div>

        {/* Main gallery */}
        <div class="mb-16 scroll-reveal">
          <div class="relative group">
            {/* Main screenshot display */}
            <div class="glass-card p-8 mb-8">
              <div class="relative">
                <div class="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden relative group-hover:scale-105 transition-transform duration-700">
                  {/* Actual screenshot */}
                  <img
                    src={screenshots[activeIndex()].image}
                    alt={screenshots[activeIndex()].title}
                    class="w-full h-full object-contain"
                  />

                  {/* Overlay gradient for better text readability */}
                  <div
                    class={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent`}
                  ></div>

                  {/* Text overlay */}
                  <div class="absolute bottom-0 left-0 right-0 p-6 text-left">
                    <h3 class="text-2xl font-bold text-white mb-2">
                      {screenshots[activeIndex()].title}
                    </h3>
                    <p class="text-gray-200 mb-4 max-w-2xl">
                      {screenshots[activeIndex()].description}
                    </p>
                    <div class="flex flex-wrap gap-2">
                      {screenshots[activeIndex()].features.map((feature) => (
                        <span class="glass-card px-3 py-1 text-xs text-white">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshot navigation dots */}
            <div class="flex justify-center space-x-4 mb-8">
              {screenshots.map((_, index) => (
                <button
                  class={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeIndex()
                      ? "bg-purple-500 scale-125"
                      : "bg-gray-600 hover:bg-gray-500"
                  }`}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>

            {/* Thumbnail gallery */}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              {screenshots.map((screenshot, index) => (
                <button
                  class={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    index === activeIndex()
                      ? "border-purple-500 scale-105"
                      : "border-gray-600 hover:border-gray-400"
                  }`}
                  onClick={() => setActiveIndex(index)}
                >
                  <img
                    src={screenshot.image}
                    alt={screenshot.title}
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div class="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-300"></div>
                  <div class="absolute bottom-2 left-2 right-2">
                    <h4 class="text-white text-sm font-medium truncate">
                      {screenshot.title}
                    </h4>
                  </div>
                  {index === activeIndex() && (
                    <div class="absolute top-2 right-2">
                      <div class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg
                          class="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Screenshots;

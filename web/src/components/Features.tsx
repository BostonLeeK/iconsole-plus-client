import { Component, onMount } from "solid-js";

const Features: Component = () => {
  let featuresRef: HTMLElement | undefined;

  onMount(() => {
    if (!featuresRef) return;

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

    const cards = featuresRef.querySelectorAll(".scroll-reveal");
    cards.forEach((card) => observer.observe(card));
  });

  const features = [
    {
      icon: "🧠",
      title: "Intelligent AI Coach",
      description:
        "Your personal AI trainer that adapts to your fitness level and goals",
      details: [
        "Voice-guided workouts with real-time feedback",
        "Personalized training plans based on your performance (coming soon)",
        "Adaptive difficulty that grows with your strength (coming soon)",
      ],
      gradient: "from-purple-500 to-indigo-600",
      delay: "0s",
    },
    {
      icon: "📈",
      title: "Advanced Analytics",
      description:
        "Deep insights into your performance with beautiful visualizations",
      details: [
        "Real-time performance metrics and tracking",
        "Progress charts with detailed breakdowns",
        "Heart rate and power analysis",
        "Export data for external analysis",
      ],
      gradient: "from-blue-500 to-cyan-600",
      delay: "0.1s",
    },
    {
      icon: "🎯",
      title: "Smart Goal Setting",
      description:
        "AI-powered goal recommendations based on your current fitness",
      details: [
        "Automatic goal adjustment based on progress (coming soon)",
        "Weekly and monthly milestone tracking (coming soon)",
        "Achievement badges and rewards system (coming soon)",
        "Custom challenge creation (coming soon)",
      ],
      gradient: "from-green-500 to-emerald-600",
      delay: "0.2s",
    },
    {
      icon: "📱",
      title: "iConsole+ Integration",
      description:
        "Specialized connection designed for iConsole+ smart trainers",
      details: [
        "Optimized specifically for iConsole+ devices",
        "Real-time resistance and incline control",
        "Custom protocol implementation",
        "Seamless data synchronization",
      ],
      gradient: "from-orange-500 to-red-600",
      delay: "0.3s",
    },
    {
      icon: "🎮",
      title: "Gamified Experience",
      description: "Make fitness fun with interactive gaming elements",
      details: [
        "3D bike animations and environments",
      ],
      gradient: "from-pink-500 to-purple-600",
      delay: "0.4s",
    },
    {
      icon: "🔄",
      title: "Workout Automation",
      description:
        "Intelligent workout scheduling and automatic plan adjustments",
      details: [
        "Smart calendar integration",
        "Time-optimized workout recommendations",
      ],
      gradient: "from-teal-500 to-blue-600",
      delay: "0.5s",
    },
  ];

  return (
    <section
      ref={featuresRef!}
      id="features"
      class="py-24 px-6 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div class="absolute top-0 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>

      <div class="container mx-auto max-w-7xl relative z-10">
        <div class="text-center mb-20 scroll-reveal">
          <h2 class="text-5xl md:text-6xl font-bold mb-8">
            Powerful <span class="gradient-text">Features</span>
          </h2>
          <p class="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Discover the cutting-edge technologies that make iConsole Client the
            most advanced fitness platform for smart bike training
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              class="scroll-reveal relative group"
              style={`animation-delay: ${feature.delay}`}
            >
              <div class="feature-card relative h-full">
                {/* Gradient border effect */}
                <div
                  class={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm`}
                ></div>

                <div class="relative z-10">
                  {/* Icon with glow effect */}
                  <div class="relative mb-6">
                    <div
                      class={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500`}
                    ></div>
                    <div class="relative text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>

                  <h3 class="text-2xl font-bold mb-4 text-white group-hover:text-glow transition-all duration-300">
                    {feature.title}
                  </h3>

                  <p class="text-gray-300 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  <ul class="space-y-3">
                    {feature.details.map((detail, detailIndex) => (
                      <li
                        class="flex items-start text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-500"
                        style={`transition-delay: ${detailIndex * 100}ms`}
                      >
                        <div
                          class={`w-1.5 h-1.5 bg-gradient-to-r ${feature.gradient} rounded-full mt-2 mr-3 flex-shrink-0`}
                        ></div>
                        <span class="group-hover:text-gray-300 transition-colors duration-300">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg
                      class={`w-6 h-6 text-gradient bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

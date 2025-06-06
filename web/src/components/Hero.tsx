import { Component, onMount } from "solid-js";

const Hero: Component = () => {
  let heroRef: HTMLElement | undefined;

  onMount(() => {
    if (!heroRef) return;

    // Create floating particles
    const createParticle = () => {
      if (!heroRef) return;
      const particle = document.createElement("div");
      particle.classList.add("particle");
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDelay = Math.random() * 20 + "s";
      particle.style.animationDuration = Math.random() * 10 + 15 + "s";
      heroRef.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 25000);
    };

    // Create initial particles
    for (let i = 0; i < 20; i++) {
      setTimeout(() => createParticle(), i * 1000);
    }

    // Continue creating particles
    setInterval(createParticle, 2000);
  });

  const features = [
    { icon: "🤖", text: "AI-Powered Training" },
    { icon: "📊", text: "Real-time Analytics" },
    { icon: "🎮", text: "Interactive Experience" },
  ];

  return (
    <section
      ref={heroRef!}
      class="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
    >
      <div class="absolute inset-0 hero-glow"></div>
      <div class="absolute top-20 left-10 w-32 h-32 border border-purple-500/30 rounded-full floating"></div>
      <div
        class="absolute bottom-20 right-10 w-24 h-24 border border-indigo-500/30 rounded-lg floating"
        style="animation-delay: -2s"
      ></div>
      <div
        class="absolute top-1/2 left-20 w-16 h-16 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full floating"
        style="animation-delay: -4s"
      ></div>

      <div class="container mx-auto max-w-6xl text-center relative z-10">
        <div class="slide-in-up">
          <h1 class="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            Meet Your
            <br />
            <span class="gradient-text neon-glow">AI Fitness Coach</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Experience the future of fitness with{" "}
            <span class="text-purple-400 font-semibold">iConsole+ Client</span> -
            where artificial intelligence meets personalized training for your
            smart bike
          </p>
          <div class="glass-card max-w-3xl mx-auto mb-12 border-orange-500/30 bg-orange-500/5">
            <div class="flex items-start space-x-4">
              <div class="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="text-left">
                <h3 class="text-lg font-semibold text-orange-300 mb-2">
                  Important Notice
                </h3>
                <p class="text-gray-300 text-sm leading-relaxed">
                  This is an{" "}
                  <strong>unofficial, third-party application</strong> designed
                  specifically for <strong>iConsole+ devices</strong>. It's a
                  personal project created for individual use and is{" "}
                  <strong>
                    not affiliated with or endorsed by the official manufacturer
                  </strong>
                  . Use at your own discretion.
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap justify-center gap-6 mb-12">
            {features.map((feature, index) => (
              <div
                class="glass-card flex items-center space-x-3 px-6 py-3 text-sm md:text-base"
                style={`animation-delay: ${index * 0.2}s`}
              >
                <span class="text-2xl">{feature.icon}</span>
                <span class="text-white font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          class="w-6 h-6 text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;

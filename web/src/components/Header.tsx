import { Component, createSignal, onMount } from "solid-js";

const Header: Component = () => {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [isScrolled, setIsScrolled] = createSignal(false);

  onMount(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: "features", label: "Features" },
    { id: "screenshots", label: "Screenshots" },
    { id: "compatibility", label: "Compatibility" },
    { id: "download", label: "Download" },
  ];

  return (
    <header
      class={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled()
          ? "glass-card border-b border-white/10 shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <nav class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          {/* Logo */}
          <div class="flex items-center space-x-3">
            <div
              class={`w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                isScrolled() ? "scale-90" : "scale-100"
              }`}
            >
              <svg
                class="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold gradient-text">iConsole+ Client</h1>
              <p class="text-xs text-gray-400 hidden sm:block">
                AI Fitness Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div class="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                onClick={() => scrollTo(item.id)}
                class="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 relative group"
              >
                {item.label}
                <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div class="hidden md:flex items-center space-x-4">
            <button
              onClick={() => scrollTo("download")}
              class="btn-secondary px-6 py-2 text-sm"
            >
              Download
            </button>
            <button class="btn-primary group px-6 py-2 text-sm">
              🚀 Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen())}
            class="md:hidden w-10 h-10 flex items-center justify-center glass-card rounded-xl"
          >
            <div class="w-5 h-5 flex flex-col justify-center space-y-1">
              <span
                class={`block h-0.5 bg-white transition-all duration-300 ${
                  isMenuOpen() ? "rotate-45 translate-y-1.5" : ""
                }`}
              ></span>
              <span
                class={`block h-0.5 bg-white transition-all duration-300 ${
                  isMenuOpen() ? "opacity-0" : ""
                }`}
              ></span>
              <span
                class={`block h-0.5 bg-white transition-all duration-300 ${
                  isMenuOpen() ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              ></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          class={`md:hidden transition-all duration-500 overflow-hidden ${
            isMenuOpen() ? "max-h-96 opacity-100 mt-6" : "max-h-0 opacity-0"
          }`}
        >
          <div class="glass-card rounded-2xl p-6 space-y-4">
            {navItems.map((item, index) => (
              <button
                onClick={() => scrollTo(item.id)}
                class="block w-full text-left text-gray-300 hover:text-white transition-all duration-300 py-2 hover:translate-x-2"
                style={`animation-delay: ${index * 0.1}s`}
              >
                {item.label}
              </button>
            ))}
            <div class="border-t border-white/10 pt-4 space-y-3">
              <button
                onClick={() => scrollTo("download")}
                class="btn-secondary w-full"
              >
                Download
              </button>
              <button class="btn-primary group w-full">🚀 Get Started</button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

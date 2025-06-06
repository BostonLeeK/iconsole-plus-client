import { Component } from "solid-js";
import Compatibility from "./components/Compatibility";
import Download from "./components/Download";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Screenshots from "./components/Screenshots";

const App: Component = () => {
  return (
    <div class="min-h-screen bg-gray-900">
      <Header />
      <main>
        <Hero />
        <Features />
        <Screenshots />
        <Compatibility />
        <Download />
      </main>
      <Footer />
    </div>
  );
};

export default App;

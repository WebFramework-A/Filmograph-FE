import About from "../components/HomePage/About";
import Hero from "../components/HomePage/Hero";
import HowToUse from "../components/HomePage/HowToUse";

const HomePage = () => {
  return (
    <div className="h-screen w-full overflow-x-hidden overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      <Hero />
      <About />
      <HowToUse />
    </div>
  );
};

export default HomePage;

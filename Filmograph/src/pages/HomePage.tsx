import About from "../components/HomePage/About";
import FeaturesDescription from "../components/HomePage/FeaturesDescription";
import GraphDescription from "../components/HomePage/GraphDescription";
import Hero from "../components/HomePage/Hero";
import HowToUse from "../components/HomePage/HowToUse";

const HomePage = () => {
  return (
    <div className="w-full">
      <Hero />
      <About />
      <HowToUse />
      <GraphDescription />
      <FeaturesDescription />
    </div>
  );
};

export default HomePage;

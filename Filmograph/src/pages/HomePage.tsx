import About from "../components/HomePage/About";
import GraphDescription from "../components/HomePage/GraphDescription";
import Hero from "../components/HomePage/Hero";
import HowToUse from "../components/HomePage/HowToUse";
import Footer from "./Footer";

const HomePage = () => {
  return (
    <div className="h-screen w-full overflow-x-hidden overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      <GraphDescription />

      <Hero />
      <About />
      <HowToUse />
      <Footer />
    </div>
  );
};

export default HomePage;

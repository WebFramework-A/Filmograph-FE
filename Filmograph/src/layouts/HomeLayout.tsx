import { Outlet } from "react-router-dom";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";

import "./HomeLayout.css";

const HomeLayout = () => {
  return (
    <div className="home-layout-container">
      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default HomeLayout;

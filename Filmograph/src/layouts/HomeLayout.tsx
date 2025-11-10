import { Outlet } from "react-router-dom";
import Header from "../pages/Header";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";

import "./HomeLayout.css";

const HomeLayout = () => {
  return (
    <div className="home-layout-container">
      <Header />
      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default HomeLayout;

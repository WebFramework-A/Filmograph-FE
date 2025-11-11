import { Outlet } from "react-router-dom";
import Header from "../pages/Header";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";

import "./HomeLayout.css";

const HomeLayout = () => {
  return (
    <div className="min-h-screen w-full">
      <Navbar />

      <main className="w-full flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default HomeLayout;

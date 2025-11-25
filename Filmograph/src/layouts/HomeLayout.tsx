import { Outlet } from "react-router-dom";
import Navbar from "../pages/Navbar";

const HomeLayout = () => {
  return (
    <div className="min-h-screen w-full">
      <Navbar />

      <main className="w-full flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default HomeLayout;

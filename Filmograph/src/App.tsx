import { createBrowserRouter, RouterProvider } from "react-router-dom";

// 스타일 import
import "./App.css";

// 컴포넌트 imports
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import HomeLayout from "./layouts/HomeLayout";
import ArchetypePage from "./pages/ArchetypePage";
import MyPage from "./pages/MyPage";
import GraphPage from "./pages/GraphPage";
import LoginPage from "./pages/LoginPage";
import DetailPage from "./pages/DetailPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/graph",
        element: <GraphPage />,
      },
      {
        path: "/archetype",
        element: <ArchetypePage />,
      },
      {
        path: "/my",
        element: <MyPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/detail",
        element: <DetailPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;

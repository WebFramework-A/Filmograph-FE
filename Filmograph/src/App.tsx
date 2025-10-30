import { createBrowserRouter, RouterProvider } from "react-router-dom";

// 스타일 import
import "./App.css";

// 컴포넌트 imports
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import HomeLayout from "./layouts/HomeLayout";
import GraphPage from "./pages/GraphPage";
import ArchetypePage from "./pages/ArchetypePage";
import MyPage from "./pages/MyPage";

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
    ],
  },
]);

function App() {
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;

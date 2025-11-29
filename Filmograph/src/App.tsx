import { createBrowserRouter, RouterProvider } from "react-router-dom";

// 스타일 import
import "./App.css";

// 컴포넌트 imports
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import HomeLayout from "./layouts/HomeLayout";
import ArchetypePage from "./pages/ArchetypePage";
import MyPage from "./pages/MyPage";
import LoginPage from "./pages/LoginPage";
import DetailPage from "./pages/DetailPage";
import LoadPage from "./pages/LoadPage";
import WishlistPage from "./components/MyPage/MyLikesPage";
import MyReviewsPage from "./components/MyPage/MyReviewsPage";
import GraphHome from "./pages/GraphHome";
import GraphDetail from "./components/GraphPage/GraphDetail";
import MapPage from "./pages/MapPage";
import AllMoviesPage from "./pages/AllMoviesPage";

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
        element: <GraphHome />,
      },
      {
        path: "/graph/:graphType",
        element: <GraphDetail />,
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
        path: "/load",
        element: <LoadPage />,
      },
      {
        path: "/detail/:movieId",
        element: <DetailPage />,
      },
      {
        path: "/wishlist",
        element: <WishlistPage />,
      },
      {
        path: "/review",
        element: <MyReviewsPage />,
      },
      {
        path: "/map",
        element: <MapPage />,
      },
      {
        path: "/allmovie",
        element: <AllMoviesPage />,
      }
    ],
  },
]);

function App() {
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;

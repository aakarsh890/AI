import { Routes, Route, Navigate, useLocation } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { checkAuth } from "./features/auth/authThunks";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import logo from "/download.png";
import LoadingScreen from "./components/LoadingScreen";
import MainWebsite from "./components/MainWebsite";

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loadingSc, setLoadingSc] = useState(true);
  const location = useLocation();

  const handleLoadingComplete = () => {
    setLoadingSc(false);
  };

  const showLoadingScreen = ["/", "/login"].includes(location.pathname);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <div className="bg-gray-950 relative  min-h-[100vh] overflow-hidden w-full">
      {showLoadingScreen && loadingSc && (
        <LoadingScreen onComplete={handleLoadingComplete} />
      )}
      <img src={logo} alt="" className="absolute z-0 inset-0 h-full" />
      <Toaster position="top-center" />
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <MainWebsite /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />

        <Route
          path="/chat/:chatId"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" /> : <Register />}
        />
      </Routes>
    </div>
  );
}

export default App;

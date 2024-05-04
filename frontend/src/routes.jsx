import Login from "./pages/Login";
import { Register } from "./pages/Register";
import { Chat } from "./pages/Chat";
import PrivateRoute from "./hoc/PrivateRoute";
import { Navigate } from "react-router-dom";

const routes = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/chat",
    element: (
      <PrivateRoute>
        <Chat />
      </PrivateRoute>
    ),
  },

  // Wildcard route for non-existing paths
  { path: "*", element: <Navigate to="/login" /> },
];

export default routes;

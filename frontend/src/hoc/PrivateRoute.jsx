import React , {useEffect} from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    useEffect(() => {

    },[isAuthenticated])

  if (isAuthenticated) {
    return children;
  }
  return <Navigate to="/login" />;
};

export default PrivateRoute;

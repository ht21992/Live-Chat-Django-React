import React, { Fragment, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { isAuthenticatedAsync } from '../slices/authSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Import useHistory hook

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const storedToken = localStorage.getItem("token");
  const loading = useSelector((state) => state.auth.loading);

  const navigate = useNavigate(); // Initialize useHistory hook

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!isAuthenticated && storedToken) {
        try {
          await dispatch(isAuthenticatedAsync(storedToken));
        } catch (error) {
          console.error("Error while checking the auto authentication:", error);
        }
      }
    };
    checkAuthentication();
  }, [dispatch, isAuthenticated, storedToken]);

  useEffect(() => {
    // Redirect to "/chat" if user is authenticated
    if (isAuthenticated) {
      navigate("/chat");
    }
  }, [isAuthenticated, history]);

  return (
    <div>
      <Fragment>
        {children}
      </Fragment>
    </div>
  );
};

export default Layout;

// pwa/src/App.js

import { Fragment, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";
import "../styles/Layout.sass";
import _ from "lodash";
import { selectUser } from "../features/authSlice";
import { useSelector } from "react-redux";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);

  useEffect(() => {
    const paths = [
      "/sign-in",
      "/sign-up",
      "/about",
    ];

    if (!_.includes(paths, location.pathname) && user.status !== "connected") {
      navigate('/sign-in');
    }
  }, [location]);

  return (
    <Fragment>
      <Toaster position="bottom-right" reverseOrder={false} />
      <Navbar />
      <div id="Layout">
        <Outlet />
      </div>
    </Fragment>
  );
};

export default Layout;

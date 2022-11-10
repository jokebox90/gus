// pwa/src/App.js

import _ from "lodash";
import { Fragment, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { selectUser, synchronized } from "../features/authSlice";
import Navbar from "./Navbar";
import "../styles/Layout.sass";

const Layout = () => {
  const dispatch = useDispatch();
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

  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("gus:local"));
    const hasLocalStorageData = _.isNil(local);
    const hasReduxStateData = _.isEqual(_.get(local, "status"), _.get(user, "status"));
    if (!hasLocalStorageData && !hasReduxStateData) {
      dispatch(synchronized());
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

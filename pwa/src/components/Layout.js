// pwa/src/App.js

import { Fragment } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";
import "../styles/Layout.sass";

const Layout = () => {
  return (
    <Fragment>
      <Toaster position="bottom-right" reverseOrder={false} />

      <Navbar />

      <div id="Home">
        <div className="hero is-fullheight">
          <div className="hero-body is-flex-direction-column is-align-items-center">
            <div className="section">
              <h1 className="title has-text-centered">Gus</h1>
              <h2 className="subtitle has-text-centered">
                Graphical User Storage
              </h2>
            </div>

            <Outlet />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Layout;

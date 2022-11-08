// pwa/src/Home.js

import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div id="Home">
      <div className="hero is-fullheight">
        <div className="hero-body is-flex-direction-column is-align-items-center is-justify-content-center">
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
  );
};

export default Home;

// pwa/src/App.js

import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  return (
    <nav
      className="navbar is-dark"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="navbar-brand">
        <div className="navbar-item">
          <h1 className="title my-0 py-0">
            <Link to="/" className="navbar-link is-arrowless">
              Gus
            </Link>
          </h1>
        </div>
      </div>

      <div class="navbar-menu">
        <div className="navbar-start">
          <div className="navbar-item">
            <Link to="/bucket" className="navbar-link is-arrowless">
              Démarrage
            </Link>
            <Link to="/about" className="navbar-link is-arrowless">
              A propos
            </Link>
          </div>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <Link to="/sign-up" className="navbar-link is-arrowless">
              Inscription
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

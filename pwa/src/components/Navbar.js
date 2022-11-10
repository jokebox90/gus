// pwa/src/App.js

import { Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, disconnected } from "../features/authSlice";
import "../styles/Navbar.sass";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleDisconnect = () => {
    dispatch(disconnected());
    navigate("/sign-in");
  };

  return (
    <nav
      id="Navbar"
      className="navbar is-fixed-top is-primary"
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

      <div className="navbar-menu">
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
            {user.status === "connected" ? (
              <p
                className="navbar-link is-arrowless"
                onClick={() => handleDisconnect()}
              >
                Se déconnecter
              </p>
            ) : (
              <Fragment>
                <Link to="/sign-in" className="navbar-link is-arrowless">
                  Connexion
                </Link>
                <Link to="/sign-up" className="navbar-link is-arrowless">
                  Inscription
                </Link>
              </Fragment>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

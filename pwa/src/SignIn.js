// pwa/src/Home.js

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field, Form, Formik } from "formik";
import { http, notifyError } from "./services";

const SignIn = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const initialValues = { username: "", password: "" };
  const handleSignIn = (values) => {
    http
      .post("/sign-in", {
        username: values.username,
        password: values.password,
      })
      .then(() => {
        navigate("/bucket");
      })
      .catch(({ code, config, message, response }) => {
        notifyError(message);
      });
  };

  return (
    <div className="box mb-5 mx-3">
      <p className="subtitle has-text-centered has-text-dark">Se connecter</p>
      <Formik initialValues={initialValues} onSubmit={handleSignIn}>
        <Form>
          <div className="field">
            <label htmlFor="inputUsername" className="label">
              Identifiant
            </label>

            <div className="field has-addons">
              <div className="control">
                <div className="button is-light">
                  <span className="icon">
                    <i className="fa-solid fa-user"></i>
                  </span>
                </div>
              </div>

              <div className="control is-expanded">
                <Field
                  id="inputUsername"
                  type="text"
                  className="input is-small"
                  name={`username`}
                />
              </div>
            </div>
          </div>

          <div className="field">
            <div className="control">
              <label htmlFor="inputPassword" className="label">
                Mot de passe
              </label>

              <div className="field has-addons">
                <div className="control">
                  <div className="button is-light">
                    <span className="icon">
                      <i className="fa-solid fa-key"></i>
                    </span>
                  </div>
                </div>

                <div className="control is-expanded">
                  <Field
                    id="inputPassword"
                    type={showPassword ? "text" : "password"}
                    className="input is-small"
                    name={`password`}
                  />
                </div>

                <div className="control">
                  <button
                    type="button"
                    className={
                      showPassword ? "button is-light" : "button is-info"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <div className="icon">
                      <i
                        className={
                          showPassword
                            ? "fa-solid fa-eye"
                            : "fa-solid fa-eye-slash"
                        }
                      ></i>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="buttons is-centered mt-3">
            <button type="submit" className="button is-success is-small">
              Se connecter
            </button>
          </div>
          <div className="content">
            <p>
              <Link to="/sign-up">Inscrivez-vous</Link>
            </p>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default SignIn;

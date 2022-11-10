// pwa/src/Home.js

import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { http, notifyError, notifySuccess } from "../services";
import Hero from "./Hero";

const SignupSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("Adresse email invalide")
    .required("Adresse email requise"),
  username: Yup.string()
    .trim()
    .min(2, "Identifiant trop court")
    .max(50, "Identifiant trop long")
    .required("Identifiant requis"),
  password: Yup.string()
    .trim()
    .min(8, "Mot de passe trop court")
    .required("Mot de passe requis"),
});

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const initialValues = { username: "", password: "", email: "" };
  const handleSignUp = (values) => {
    http
      .post("/sign-up", {
        username: values.username,
        password: values.password,
        email: values.email,
      })
      .then(() => {
        notifySuccess("Inscription OK");
        navigate("/sign-in");
      })
      .catch(({ code, config, message, response }) => {
        notifyError(message);
      });
  };

  return (
    <Fragment>
      <Hero />
      <div className="columns is-gapless is-centered" style={{ width: "100%" }}>
        <div className="column is-4-desktop">
          <div className="box mb-5">
            <p className="subtitle has-text-centered has-text-dark">
              S'inscrire
            </p>
            <Formik
              initialValues={initialValues}
              onSubmit={handleSignUp}
              validationSchema={SignupSchema}
            >
              {({ errors, touched }) => {
                return (
                  <Form>
                    <div className="field">
                      <label htmlFor="inputEmail" className="label">
                        Email
                      </label>

                      <div className="field has-addons">
                        <div className="control">
                          <div className="button is-light">
                            <span className="icon">
                              <i className="fa-solid fa-at"></i>
                            </span>
                          </div>
                        </div>

                        <div className="control is-expanded">
                          <Field
                            id="inputEmail"
                            type="text"
                            className="input is-small"
                            name={`email`}
                          />
                        </div>
                      </div>
                    </div>

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
                                showPassword
                                  ? "button is-light"
                                  : "button is-info"
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
                      <button
                        type="submit"
                        className="button is-success is-small"
                      >
                        Inscrption
                      </button>
                    </div>

                    <ul>
                      {errors.email && touched.email ? (
                        <li className="has-text-danger">{errors.email}</li>
                      ) : null}
                      {errors.username && touched.username ? (
                        <li className="has-text-danger">{errors.username}</li>
                      ) : null}
                      {errors.password && touched.password ? (
                        <li className="has-text-danger">{errors.password}</li>
                      ) : null}
                    </ul>
                  </Form>
                );
              }}
            </Formik>

            <div className="content">
              <p>
                <Link to="/sign-in">Connectez-vous</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default SignUp;

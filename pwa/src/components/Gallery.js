// gallery\assets\pages\index.js

import _ from "lodash";
import { useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import { useSWRConfig } from "swr";
import {
  baseUrl,
  http,
  notifyError,
  notifySuccess,
} from "../services";

const Gallery = (props) => {
  const navigate = useNavigate();
  const [display, setDisplay] = useState({});
  const { mutate } = useSWRConfig();

  const startOfRange = props.currentPage * 18;
  const endOfRange = (props.currentPage + 1) * 18;
  const objectRange = _.slice(props.s3objects, startOfRange, endOfRange);

  const httpUpdateMedia = ({ upload }) => {
    return http
      .patch(`/${upload.unique_id}`, upload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 245500,
      })
      .then((response) => {
        notifySuccess("Mis à jour !");
        mutate(baseUrl);
      })
      .catch(({ code, config, message, response }) => {
        notifyError(message);
        if (response.status === 403) {
          navigate("/sign-in");
        }
      });
  };

  const httpDeleteMedia = async ({ medias }) => {
    return http
      .delete(null, { data: medias })
      .then((response) => {
        _.map(medias, (obj) => {
          setDisplay({ ...display, [obj.unique_id]: false });
        });
        mutate(baseUrl);
        notifySuccess(`Supprimé(s) !`);
      })
      .catch(({ code, config, message, response }) => {
        notifyError(message);
        if (response.status === 403) {
          navigate("/sign-in");
        }
      });
  };

  return (
    <Fragment>
      {_.map(objectRange, (obj, index) => {
        const handleOpen = () =>
          setDisplay({ ...display, [obj.unique_id]: true });
        const handleClose = () =>
          setDisplay({ ...display, [obj.unique_id]: false });
        const handleSubmit = async (values) => {
          setDisplay({ ...display, [obj.unique_id]: false });
          httpUpdateMedia({ upload: values });
        };

        return (
          <div
            key={obj.unique_id}
            className="column is-2-desktop is-3-tablet is-4-mobile"
          >
            {display[obj.unique_id] === true ? (
              <div className="modal is-active">
                <div className="modal-background"></div>

                <div className="modal-content">
                  <div className="box">
                    <div className="is-flex is-align-items-center">
                      {_.startsWith(obj.content_type, "video") ? (
                        <video
                          style={{
                            width: "100%",
                            maxHeight: "340px",
                          }}
                          autoPlay={false}
                          controls={true}
                          muted={false}
                          loop={false}
                        >
                          <source src={obj.url} type={obj.content_type} />
                          Oups, le navigateur ne support pas les vidéos HTML5.
                        </video>
                      ) : (
                        <img src={obj.url} alt={obj.title} />
                      )}
                    </div>

                    <p className="has-text-weight-bold has-text-centered mt-3 mb-5">
                      Fichier: {obj.name}
                    </p>

                    <p>
                      <a href={obj.url}>Afficher</a>
                    </p>

                    <Formik initialValues={obj} onSubmit={handleSubmit}>
                      {({ values }) => (
                        <Form>
                          <Fragment>
                            <div className="content">
                              <div className="field">
                                <div className="control">
                                  <label
                                    htmlFor="inputMediaTitle"
                                    className="label"
                                  >
                                    Titre
                                  </label>
                                  <Field
                                    id="inputMediaTitle"
                                    type="text"
                                    className="input is-small"
                                    name={`title`}
                                    placeholder="Saisissez un titre ici..."
                                  />
                                </div>
                              </div>
                              <div className="field">
                                <div className="control">
                                  <label
                                    htmlFor="inputMediaDescription"
                                    className="label"
                                  >
                                    Description
                                  </label>
                                  <Field
                                    id="inputMediaDescription"
                                    as="textarea"
                                    className="textarea is-small"
                                    name={`description`}
                                    placeholder="Saisissez une description ici..."
                                  />
                                </div>
                              </div>
                            </div>
                          </Fragment>

                          <div className="buttons is-centered">
                            <button
                              type="submit"
                              className="button is-success is-large"
                              style={{ width: "25%" }}
                            >
                              Envoyer
                            </button>
                            <button
                              type="button"
                              className="button is-warning is-large"
                              onClick={() =>
                                httpDeleteMedia({ medias: [obj.unique_id] })
                              }
                            >
                              Supprimer
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>

                <button
                  type="button"
                  className="modal-close is-large"
                  aria-label="close"
                  onClick={() => handleClose()}
                ></button>
              </div>
            ) : null}

            <div className="box p-0" style={{ overflow: "hidden" }}>
              {_.startsWith(obj.content_type, "video") ? (
                <video
                  style={{
                    width: "100%",
                    maxHeight: "160px",
                  }}
                  autoPlay={false}
                  controls={true}
                  muted={false}
                  loop={false}
                  onClick={() => handleOpen()}
                >
                  <source src={obj.url} type={obj.content_type} />
                  Oups, le navigateur ne support pas les vidéos HTML5.
                </video>
              ) : (
                <img onClick={() => handleOpen()} src={obj.url} alt={obj.title} />
              )}

              <div
                className="px-1 py-3 has-text-centered has-text-white has-background-link"
                onClick={() => handleOpen()}
              >
                <p
                  className="is-size-7 has-text-weight-bold is-underlined"
                  style={{ minHeight: "36px" }}
                >
                  {_.truncate(_.get(obj, "title", "Pas de titre"), {
                    length: 16,
                    separator: "",
                  })}
                </p>
                <p className="is-size-7" style={{ minHeight: "54px" }}>
                  {_.get(obj, "description", "Pas de description")}
                </p>
                <p className="is-size-7 is-italic">
                  {_.truncate(obj.name, { length: 20, separator: "" })}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </Fragment>
  );
};

export default Gallery;

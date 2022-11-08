// gallery\assets\pages\index.js

import { useState, Fragment, createRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Form, FieldArray, Field } from "formik";
import _ from "lodash";
import "./Bucket.css";
import useSWR, { useSWRConfig } from "swr";
import { baseUrl, fetcher, http, notifyError, notifySuccess } from "./services";

const useMediaList = ({ purge }) => {
  const target = purge ? `${baseUrl}?CACHE_PURGE=1` : baseUrl;
  const { data, error } = useSWR(target, fetcher);
  return {
    data: data,
    isLoading: !data && !error,
    isError: error,
  };
};

export const httpCreateMedia = async ({ uploads }) => {
  const form = new FormData();
  _.map(uploads, (file) => {
    form.append(file.name, file.file, file.name);
    form.append(file.name + ".1", _.get(file, "title", "Pas de titre"));
    form.append(
      file.name + ".2",
      _.get(file, "description", "Pas de description")
    );
  });

  return await http.put(null, form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 245500,
  });
};

const Hero = () => {
  return (
    <div className="hero is-halfheight is-dark">
      <div className="hero-body is-align-items-end">
        <div className="content">
          <p className="subtitle is-size-4 has-text-grey">Bienvenue</p>
          <p className="title is-size-1 my-5">Liste des médias</p>
          <p className="is-size-5 has-text-weight-bold">
            <span className="icon mr-2">
              <i className="fa-solid fa-circle-arrow-right" />
            </span>
            Cliquez pour visualiser.
          </p>
        </div>
      </div>
    </div>
  );
};

const Uploader = () => {
  const fileUploadRef = createRef();
  const [uploads, setUploads] = useState([]);
  const [display, setDisplay] = useState(false);
  const { mutate } = useSWRConfig();

  const handleSelect = () => {
    setUploads(
      _.map(_.get(fileUploadRef.current, "files"), (file) => {
        return {
          name: file.name,
          data: URL.createObjectURL(file),
          file: file,
        };
      })
    );
    setDisplay(true);
  };

  const handleUpload = async (values) => {
    await httpCreateMedia({ uploads: values.uploads })
      .then((response) => {
        setUploads(response.data);
        handleHide();
        mutate(baseUrl);
      })
      .catch((error) => {
        notifyError(JSON.stringify(error, null, 2));
      });
  };

  const handleShow = () => {
    fileUploadRef.current.click();
  };

  const handleHide = () => {
    setDisplay(false);
    setUploads(null);
  };

  return (
    <Fragment>
      <input
        id="file-upload"
        ref={fileUploadRef}
        type="file"
        className="is-hidden"
        onChange={() => handleSelect()}
        multiple
      />

      <button
        className="button is-link is-rounded"
        onClick={() => handleShow()}
      >
        Ajouter
      </button>

      {display ? (
        <div className="modal is-active">
          <div className="modal-background"></div>

          <div className="modal-content">
            <Formik initialValues={{ uploads }} onSubmit={handleUpload}>
              {({ values }) => (
                <Form>
                  <FieldArray name="uploads">
                    <Fragment>
                      {_.map(uploads, (upload, index) => (
                        <Fragment key={index}>
                          <div className="box mb-5 mx-3">
                            <div className="media mb-5">
                              <Field
                                type="hidden"
                                className="input is-small"
                                name={`uploads.${index}.name`}
                              />

                              <div className="media-left">
                                <div className="image is-64x64">
                                  <img src={upload.data} alt="" />
                                </div>
                              </div>

                              <div className="media-content">
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
                                      name={`uploads.${index}.title`}
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
                                      name={`uploads.${index}.description`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="has-text-weight-bold has-text-centered">
                              Fichier: {upload.name}
                            </p>
                          </div>
                        </Fragment>
                      ))}
                    </Fragment>
                  </FieldArray>

                  <div className="buttons is-centered">
                    <button
                      type="submit"
                      className="button is-success is-large"
                    >
                      Envoyer
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          <button
            type="button"
            className="modal-close is-large"
            aria-label="close"
            onClick={() => handleHide()}
          ></button>
        </div>
      ) : null}
    </Fragment>
  );
};

const Heading = ({ s3objects }) => {
  const objectCount = _.size(s3objects);
  const pageCount = _.ceil(objectCount / 18);

  return (
    <Fragment>
      <div className="section">
        <h2 className="title has-text-white">Votre collection</h2>
      </div>

      <div className="section pt-0">
        <div className="columns is-mobile is-gapless">
          <div className="column">
            <div className="buttons is-left">
              <Uploader />
            </div>
          </div>

          <div className="column is-flex is-justify-content-end">
            <span className="tags has-addons are-small m-0">
              <span className="tag is-dark is-rounded">
                {_.size(s3objects)}
              </span>
              <span className="tag is-success is-rounded">éléments</span>
            </span>

            <span className="tags has-addons are-small m-0">
              <span className="tag is-dark is-rounded">{pageCount}</span>
              <span className="tag is-info is-rounded">pages</span>
            </span>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

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
                    <div className="is-flex is-justify-content-center">
                      <img src={obj.url} alt="" />
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
              <img onClick={() => handleOpen()} src={obj.url} alt="" />

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

const Bucket = () => {
  const [state, setState] = useState({
    currentPage: 0,
    modalActive: {},
    modalUploadActive: false,
  });
  const [ searchParams ] = useSearchParams();
  const { data, isLoading, isError } = useMediaList({
    purge: Boolean(searchParams.get("CACHE_PURGE"))
  });

  if (isLoading) return <p>En cours de chargement...</p>;
  if (isError)
    return <p className="has-text-danger">Erreur lors du chargement !</p>;

  const objectCount = _.size(data.s3objects);
  const pageCount = _.ceil(objectCount / 18);

  const handleButtonPrev = () => {
    const newState = { ...state };
    if (newState.currentPage === 0) {
      newState.currentPage = pageCount - 1;
    } else {
      newState.currentPage = state.currentPage - 1;
    }
    setState(newState);
  };

  const handleButtonPage = (number) => {
    setState({ ...state, currentPage: number });
  };

  const handleButtonNext = () => {
    const newState = { ...state };
    if (newState.currentPage === pageCount - 1) {
      newState.currentPage = 0;
    } else {
      newState.currentPage = state.currentPage + 1;
    }
    setState(newState);
  };

  return (
    <Fragment>
      <div id="Bucket" className="has-background-black">
        <Hero />
        <Heading s3objects={data.s3objects} />

        <div
          id="mainContent"
          className="columns is-mobile is-gapless is-multiline"
        >
          <div className="column is-1 is-hidden-mobile is-flex is-align-items-center is-justify-content-center">
            <span
              className="icon is-size-1 has-text-link pointer"
              onClick={() => handleButtonPrev()}
            >
              <i className="fa-solid fa-circle-chevron-left" />
            </span>
          </div>

          <div className="column is-auto">
            <div className="columns is-multiline is-mobile mx-3">
              <Gallery
                s3objects={data.s3objects}
                currentPage={state.currentPage}
              />
            </div>
          </div>

          <div className="column is-1 is-hidden-mobile is-flex is-align-items-center is-justify-content-center">
            <span
              className="icon is-size-1 has-text-link pointer"
              onClick={() => handleButtonNext()}
            >
              <i className="fa-solid fa-circle-chevron-right"></i>
            </span>
          </div>
        </div>

        <div className="buttons is-centered mt-6">
          {_.map(_.range(1, pageCount + 1), (number, index) => {
            const classes = [];
            classes.push("button");
            classes.push("is-link");
            classes.push("is-rounded");
            state.currentPage !== number - 1 && classes.push("is-outlined");
            return (
              <Fragment key={index}>
                <button
                  type="button"
                  className={_.join(classes, " ")}
                  onClick={() => handleButtonPage(number - 1)}
                >
                  {number}
                </button>
              </Fragment>
            );
          })}
        </div>
      </div>
    </Fragment>
  );
};

export default Bucket;

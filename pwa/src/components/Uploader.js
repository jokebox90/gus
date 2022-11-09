// pwa\src\components\Uploader.js

import _ from "lodash";
import { useState, Fragment, createRef } from "react";
import { Formik, Form, FieldArray, Field } from "formik";
import { useSWRConfig } from "swr";
import {
  baseUrl,
  http,
  notifyError,
  notifySuccess,
} from "../services";

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
    const form = new FormData();
    _.map(uploads, (file) => {
      form.append(file.name, file.file, file.name);
      form.append(file.name + ".1", _.get(file, "title", "Pas de titre"));
      form.append(
        file.name + ".2",
        _.get(file, "description", "Pas de description")
      );
    });

    const { status, message } = await http.put(null, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 245500,
    });

    if (status < 300) {
      handleHide();
      mutate(baseUrl);
      notifySuccess("Les fichiers sont bien enrgistrés.");
    } else {
      notifyError(message);
    }
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

export default Uploader;

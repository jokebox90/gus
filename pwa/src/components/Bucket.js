// gallery\assets\pages\index.js

import _ from "lodash";
import { useState, Fragment, useReducer } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMediaList } from "../services";
import { selectUser } from "../features/authSlice";
import Heading from "./Heading";
import Gallery from "./Gallery";
import "../styles/Bucket.sass";

const Bucket = () => {
  const user = useSelector(selectUser);
  const [state, setState] = useState({
    currentPage: 0,
    modalActive: {},
    modalUploadActive: false,
  });

  const [searchParams] = useSearchParams();
  const { data, isLoading, isError } = useMediaList({
    purge: Boolean(searchParams.get("CACHE_PURGE")),
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
        <div className="hero is-halfheight is-dark">
          <div className="hero-body is-align-items-end">
            <div className="content">
              <p className="subtitle is-size-4 has-text-grey">Bienvenue</p>
              <p className="title is-size-1 my-5">@{user.username}</p>
            </div>
          </div>
        </div>

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

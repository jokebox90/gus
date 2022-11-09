// gallery\assets\pages\index.js

import _ from "lodash";
import { Fragment } from "react";
import Uploader from "./Uploader";

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

export default Heading;

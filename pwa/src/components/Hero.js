// pwa/src/components/Hero.js

import _ from "lodash";
import "../styles/Hero.sass";

const Hero = ({ title, subtitle, size, hasNavbarFixedTop }) => {
  const heroClassList = [];

  heroClassList.push("hero");
  !_.isNull(size) &&
    heroClassList.push(`is-${size}`);
  !_.isNull(hasNavbarFixedTop) &&
    heroClassList.push("has-navbar-fixed-top");

  const heroBodyClassList = [];

  heroBodyClassList.push("hero-body");
  heroBodyClassList.push("is-flex-direction-column");
  heroBodyClassList.push("is-align-items-center");

  !_.isNull(size) && size === "fullheight" &&
    heroBodyClassList.push(`is-justify-content-center`);

  return (
    <div id="Hero">
      <div className={_.join(heroClassList, " ")}>
        <div className={_.join(heroBodyClassList, " ")}>
          <div className="section">
            <h1 className="title has-text-centered">
              {title ? title : "Gus"}
            </h1>
            <h2 className="subtitle has-text-centered">
              {subtitle ? subtitle : "Graphical User Storage"}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

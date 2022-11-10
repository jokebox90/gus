// pwa/src/components/Hero.js

import _ from "lodash";
import "../styles/Hero.sass";

const Hero = ({ hasNavbarFixedTop }) => {
  const heroClassList = [];
  heroClassList.push("hero");
  !_.isNull(hasNavbarFixedTop) &&
    heroClassList.push("has-navbar-fixed-top");

  return (
    <div id="Hero">
      <div className={_.join(heroClassList, " ")}>
        <div className="hero-body is-flex-direction-column is-align-items-center">
          <div className="section">
            <h1 className="title has-text-centered">Gus</h1>
            <h2 className="subtitle has-text-centered">
              Graphical User Storage
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

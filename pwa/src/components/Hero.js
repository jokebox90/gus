// pwa/src/components/Hero.js

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

export default Hero;

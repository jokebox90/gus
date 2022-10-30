// gallery\assets\pages\index.js

const IndexComponent = (props) => {
  return <h1 className="title">Hello, world!</h1>;
};

const domContainer = document.querySelector("#IndexContainer");
ReactDOM.render(<IndexComponent />, domContainer);

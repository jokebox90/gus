// pwa/src/App.js

import { Fragment } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import Bucket from "./Bucket";
import Page404 from "./404";
import "./App.css";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <Fragment>
      <Toaster position="bottom-right" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<SignIn />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
        </Route>
        <Route path="/bucket" element={<Bucket />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </Fragment>
  );
};

export default App;

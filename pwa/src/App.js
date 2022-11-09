// pwa/src/App.js

import { Routes, Route } from "react-router-dom";
import About from "./components/About";
import Bucket from "./components/Bucket";
import Layout from "./components/Layout";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Page404 from "./404";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<SignIn />} />
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="about" element={<About />} />
      </Route>
      <Route path="/bucket" element={<Bucket />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

export default App;

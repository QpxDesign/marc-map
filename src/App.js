import React from "react";
import "./App.css";
import Home from "./pages/Home";
import Privacy from "./pages/Privacy";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { AiFillQuestionCircle, AiFillCloseCircle } from "react-icons/ai";
import { Link } from "react-router-dom";

export default function Header() {
  const [showPopup, setShowPopup] = useState(false);
  function disablePopup() {
    setShowPopup(false);
    document.body.classList.remove("noscroll-all");
  }
  function enablePopup() {
    setShowPopup(true);
    document.body.classList.add("noscroll-all");
  }
  function togglePopup() {
    if (showPopup) {
      disablePopup();
    } else {
      enablePopup();
    }
  }

  return (
    <>
      <div className={showPopup ? "popup-background" : "hide"}>
        <div className="popup">
          <div className="hstack">
            <AiFillCloseCircle
              className="icon"
              role="button"
              onClick={() => disablePopup()}
            />
            <h1>About MarcMap</h1>
          </div>
          <p>
            MarcMap was created by{" "}
            <a href="https:/quinnpatwardhan.com">Quinn Patwardhan</a>, an avid
            railfan and a proud maryland resident who wanted to give his state
            and its commuters a better way to track their Marc Trains.
          </p>
          <h2>Contact Him</h2>
          <p>
            If you need support with MarcMap, or have questions regarding its
            devlopment, please reach out to him at info@marcmap.app
          </p>
          <div className="spacer"></div>
          <p>
            If you would like to see more of my projects, please visit my
            website:{" "}
            <a href="https:/quinnpatwardhan.com">quinnpatwardhan.com</a>, my{" "}
            <a href="https://www.linkedin.com/in/quinn-patwardhan-3b32441b4/">
              LinkedIn
            </a>
            , or my <a href="https://github.com/qpxdesign">Github</a>.
          </p>
        </div>
      </div>

      <header>
        <Link to="/">
          <h1>MarcMap</h1>
        </Link>
        <AiFillQuestionCircle
          role="button"
          className="icon"
          onClick={() => togglePopup()}
        />
      </header>
    </>
  );
}

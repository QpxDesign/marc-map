import React, { useEffect, useState } from "react";
import StopData from "../assets/StopData.json";
import RouteData from "../assets/RouteData.json";
import { HiArrowNarrowRight } from "react-icons/hi";
import { AiFillCloseCircle } from "react-icons/ai";

export default function TimeTable() {
  const [res, setRes] = useState([]);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(true);

  const [showDetailedView, setShowDetailedView] = useState(false);
  const [DetailedViewTrain, setDetailedViewTrain] = useState({});
  useEffect(() => {
    fetch("https://marc-api-production.up.railway.app/tripUpdatesAPI")
      .then((res) => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setRes(result.entity);
        },

        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  }, []);
  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  function handleDetailedViewEnable(tripId) {
    window.scrollTo(0, 0);
    setShowDetailedView(true);
    setDetailedViewTrain(tripId);
  }
  function handleDetailedViewDisable() {
    setShowDetailedView(false);
    setDetailedViewTrain("");
    window.onscroll = function () {
      window.scrollTo(0, 0);
    };
  }
  function formatTime(s) {
    const dtFormat = new Intl.DateTimeFormat("en-US", {
      timeStyle: "short",
      timeZone: "America/New_York",
    });

    var d = dtFormat.format(new Date(s * 1e3));
    d.replace("PM", "\n PM");
    d.replace("AM", "\n AM");
    return d;
  }

  window.onscroll = () => {
    if (showDetailedView) {
      window.scroll(0, 0);
    }
  };
  return (
    <>
      <div className={showDetailedView ? "detailedview-wrapper" : "hide"}>
        <AiFillCloseCircle
          className="close-icon"
          onClick={() => handleDetailedViewDisable()}
        />
        <h1>
          {DetailedViewTrain.tripUpdate !== undefined
            ? DetailedViewTrain.tripUpdate.trip.tripId.replace(
                "Train",
                "Train "
              )
            : "error"}
        </h1>
        <h2>
          {DetailedViewTrain.tripUpdate !== undefined
            ? RouteData.find(
                (route) => route.id == DetailedViewTrain.tripUpdate.trip.routeId
              ).route_name
            : "error"}{" "}
          Line
        </h2>
        <ul>
          {DetailedViewTrain.tripUpdate !== undefined
            ? DetailedViewTrain.tripUpdate.stopTimeUpdate.map((stop, index) => (
                <li>
                  <div
                    className={
                      DetailedViewTrain.tripUpdate.stopTimeUpdate[index]
                        .arrival !== undefined
                        ? DetailedViewTrain.tripUpdate.stopTimeUpdate[index]
                            .arrival.delay /
                            60 >=
                          5
                          ? "status-light red"
                          : "status-light green"
                        : "status-light green"
                    }
                  />
                  {DetailedViewTrain.tripUpdate.stopTimeUpdate[index]
                    .arrival !== undefined
                    ? String(
                        Math.abs(
                          Math.floor(
                            DetailedViewTrain.tripUpdate.stopTimeUpdate[index]
                              .arrival.delay / 60
                          )
                        )
                      ).replace("NaN", "N/A ")
                    : "0"}
                  min{" "}
                  {DetailedViewTrain.tripUpdate.stopTimeUpdate[
                    DetailedViewTrain.tripUpdate.stopTimeUpdate.length - 1
                  ].arrival > 0
                    ? "early"
                    : "late"}
                  {" - "}
                  {StopData.find((s) => s.stop_id == stop.stopId) !== undefined
                    ? toTitleCase(
                        StopData.find((s) => s.stop_id == stop.stopId).stop_name
                      )
                    : null}
                  {DetailedViewTrain.tripUpdate.stopTimeUpdate[index]
                    .arrival !== undefined ? (
                    <span className="time">
                      {formatTime(
                        DetailedViewTrain.tripUpdate.stopTimeUpdate[index]
                          .arrival.time
                      )}
                    </span>
                  ) : null}
                </li>
              ))
            : null}
        </ul>
      </div>
      <div
        className={showDetailedView ? "detailedview-background" : "hide"}
      ></div>
      <div className="timetable-wrapper">
        <h1>Timetable</h1>
        {isLoaded === true ? (
          res.map((e, index) => (
            <div className="timetable-item">
              <h5>
                {" "}
                {String(
                  Math.abs(
                    Math.floor(
                      e.tripUpdate.stopTimeUpdate[
                        e.tripUpdate.stopTimeUpdate.length - 1
                      ].arrival.delay / 60
                    )
                  )
                ).replace("NaN", "N/A ")}
                min{" "}
                {e.tripUpdate.stopTimeUpdate[
                  e.tripUpdate.stopTimeUpdate.length - 1
                ].arrival > 0
                  ? "early"
                  : "late"}
              </h5>
              <div
                className={
                  e.tripUpdate.stopTimeUpdate[
                    e.tripUpdate.stopTimeUpdate.length - 1
                  ].arrival.delay /
                    60 >=
                  5
                    ? "status-light red"
                    : "status-light green"
                }
              />
              <h2>{e.tripUpdate.trip.tripId.replace("Train", "Train ")}</h2>
              <h2>
                {
                  RouteData.filter(
                    (route) => route.id == e.tripUpdate.trip.routeId
                  )[0].route_name
                }{" "}
                Line
              </h2>
              <HiArrowNarrowRight
                className="icon"
                onClick={() => handleDetailedViewEnable(e)}
              />
            </div>
          ))
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
}

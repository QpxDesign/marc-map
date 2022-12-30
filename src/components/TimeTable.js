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
    setTimeout(function() {window.scrollTo(0, 0);},1)
    document.body.classList.add("noscroll");
    window.scrollTo(0, 0);
    setShowDetailedView(true);
    setDetailedViewTrain(tripId);
  }
  function handleDetailedViewDisable() {
    document.body.classList.remove("noscroll");
    setShowDetailedView(false);
    setDetailedViewTrain("");
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
  function CustomFilter(tripId) {
    if (
      res.length === 0 ||
      res[0].tripUpdate === undefined ||
      res[0].tripUpdate.timestamp === undefined
    ) {
      return false;
    }
    var stopObject = [];

    var stopObject = res.find((e) => e.tripUpdate.trip.tripId === tripId)
      .tripUpdate.stopTimeUpdate;

    for (var index = 0; index < stopObject.length; index++) {
      const timestamp = res[0].tripUpdate.timestamp;
      if (
        stopObject.at(index).departure !== undefined &&
        stopObject.at(index).arrival !== undefined &&
        index !== stopObject.length - 1
      ) {
        if (
          stopObject.at(index).departure.time <= timestamp &&
          stopObject.at(index + 1).arrival.time >= timestamp
        ) {
          return stopObject.at(index + 1);
        }
      }
    }
    return false;
  }
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
                <li
                  className={
                    DetailedViewTrain.tripUpdate !== undefined &&
                    (CustomFilter(
                      DetailedViewTrain.tripUpdate.trip.tripId,
                      stop.stopId
                    ).arrival !==
                      undefined) &
                      (stop.arrival !== undefined)
                      ? CustomFilter(
                          DetailedViewTrain.tripUpdate.trip.tripId,
                          stop.stopId
                        ).arrival.time >= stop.arrival.time
                        ? "disabled"
                        : ""
                      : "/"
                  }
                >
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

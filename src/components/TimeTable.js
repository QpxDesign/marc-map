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

  async function getTripUpdatesData() {
    fetch("https://api.marcmap.app/TripUpdatesAPI")
      .then((r) => r.json())
      .then((r2) =>
        r2.entity !== undefined && !deepEqual(r2.entity, res)
          ? setRes(r2.entity)
          : null
      )
      .catch((err) => err);
  }
  useEffect(() => {
    getTripUpdatesData();
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      getTripUpdatesData();
    }, 10_000);

    return () => clearInterval(interval);
  }, []);
  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
  function deepEqual(x, y) {
    const ok = Object.keys,
      tx = typeof x,
      ty = typeof y;
    return x && y && tx === "object" && tx === ty
      ? ok(x).length === ok(y).length &&
          ok(x).every((key) => deepEqual(x[key], y[key]))
      : x === y;
  }
  function handleDetailedViewEnable(tripId) {
    window.scroll(0, 0);
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
  return (
    <>
      <div className={showDetailedView ? "detailedview-wrapper" : "hide"}>
        <AiFillCloseCircle
          className="close-icon"
          role="button"
          onClick={() => handleDetailedViewDisable()}
        />
        <h1>
          {DetailedViewTrain.tripUpdate !== undefined
            ? DetailedViewTrain.tripUpdate.trip.tripId
                .replace("Train", "Train ")
                .replace("Saturday", " Saturday")
                .replace("Sunday", " Sunday")
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
                  key={index}
                  className={
                    stop.arrival !== undefined
                      ? stop.arrival.time <= Date.now() / 1000
                        ? "disabled"
                        : ""
                      : ""
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
                        : "status-light gray"
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
                      ).replace("NaN", "0 ")
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
      <div className={showDetailedView ? "hide" : "timetable-wrapper"}>
        <h1>Timetable</h1>
        {isLoaded === true
          ? res !== undefined
            ? res.map((e, index) => (
                  e.tripUpdate.trip.scheduleRelationship !== "CANCELED" ?
                <div className="timetable-item" key={index}>
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
                    ).replace("NaN", "0 ")}
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
                  <h2>
                    {e.tripUpdate.trip.tripId
                      .replace("Train", "Train ")
                      .replace("Saturday", " Saturday")
                      .replace("Sunday", " Sunday")}
                  </h2>
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
                </div> : ""
              ))
            : "No Trains Found"
          : "loading..."}
      </div>
    </>
  );
}

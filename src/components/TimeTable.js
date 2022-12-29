import React, { useEffect, useState } from "react";
import StopData from "../assets/StopData.json";
import RouteData from "../assets/RouteData.json";

export default function TimeTable() {
  const [res, setRes] = useState([]);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("https://marc-api-production.up.railway.app/tripUpdatesAPI")
      .then((res) => res.json())
      .then(
        (result) => {
          console.log(result.entity);
          setIsLoaded(true);
          setRes(result.entity);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  }, []);
  return (
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
          </div>
        ))
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { FaTrain } from "react-icons/fa";
import StopData from "../assets/StopData.json";
import PennLine from "../assets/LineData/Penn.json";
import Brunswick from "../assets/LineData/Brunswick.json";
import FredrickBranch from "../assets/LineData/FredrickBranch.json";
import Camden from "../assets/LineData/Camden.json";

mapboxgl.accessToken =
  "pk.eyJ1IjoicXB4ZGVzaWduIiwiYSI6ImNreHJrMHc3djRtNzIyb29rODhidHd5d2oifQ.HHiNG99FXsJ_GPIO1eFk1w";

export default function Map() {
  const [trains, setTrains] = useState([]);
  const [res, setRes] = useState([]);
  const [tripUpdatesRes, setTripUpdatesRes] = useState([]);
  // map params
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-77.0369);
  const [lat, setLat] = useState(38.9072);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      })
    );
    map.current.addControl(new mapboxgl.NavigationControl());
  });
  async function getData() {
    fetch("https://marc-api-production.up.railway.app/mtaAPI")
      .then((r) => r.json())
      .then((r2) => setRes(r2))
      .catch((err) => err);
  }
  async function getTripUpdatesData() {
    fetch("https://marc-api-production.up.railway.app/TripUpdatesAPI")
      .then((r) => r.json())
      .then((r2) => setTripUpdatesRes(r2))
      .catch((err) => err);
  }
  //
  // populate maps with stop and line data
  useEffect(() => {
    getData();
    getTripUpdatesData();
    StopData.map((stop) => {
      const latitude = stop.stop_lat;
      const longitude = stop.stop_lon;
      new mapboxgl.Marker({
        color: "#004D93",
      })
        .setLngLat([longitude, latitude])
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
          }) // add popups
            .setHTML(
              `<div class="stopPopup"><h1 class="stopName">${toTitleCase(
                stop.stop_name
              )}</h1></div>`
            )
        )
        .addTo(map.current);
    });
    // generate coordinates
    var penn_coordinates = [];
    var brunswick_coordinates = [];
    var camden_coordinates = [];
    var fredrick_coordinates = [];
    PennLine.forEach((element, index) => {
      var tmp = [element.shape_pt_lon, element.shape_pt_lat];
      penn_coordinates.push(tmp);
    });
    Brunswick.forEach((element, index) => {
      var tmp = [element.shape_pt_lon, element.shape_pt_lat];
      brunswick_coordinates.push(tmp);
    });
    Camden.forEach((element, index) => {
      var tmp = [element.shape_pt_lon, element.shape_pt_lat];
      camden_coordinates.push(tmp);
    });
    FredrickBranch.forEach((element, index) => {
      var tmp = [element.shape_pt_lon, element.shape_pt_lat];
      fredrick_coordinates.push(tmp);
    });
    map.current.on("load", () => {
      // penn
      map.current.addSource("penn", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: penn_coordinates,
          },
        },
      });
      map.current.addSource("camden", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: camden_coordinates,
          },
        },
      });
      map.current.addSource("brunswick", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: brunswick_coordinates,
          },
        },
      });
      map.current.addSource("fredrick", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: fredrick_coordinates,
          },
        },
      });
      map.current.addLayer({
        id: "penn",
        type: "line",
        source: "penn",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#D82A38",
          "line-width": 8,
        },
      });
      map.current.addLayer({
        id: "camden",
        type: "line",
        source: "camden",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#FF5624",
          "line-width": 8,
        },
      });
      map.current.addLayer({
        id: "brunswick",
        type: "line",
        source: "brunswick",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#F0AC1D",
          "line-width": 8,
        },
      });
      map.current.addLayer({
        id: "fredrick",
        type: "line",
        source: "fredrick",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#F0AC1D",
          "line-width": 8,
        },
      });
    });
  }, []);
  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  function formatTime(s) {
    const dtFormat = new Intl.DateTimeFormat("en-US", {
      timeStyle: "short",
      timeZone: "America/New_York",
    });

    return dtFormat.format(new Date(s * 1e3));
  }
  useEffect(() => {
    const interval = setInterval(() => {
      getData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // add trains to map to map
  useEffect(() => {
    if (
      res.length !== 0 &&
      res.entity !== undefined &&
      res !== null &&
      tripUpdatesRes.entity !== undefined
    ) {
      res.entity.map((train) => {
        const latitude = train.vehicle.position.latitude;
        const longitude = train.vehicle.position.longitude;
        const icon = document.createElement("div");
        var result = trains.find(
          (marker) => marker.id === train.vehicle.trip.tripId
        );
        if (result !== undefined && result.length !== 0) {
          result.marker.setLngLat([longitude, latitude]);
          result.marker.setRotation(train.vehicle.position.bearing);
        } else {
          setTrains((current) => [...current, train.vehicle.trip.tripId]);
          icon.className = "marker-icon";
          if (mapboxgl.Marker)
            var marker = new mapboxgl.Marker({
              rotation: train.vehicle.position.bearing,
              element: icon,
            })
              .setLngLat([longitude, latitude])
              .setPopup(
                new mapboxgl.Popup({
                  offset: 25,
                }) // add popups
                  .setHTML(
                    `<div class="trainPopup">
                <h3>${train.vehicle.trip.tripId.replace("Train", "Train ")}</h3>
                <h4>Next Stop: ${
                  StopData.filter(
                    (stop) =>
                      stop.stop_id ==
                      tripUpdatesRes.entity
                        .filter(
                          (trip) =>
                            trip.tripUpdate.trip.tripId ===
                            train.vehicle.trip.tripId
                        )[0]
                        .tripUpdate.stopTimeUpdate.at(-1).stopId
                  )[0].stop_name
                }
                  <h4>Currently: ${
                    tripUpdatesRes.entity
                      .filter(
                        (trip) =>
                          trip.tripUpdate.trip.tripId ===
                          train.vehicle.trip.tripId
                      )[0]
                      .tripUpdate.stopTimeUpdate.at(-1).arrival.delay !==
                    undefined
                      ? Math.abs(
                          Math.round(
                            tripUpdatesRes.entity
                              .filter(
                                (trip) =>
                                  trip.tripUpdate.trip.tripId ===
                                  train.vehicle.trip.tripId
                              )[0]
                              .tripUpdate.stopTimeUpdate.at(-1).arrival.delay /
                              60
                          )
                        ) +
                        (tripUpdatesRes.entity
                          .filter(
                            (trip) =>
                              trip.tripUpdate.trip.tripId ===
                              train.vehicle.trip.tripId
                          )[0]
                          .tripUpdate.stopTimeUpdate.at(-1).arrival.delay === 1
                          ? " Minute"
                          : " Minutes") +
                        (tripUpdatesRes.entity
                          .filter(
                            (trip) =>
                              trip.tripUpdate.trip.tripId ===
                              train.vehicle.trip.tripId
                          )[0]
                          .tripUpdate.stopTimeUpdate.at(-1).arrival.delay >= 0
                          ? " Early"
                          : " Late")
                      : "On Time"
                  }
                  <h4>Arriving at: ${formatTime(
                    tripUpdatesRes.entity
                      .filter(
                        (trip) =>
                          trip.tripUpdate.trip.tripId ===
                          train.vehicle.trip.tripId
                      )[0]
                      .tripUpdate.stopTimeUpdate.at(-1).arrival.time
                  )}</h4>
                  <span class="last-updated" style="margin-left:auto">Last Updated: ${formatTime(
                    tripUpdatesRes.header.timestamp
                  )}</span>
                </div>
                `
                  )
              )
              .addTo(map.current);
          setTrains((current) => [
            ...current,
            {
              id: train.vehicle.trip.tripId,
              marker,
            },
          ]);
        }
      });
    }
  }, [res]);
  return <div className="map-container" ref={mapContainer} />;
}
